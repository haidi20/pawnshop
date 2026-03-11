import { authPortalUsersDao } from '@feature/auth_portal/data/db';
import { readAuthPortalStoredSession } from '@feature/auth_portal/util/auth_portal_session';
import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { branchesDao, storageLocationsDao, type BranchesRow, type StorageLocationsRow } from '@feature/master_branch/data/db';
import { createMasterBranchDataFromRows } from '@feature/master_branch/data/mappers/master_branch.mapper';
import type {
    MasterBranchDataModel,
    MasterBranchUpsertPayloadModel,
    MasterLocationUpsertPayloadModel
} from '@feature/master_branch/domain/models';

const normalizeValue = (value: string | null | undefined): string => value?.trim() ?? '';
const asOptionalValue = (value: string | null | undefined): string | null => {
    const trimmedValue = normalizeValue(value);
    return trimmedValue.length > 0 ? trimmedValue : null;
};
const createTimestamp = (): string => new Date().toISOString();
const nextNumericId = <TRow extends { id: number }>(rows: TRow[]): number =>
    rows.reduce((maxId, row) => Math.max(maxId, row.id), 0) + 1;
const normalizeIdentity = (value: string | null | undefined): string => normalizeValue(value).toLowerCase();

export class MasterBranchLocalDatasource {
    async getData(): Promise<MasterBranchDataModel> {
        const [
            branchesRows,
            storageLocationsRows
        ] = await Promise.all([
            branchesDao.getAll(),
            storageLocationsDao.getAll()
        ]);

        return createMasterBranchDataFromRows({
            module: getAppModuleByKey('master-branch'),
            branchesRows,
            storageLocationsRows,
        });
    }

    async saveBranch(payload: MasterBranchUpsertPayloadModel): Promise<void> {
        this.assertOwnerSession();

        const rows = await branchesDao.getAll();
        const timestamp = createTimestamp();
        const branchCode = normalizeValue(payload.branchCode);
        const branchName = normalizeValue(payload.branchName);
        const branchNumber = asOptionalValue(payload.branchNumber);

        if (!branchCode) {
            throw new Error('Kode cabang wajib diisi.');
        }

        if (!branchName) {
            throw new Error('Nama cabang wajib diisi.');
        }

        const currentRow = typeof payload.id === 'number' ? rows.find((item) => item.id === payload.id) ?? null : null;
        if (typeof payload.id === 'number' && !currentRow) {
            throw new Error('Cabang tidak ditemukan.');
        }

        this.assertUniqueBranch(rows, {
            id: payload.id,
            branchCode,
            branchNumber
        });

        const nextRow: BranchesRow = {
            id: currentRow?.id ?? nextNumericId(rows),
            company_id: currentRow?.company_id ?? null,
            branch_code: branchCode,
            branch_number: branchNumber,
            branch_name: branchName,
            phone_number: asOptionalValue(payload.phoneNumber),
            address: asOptionalValue(payload.address),
            is_active: payload.isActive ? 1 : 0,
            created_at: currentRow?.created_at ?? timestamp,
            updated_at: timestamp
        };

        const nextRows = currentRow
            ? rows.map((item) => (item.id === nextRow.id ? nextRow : item))
            : [...rows, nextRow];

        await branchesDao.replaceAll(nextRows);
    }

    async deleteBranch(branchId: number): Promise<void> {
        const session = this.assertOwnerSession();
        const [branchRows, locationRows, authUserRows] = await Promise.all([
            branchesDao.getAll(),
            storageLocationsDao.getAll(),
            authPortalUsersDao.getAll()
        ]);

        const targetRow = branchRows.find((item) => item.id === branchId);
        if (!targetRow) {
            throw new Error('Cabang tidak ditemukan.');
        }

        if (locationRows.some((item) => item.branch_id === branchId)) {
            throw new Error('Cabang masih dipakai oleh lokasi penyimpanan. Hapus atau pindahkan lokasinya dulu.');
        }

        if (
            authUserRows.some(
                (item) => item.company_id === session.company.id && item.assigned_branch_id === branchId
            )
        ) {
            throw new Error('Cabang masih dipakai assignment user. Pindahkan akses user dulu sebelum menghapus.');
        }

        await branchesDao.remove(branchId);
    }

    async saveLocation(payload: MasterLocationUpsertPayloadModel): Promise<void> {
        this.assertOwnerSession();

        const [locationRows, branchRows] = await Promise.all([
            storageLocationsDao.getAll(),
            branchesDao.getAll()
        ]);

        const timestamp = createTimestamp();
        const locationCode = normalizeValue(payload.locationCode);
        const locationName = normalizeValue(payload.locationName);
        const locationType = normalizeValue(payload.locationType);

        if (!Number.isFinite(payload.branchId)) {
            throw new Error('Cabang lokasi wajib dipilih.');
        }

        if (!branchRows.some((item) => item.id === payload.branchId)) {
            throw new Error('Cabang untuk lokasi ini tidak ditemukan.');
        }

        if (!locationCode) {
            throw new Error('Kode lokasi wajib diisi.');
        }

        if (!locationName) {
            throw new Error('Nama lokasi wajib diisi.');
        }

        if (!locationType) {
            throw new Error('Tipe lokasi wajib diisi.');
        }

        const currentRow =
            typeof payload.id === 'number' ? locationRows.find((item) => item.id === payload.id) ?? null : null;
        if (typeof payload.id === 'number' && !currentRow) {
            throw new Error('Lokasi penyimpanan tidak ditemukan.');
        }

        this.assertUniqueLocation(locationRows, {
            id: payload.id,
            locationCode
        });

        const nextRow: StorageLocationsRow = {
            id: currentRow?.id ?? nextNumericId(locationRows),
            company_id: currentRow?.company_id ?? null,
            branch_id: payload.branchId,
            location_code: locationCode,
            location_name: locationName,
            location_type: locationType,
            is_active: payload.isActive ? 1 : 0,
            created_at: currentRow?.created_at ?? timestamp,
            updated_at: timestamp
        };

        const nextRows = currentRow
            ? locationRows.map((item) => (item.id === nextRow.id ? nextRow : item))
            : [...locationRows, nextRow];

        await storageLocationsDao.replaceAll(nextRows);
    }

    async deleteLocation(locationId: number): Promise<void> {
        this.assertOwnerSession();

        const deleted = await storageLocationsDao.remove(locationId);
        if (!deleted) {
            throw new Error('Lokasi penyimpanan tidak ditemukan.');
        }
    }

    private assertOwnerSession() {
        const session = readAuthPortalStoredSession();

        if (!session) {
            throw new Error('Sesi login tidak ditemukan.');
        }

        if (session.user.role !== 'owner') {
            throw new Error('Hanya owner yang dapat mengelola data perusahaan ini.');
        }

        return session;
    }

    private assertUniqueBranch(
        rows: BranchesRow[],
        input: { id?: number; branchCode: string; branchNumber: string | null }
    ): void {
        if (
            rows.some(
                (item) => item.id !== input.id && normalizeIdentity(item.branch_code) === normalizeIdentity(input.branchCode)
            )
        ) {
            throw new Error('Kode cabang sudah dipakai. Gunakan kode lain.');
        }

        if (
            input.branchNumber &&
            rows.some(
                (item) =>
                    item.id !== input.id &&
                    normalizeIdentity(item.branch_number) === normalizeIdentity(input.branchNumber)
            )
        ) {
            throw new Error('Nomor cabang sudah dipakai. Gunakan nomor lain.');
        }
    }

    private assertUniqueLocation(rows: StorageLocationsRow[], input: { id?: number; locationCode: string }): void {
        if (
            rows.some(
                (item) =>
                    item.id !== input.id &&
                    normalizeIdentity(item.location_code) === normalizeIdentity(input.locationCode)
            )
        ) {
            throw new Error('Kode lokasi sudah dipakai. Gunakan kode lain.');
        }
    }
}
