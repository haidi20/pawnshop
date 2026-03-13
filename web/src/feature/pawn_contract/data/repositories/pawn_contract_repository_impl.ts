import { left, right, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import { PawnContractIndexLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_index_local_datasource';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { branchCashAccountsDao, branchCashTransactionsDao } from '@feature/branch_finance/data/db';
import { customerContactsDao, customerDocumentsDao, customersDao } from '@feature/customer/data/db';
import { branchItemSettingsDao, itemCategoriesDao, itemTypesDao } from '@feature/item_master/data/db';
import { branchesDao } from '@feature/master_branch/data/db';
import {
    pawnContractsDao,
    pawnItemAccessoriesDao,
    pawnItemIssuesDao,
    pawnItemLocationMovementsDao,
    pawnItemsDao
} from '@feature/pawn_contract/data/db';
import { PawnContractLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_local_datasource';
import { ensurePawnContractDemoDataSeed } from '@feature/pawn_contract/data/seeders/pawn_contract_demo_data.seeder';
import type {
    GetPawnContractAjtTableParamsModel,
    PawnContractDataFilterModel,
    PawnContractDataModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel,
    GetPawnContractIndexTabsParamsModel,
    GetPawnContractLocationTableParamsModel,
    GetPawnContractMaintenanceTableParamsModel,
    GetPawnContractNasabahTableParamsModel,
    GetPawnContractRingkasanTableParamsModel,
    GetPawnContractSettlementTableParamsModel,
    PawnContractAjtTableModel,
    PawnContractAjtTypeModel,
    PawnContractIndexTabModel,
    PawnContractLocationTableModel,
    PawnContractLocationTabModel,
    PawnContractMaintenanceTableModel,
    PawnContractNasabahTabKeyModel,
    PawnContractNasabahTableModel,
    PawnContractRingkasanTableModel,
    PawnContractSettlementTableModel,
    PawnContractSettlementTypeModel,
    PawnContractSummaryModel,
    PawnContractTableOptionModel,
    SavePawnContractPayloadModel,
    SavePawnContractResultModel,
    GuideItemTypeSeed,
    PawnContractItemKindModel,
    PawnContractItemPresetModel,
    PawnContractActionOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractStatusModel } from '@core/util/helpers';

const pawnContractFeatureDaos = [
    pawnContractsDao,
    pawnItemsDao,
    pawnItemAccessoriesDao,
    pawnItemIssuesDao,
    pawnItemLocationMovementsDao
];

const pawnContractDataDaos = [
    ...pawnContractFeatureDaos,
    branchesDao,
    branchCashAccountsDao,
    customersDao,
    customerContactsDao,
    customerDocumentsDao
];

const pawnContractFormDaos = [
    ...pawnContractDataDaos,
    branchCashTransactionsDao,
    itemCategoriesDao,
    itemTypesDao,
    branchItemSettingsDao
];

export class PawnContractRepositoryImpl implements PawnContractRepository {
    constructor(
        private readonly localDataSource: PawnContractLocalDatasource,
        private readonly indexLocalDataSource: PawnContractIndexLocalDatasource
    ) {}

    /**
     * Mengambil data operasional gadai (branch, status, dll) dari database lokal.
     * Secara otomatis menjalankan seeder demo data jika database masih kosong.
     */
    async getData(filters?: PawnContractDataFilterModel): Promise<Either<Error, PawnContractDataModel>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractDataDaos);

            return right(await this.localDataSource.getData(filters));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Mengambil ringkasan data satu kontrak berdasarkan ID untuk keperluan history.
     */
    async getHistorySummaryById(contractId: number): Promise<Either<Error, PawnContractSummaryModel | null>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractDataDaos);

            const data = await this.localDataSource.getDataByContractId(contractId);
            if (!data) {
                return right(null);
            }

            // Use default running statuses for single look-up
            const runningStatuses = new Set<PawnContractStatusModel>(['active', 'extended']);
            return right(this.indexLocalDataSource.getContractSummaries({
                data,
                runningContractStatuses: runningStatuses,
                getAvailableActions: () => []
            })[0] ?? null);
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Mengambil data referensi untuk pengisian formulir akad gadai baru
     * (cabang, nasabah, akun kas, kategori barang, dll).
     */
    async getFormReferenceData(params: {
        guideItemTypeSeeds: GuideItemTypeSeed[];
        itemPresetMeta: Record<
            PawnContractItemKindModel,
            Pick<PawnContractItemPresetModel, 'label' | 'description' | 'administrationFeeAmount' | 'detailLabels'>
        >;
    }): Promise<Either<Error, PawnContractFormReferenceModel>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
            return right(await this.localDataSource.getFormReferenceData(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Mengambil nilai existing dari sebuah kontrak untuk keperluan edit formulir.
     */
    async getFormValue(params: {
        contractId: number;
        guideItemTypeSeeds: GuideItemTypeSeed[];
    }): Promise<Either<Error, PawnContractFormValueModel>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
            return right(await this.localDataSource.getFormValue(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Menyimpan data kontrak baru atau pembaruan kontrak ke database lokal.
     */
    async saveContract(params: {
        payload: SavePawnContractPayloadModel;
        guideItemTypeSeeds: GuideItemTypeSeed[];
    }): Promise<Either<Error, SavePawnContractResultModel>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
            return right(await this.localDataSource.saveContract(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Menyusun data ringkasan kontrak (summaries) dari raw data database
     * untuk keperluan tampilan tabel-tabel di halaman index.
     */
    getContractSummaries(params: {
        data: PawnContractDataModel | null;
        runningContractStatuses: Set<PawnContractStatusModel>;
        getAvailableActions: (params: { contractStatus: string; daysToMaturity: number }) => PawnContractActionOptionModel[];
    }): Either<Error, PawnContractSummaryModel[]> {
        try {
            return right(this.indexLocalDataSource.getContractSummaries(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Menyusun data untuk tabel tab "Nasabah Gadai", membagi kontrak
     * berdasarkan kategori tab nasabah (Semua, Harian, 7 Hari, dll).
     */
    getNasabahTable(
        params: GetPawnContractNasabahTableParamsModel & {
            nasabahTabs: Array<Omit<PawnContractTableOptionModel<PawnContractNasabahTabKeyModel>, 'count'>>;
        }
    ): Either<Error, PawnContractNasabahTableModel> {
        try {
            return right(this.indexLocalDataSource.getNasabahTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Menyusun data untuk tabel tab "Ringkasan Harian", mencakup metrik
     * operasional dan ringkasan pendapatan harian.
     */
    getRingkasanTable(
        params: GetPawnContractRingkasanTableParamsModel
    ): Either<Error, PawnContractRingkasanTableModel> {
        try {
            return right(this.indexLocalDataSource.getRingkasanTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Menyusun data untuk tabel tab "Gadai Jatuh Tempo" (AJT), memfilter
     * berdasarkan jenis jatuh tempo (tenor tertentu atau tertunggak).
     */
    getAjtTable(params: GetPawnContractAjtTableParamsModel & {
        ajtOptions: Array<Omit<PawnContractTableOptionModel<PawnContractAjtTypeModel>, 'count'>>;
    }): Either<Error, PawnContractAjtTableModel> {
        try {
            return right(this.indexLocalDataSource.getAjtTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Menyusun data untuk tabel tab "Pelunasan & Lelang" (Legacy/Gabungan),
     * memfilter berdasarkan tipe (lunas, lelang, atau refund).
     */
    getSettlementTable(
        params: GetPawnContractSettlementTableParamsModel & {
            settlementOptions: Array<Omit<PawnContractTableOptionModel<PawnContractSettlementTypeModel>, 'count'>>;
        }
    ): Either<Error, PawnContractSettlementTableModel> {
        try {
            return right(this.indexLocalDataSource.getSettlementTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Mengambil data khusus untuk tabel tab "Lunas" (Redeemed/Closed).
     */
    getRedeemedTable(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel> {
        try {
            return right(this.indexLocalDataSource.getRedeemedTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Mengambil data khusus untuk tabel tab "Lelang" (Auctioned).
     */
    getAuctionTable(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel> {
        try {
            return right(this.indexLocalDataSource.getAuctionTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Mengambil data khusus untuk tabel tab "Refund" (Cancelled).
     */
    getRefundTable(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel> {
        try {
            return right(this.indexLocalDataSource.getRefundTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Menyusun data untuk tabel tab "Lokasi / Distribusi", memantau keberadaan
     * fisik barang jaminan di kantor, gudang, atau dalam proses mutasi.
     */
    getLocationTable(
        params: GetPawnContractLocationTableParamsModel & {
            locationOptions: Array<Omit<PawnContractTableOptionModel<PawnContractLocationTabModel>, 'count'>>;
        }
    ): Either<Error, PawnContractLocationTableModel> {
        try {
            return right(this.indexLocalDataSource.getLocationTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Menyusun data untuk tabel tab "Maintenance", mengawasi kontrak yang
     * memerlukan inspeksi atau pemeliharaan berkala.
     */
    getMaintenanceTable(
        params: GetPawnContractMaintenanceTableParamsModel
    ): Either<Error, PawnContractMaintenanceTableModel> {
        try {
            return right(this.indexLocalDataSource.getMaintenanceTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    /**
     * Mengambil konfigurasi tab index gadai beserta jumlah baris (badge count)
     * untuk masing-masing kategori tab.
     */
    getIndexTabs(params: GetPawnContractIndexTabsParamsModel & {
        indexTabs: Array<Omit<PawnContractIndexTabModel, 'count'>>;
    }): Either<Error, PawnContractIndexTabModel[]> {
        try {
            return right(this.indexLocalDataSource.getIndexTabs(params));
        } catch (error) {
            return left(toError(error));
        }
    }
}
