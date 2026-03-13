import { v4 as uuidv4 } from 'uuid';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import {
    authPortalCompaniesDao,
    authPortalSessionsDao,
    authPortalUsersDao,
    type AuthPortalCompaniesRow,
    type AuthPortalSessionsRow,
    type AuthPortalUsersRow
} from '@feature/auth_portal/data/db';
import {
    hashAuthPortalPassword,
    verifyAuthPortalPassword
} from '@feature/auth_portal/data/helpers/auth_portal_password';
import { buildAuthPortalDemoSeedDataset } from '@feature/auth_portal/data/seeders/auth_portal_demo_data.seeder';
import { branchesDao } from '@feature/master_branch/data/db';
import {
    getDelegatedBranchIds,
    syncDelegatedBranches
} from '@feature/master_branch/data/helpers/branch_assignment_activation';
import type {
    AuthPortalCompanyUsersDataModel,
    AuthPortalLoginPayloadModel,
    AuthPortalRegisterPayloadModel,
    AuthPortalSessionSnapshotModel,
    AuthPortalUpdateCompanyPayloadModel,
    AuthPortalUpdateProfilePayloadModel,
    AuthPortalUpdateUserBranchPayloadModel,
    AuthPortalUserRoleModel
} from '@feature/auth_portal/domain/models';
import {
    clearAuthPortalStoredSession,
    readCompanyAssignedBranchName,
    readAuthPortalStoredSession,
    writeAuthPortalStoredSession
} from '@feature/auth_portal/util/auth_portal_session';

const normalizeValue = (value: string | null | undefined): string => value?.trim() ?? '';
const normalizeIdentity = (value: string | null | undefined): string => normalizeValue(value).toLowerCase();
const createTimestamp = (): string => new Date().toISOString();
const nextNumericId = <TRow extends { id: number }>(rows: TRow[]): number =>
    rows.reduce((maxId, row) => Math.max(maxId, row.id), 0) + 1;

const asOptionalValue = (value: string | null | undefined): string | null => {
    const trimmedValue = normalizeValue(value);
    return trimmedValue.length > 0 ? trimmedValue : null;
};

export class AuthPortalLocalDatasource {
    async getCurrentSession(): Promise<AuthPortalSessionSnapshotModel | null> {
        await this.ensureDemoDataSeeded();

        const storedSession = readAuthPortalStoredSession();
        if (!storedSession) {
            return null;
        }

        const [sessionRows, userRows, companyRows] = await Promise.all([
            authPortalSessionsDao.getAll(),
            authPortalUsersDao.getAll(),
            authPortalCompaniesDao.getAll()
        ]);

        const sessionRow = sessionRows.find((item) =>
            item.session_token === storedSession.sessionToken && item.session_status === 'active'
        );

        if (!sessionRow) {
            clearAuthPortalStoredSession();
            return null;
        }

        const userRow = userRows.find((item) => item.id === sessionRow.user_id && item.is_active === 1);
        const companyRow = companyRows.find((item) => item.id === sessionRow.company_id);

        if (!userRow || !companyRow) {
            clearAuthPortalStoredSession();
            return null;
        }

        await seedFeatureTablesIfEmpty('AuthPortalLocalDatasource', [branchesDao]);
        await this.ensureDelegatedBranchesActive(companyRow.id, userRows);

        const snapshot = this.buildSessionSnapshot(sessionRow, userRow, companyRow);
        writeAuthPortalStoredSession(snapshot);
        return snapshot;
    }

    async login(payload: AuthPortalLoginPayloadModel): Promise<AuthPortalSessionSnapshotModel> {
        await this.ensureDemoDataSeeded();

        const credential = normalizeIdentity(payload.credential);
        const password = normalizeValue(payload.password);

        if (!credential || !password) {
            throw new Error('Username/email dan password wajib diisi.');
        }

        const [userRows, companyRows, sessionRows] = await Promise.all([
            authPortalUsersDao.getAll(),
            authPortalCompaniesDao.getAll(),
            authPortalSessionsDao.getAll()
        ]);

        const userRow = userRows.find((item) =>
            normalizeIdentity(item.username) === credential || normalizeIdentity(item.email) === credential
        );

        if (!userRow || userRow.is_active !== 1 || !verifyAuthPortalPassword(password, userRow.password_hash)) {
            throw new Error('Kredensial tidak valid.');
        }

        const companyRow = companyRows.find((item) => item.id === userRow.company_id);
        if (!companyRow) {
            throw new Error('Data perusahaan untuk akun ini tidak ditemukan.');
        }

        const updatedSessionRows = this.closeStoredSessionIfNeeded(sessionRows);
        const timestamp = createTimestamp();
        const sessionRow: AuthPortalSessionsRow = {
            id: nextNumericId(updatedSessionRows),
            company_id: companyRow.id,
            user_id: userRow.id,
            session_token: uuidv4(),
            login_at: timestamp,
            logout_at: null,
            session_status: 'active',
            created_at: timestamp,
            updated_at: timestamp
        };

        updatedSessionRows.push(sessionRow);
        await authPortalSessionsDao.replaceAll(updatedSessionRows);

        const snapshot = this.buildSessionSnapshot(sessionRow, userRow, companyRow);
        writeAuthPortalStoredSession(snapshot);
        return snapshot;
    }

    async register(payload: AuthPortalRegisterPayloadModel): Promise<AuthPortalSessionSnapshotModel> {
        await this.ensureDemoDataSeeded();
        this.validateRegisterPayload(payload);

        const [companyRows, userRows, sessionRows] = await Promise.all([
            authPortalCompaniesDao.getAll(),
            authPortalUsersDao.getAll(),
            authPortalSessionsDao.getAll()
        ]);

        this.assertIdentityUniqueness(userRows, payload.ownerUsername, payload.ownerEmail, 'akun utama');
        payload.employees.forEach((employee, index) => {
            this.assertIdentityUniqueness(userRows, employee.username, employee.email, `user karyawan ${index + 1}`);
        });

        this.assertPayloadDuplicateIdentities(payload);

        const timestamp = createTimestamp();
        const companyId = nextNumericId(companyRows);
        const ownerUserId = nextNumericId(userRows);
        const companyRow: AuthPortalCompaniesRow = {
            id: companyId,
            company_id: companyId,
            name: normalizeValue(payload.companyName),
            legal_name: asOptionalValue(payload.legalName),
            business_type: asOptionalValue(payload.businessType),
            email: asOptionalValue(payload.companyEmail),
            phone_number: asOptionalValue(payload.companyPhoneNumber),
            city: asOptionalValue(payload.city),
            address: asOptionalValue(payload.address),
            created_at: timestamp,
            updated_at: timestamp
        };

        const ownerUserRow = this.buildUserRow({
            id: ownerUserId,
            companyId,
            role: 'owner',
            assignedBranchId: null,
            fullName: payload.ownerFullName,
            username: payload.ownerUsername,
            email: payload.ownerEmail,
            phoneNumber: payload.ownerPhoneNumber,
            password: payload.password,
            timestamp
        });

        const employeeRows = payload.employees.map((employee, index) =>
            this.buildUserRow({
                id: ownerUserId + index + 1,
                companyId,
                role: employee.role,
                assignedBranchId: null,
                fullName: employee.fullName,
                username: employee.username,
                email: employee.email,
                phoneNumber: employee.phoneNumber,
                password: employee.password,
                timestamp
            })
        );

        await authPortalCompaniesDao.replaceAll([...companyRows, companyRow]);
        await authPortalUsersDao.replaceAll([...userRows, ownerUserRow, ...employeeRows]);

        const updatedSessionRows = this.closeStoredSessionIfNeeded(sessionRows);
        const sessionRow: AuthPortalSessionsRow = {
            id: nextNumericId(updatedSessionRows),
            company_id: companyId,
            user_id: ownerUserId,
            session_token: uuidv4(),
            login_at: timestamp,
            logout_at: null,
            session_status: 'active',
            created_at: timestamp,
            updated_at: timestamp
        };

        updatedSessionRows.push(sessionRow);
        await authPortalSessionsDao.replaceAll(updatedSessionRows);

        const snapshot = this.buildSessionSnapshot(sessionRow, ownerUserRow, companyRow);
        writeAuthPortalStoredSession(snapshot);
        return snapshot;
    }

    async updateCompany(payload: AuthPortalUpdateCompanyPayloadModel): Promise<AuthPortalSessionSnapshotModel> {
        await this.ensureDemoDataSeeded();

        const session = await this.getCurrentSession();
        if (!session) {
            throw new Error('Sesi login tidak ditemukan.');
        }

        if (session.user.role !== 'owner') {
            throw new Error('Hanya owner yang dapat mengubah profil perusahaan.');
        }

        const normalizedName = normalizeValue(payload.name);
        if (!normalizedName) {
            throw new Error('Nama perusahaan wajib diisi.');
        }

        const [companyRows, userRows, sessionRows] = await Promise.all([
            authPortalCompaniesDao.getAll(),
            authPortalUsersDao.getAll(),
            authPortalSessionsDao.getAll()
        ]);

        const companyRow = companyRows.find((item) => item.id === session.company.id);
        const currentUserRow = userRows.find(
            (item) => item.id === session.user.id && item.company_id === session.company.id
        );
        const currentSessionRow = sessionRows.find(
            (item) => item.session_token === session.sessionToken && item.session_status === 'active'
        );

        if (!companyRow || !currentUserRow || !currentSessionRow) {
            throw new Error('Data perusahaan aktif tidak ditemukan.');
        }

        const timestamp = createTimestamp();
        const updatedCompanyRow: AuthPortalCompaniesRow = {
            ...companyRow,
            name: normalizedName,
            legal_name: asOptionalValue(payload.legalName),
            business_type: asOptionalValue(payload.businessType),
            email: asOptionalValue(payload.email),
            phone_number: asOptionalValue(payload.phoneNumber),
            city: asOptionalValue(payload.city),
            address: asOptionalValue(payload.address),
            updated_at: timestamp
        };

        await authPortalCompaniesDao.replaceAll(
            companyRows.map((item) => (item.id === updatedCompanyRow.id ? updatedCompanyRow : item))
        );

        const snapshot = this.buildSessionSnapshot(currentSessionRow, currentUserRow, updatedCompanyRow);
        writeAuthPortalStoredSession(snapshot);
        return snapshot;
    }

    async updateProfile(payload: AuthPortalUpdateProfilePayloadModel): Promise<AuthPortalSessionSnapshotModel> {
        await this.ensureDemoDataSeeded();

        const session = await this.getCurrentSession();
        if (!session) {
            throw new Error('Sesi login tidak ditemukan.');
        }

        const normalizedFullName = normalizeValue(payload.fullName);
        const normalizedUsername = normalizeValue(payload.username);

        if (!normalizedFullName) {
            throw new Error('Nama lengkap wajib diisi.');
        }

        if (!normalizedUsername) {
            throw new Error('Username wajib diisi.');
        }

        const [companyRows, userRows, sessionRows] = await Promise.all([
            authPortalCompaniesDao.getAll(),
            authPortalUsersDao.getAll(),
            authPortalSessionsDao.getAll()
        ]);

        const companyRow = companyRows.find((item) => item.id === session.company.id);
        const currentUserRow = userRows.find(
            (item) => item.id === session.user.id && item.company_id === session.company.id
        );
        const currentSessionRow = sessionRows.find(
            (item) => item.session_token === session.sessionToken && item.session_status === 'active'
        );

        if (!companyRow || !currentUserRow || !currentSessionRow) {
            throw new Error('Data profil aktif tidak ditemukan.');
        }

        this.assertIdentityUniqueness(
            userRows.filter((item) => item.id !== currentUserRow.id),
            normalizedUsername,
            payload.email,
            'profil user'
        );

        const timestamp = createTimestamp();
        const updatedUserRow: AuthPortalUsersRow = {
            ...currentUserRow,
            username: normalizedUsername,
            full_name: normalizedFullName,
            email: asOptionalValue(payload.email),
            phone_number: asOptionalValue(payload.phoneNumber),
            updated_at: timestamp
        };

        await authPortalUsersDao.replaceAll(
            userRows.map((item) => (item.id === updatedUserRow.id ? updatedUserRow : item))
        );

        const snapshot = this.buildSessionSnapshot(currentSessionRow, updatedUserRow, companyRow);
        writeAuthPortalStoredSession(snapshot);
        return snapshot;
    }

    async logout(): Promise<void> {
        const storedSession = readAuthPortalStoredSession();
        if (!storedSession) {
            return;
        }

        const sessionRows = await authPortalSessionsDao.getAll();
        const updatedRows = this.closeSessionByToken(sessionRows, storedSession.sessionToken);
        await authPortalSessionsDao.replaceAll(updatedRows);
        clearAuthPortalStoredSession();
    }

    async getCompanyUsers(): Promise<AuthPortalCompanyUsersDataModel> {
        await this.ensureDemoDataSeeded();
        await seedFeatureTablesIfEmpty('AuthPortalLocalDatasource', [branchesDao]);

        const session = await this.getCurrentSession();
        if (!session) {
            throw new Error('Sesi login tidak ditemukan.');
        }

        if (session.user.role !== 'owner') {
            throw new Error('Hanya owner yang dapat mengelola pengguna.');
        }

        const [userRows, branchRows] = await Promise.all([
            authPortalUsersDao.getAll(),
            branchesDao.getAll()
        ]);

        const sortedBranchRows = branchRows
            .sort((left, right) => left.branch_name.localeCompare(right.branch_name, 'id-ID'));

        const companyUsers = userRows
            .filter((item) => item.company_id === session.company.id)
            .sort((left, right) => {
                if (left.role === 'owner' && right.role !== 'owner') {
                    return -1;
                }

                if (left.role !== 'owner' && right.role === 'owner') {
                    return 1;
                }

                return left.full_name.localeCompare(right.full_name, 'id-ID');
            });

        return {
            companyId: session.company.id,
            companyName: session.company.name,
            branches: sortedBranchRows.map((item) => ({
                id: item.id,
                branchCode: item.branch_code,
                branchName: item.branch_name,
                isActive: item.is_active === 1
            })),
            users: companyUsers.map((item) => ({
                id: item.id,
                role: item.role as AuthPortalUserRoleModel,
                fullName: item.full_name,
                username: item.username,
                email: item.email,
                phoneNumber: item.phone_number,
                isActive: item.is_active === 1,
                assignedBranchId: item.assigned_branch_id ?? null,
                assignedBranchName:
                    sortedBranchRows.find((branch) => branch.id === (item.assigned_branch_id ?? null))?.branch_name ??
                    null
            }))
        };
    }

    async updateUserBranchAssignment(payload: AuthPortalUpdateUserBranchPayloadModel): Promise<void> {
        await this.ensureDemoDataSeeded();
        await seedFeatureTablesIfEmpty('AuthPortalLocalDatasource', [branchesDao]);

        const session = await this.getCurrentSession();
        if (!session) {
            throw new Error('Sesi login tidak ditemukan.');
        }

        if (session.user.role !== 'owner') {
            throw new Error('Hanya owner yang dapat mengubah assignment cabang user.');
        }

        const [userRows, branchRows] = await Promise.all([
            authPortalUsersDao.getAll(),
            branchesDao.getAll()
        ]);

        const targetUser = userRows.find(
            (item) => item.id === payload.userId && item.company_id === session.company.id
        );

        if (!targetUser) {
            throw new Error('Pengguna tidak ditemukan.');
        }

        if (targetUser.role === 'owner') {
            throw new Error('Owner selalu memiliki akses ke semua cabang.');
        }

        const nextBranchId = typeof payload.branchId === 'number' ? payload.branchId : null;
        if (nextBranchId !== null && !branchRows.some((item) => item.id === nextBranchId)) {
            throw new Error('Cabang yang dipilih tidak ditemukan.');
        }

        const timestamp = createTimestamp();
        const updatedRows = userRows.map((item) =>
            item.id === targetUser.id
                ? {
                    ...item,
                    assigned_branch_id: nextBranchId,
                    updated_at: timestamp
                }
                : item
        );

        await authPortalUsersDao.replaceAll(updatedRows);
        await this.ensureDelegatedBranchesActive(session.company.id, updatedRows);

        const storedSession = readAuthPortalStoredSession();
        if (storedSession?.user.id === targetUser.id) {
            writeAuthPortalStoredSession({
                ...storedSession,
                user: {
                    ...storedSession.user,
                    assignedBranchId: nextBranchId,
                    assignedBranchName:
                        branchRows.find((item) => item.id === nextBranchId)?.branch_name ?? null
                }
            });
        }
    }

    private async ensureDemoDataSeeded(): Promise<void> {
        const [companyRows, userRows, sessionRows] = await Promise.all([
            authPortalCompaniesDao.getAll(),
            authPortalUsersDao.getAll(),
            authPortalSessionsDao.getAll()
        ]);

        if (companyRows.length > 0 || userRows.length > 0 || sessionRows.length > 0) {
            return;
        }

        const dataset = buildAuthPortalDemoSeedDataset();

        await authPortalCompaniesDao.replaceAll(dataset.companies);
        await authPortalUsersDao.replaceAll(dataset.users);
        await authPortalSessionsDao.replaceAll(dataset.sessions);
    }

    private buildUserRow(input: {
        id: number;
        companyId: number;
        role: AuthPortalUserRoleModel;
        assignedBranchId?: number | null;
        fullName: string;
        username: string;
        email: string | null;
        phoneNumber: string | null;
        password: string;
        timestamp: string;
    }): AuthPortalUsersRow {
        return {
            id: input.id,
            company_id: input.companyId,
            role: input.role,
            assigned_branch_id: input.assignedBranchId ?? null,
            username: normalizeValue(input.username),
            password_hash: hashAuthPortalPassword(input.password),
            full_name: normalizeValue(input.fullName),
            email: asOptionalValue(input.email),
            phone_number: asOptionalValue(input.phoneNumber),
            is_active: 1,
            created_at: input.timestamp,
            updated_at: input.timestamp
        };
    }

    private async ensureDelegatedBranchesActive(
        companyId: number,
        userRows: AuthPortalUsersRow[]
    ): Promise<void> {
        const delegatedBranchIds = getDelegatedBranchIds(userRows, companyId);
        const branchRows = await branchesDao.getAll();
        const { rows, hasChanges } = syncDelegatedBranches({
            branchRows,
            delegatedBranchIds,
            timestamp: createTimestamp()
        });

        if (!hasChanges) {
            return;
        }

        await branchesDao.replaceAll(rows);
    }

    private buildSessionSnapshot(
        sessionRow: AuthPortalSessionsRow,
        userRow: AuthPortalUsersRow,
        companyRow: AuthPortalCompaniesRow
    ): AuthPortalSessionSnapshotModel {
        return {
            sessionToken: sessionRow.session_token,
            loginAt: sessionRow.login_at,
            user: {
                id: userRow.id,
                companyId: userRow.company_id,
                role: userRow.role as AuthPortalUserRoleModel,
                assignedBranchId: userRow.assigned_branch_id ?? null,
                assignedBranchName: readCompanyAssignedBranchName(
                    userRow.company_id,
                    userRow.assigned_branch_id ?? null
                ),
                fullName: userRow.full_name,
                username: userRow.username,
                email: userRow.email,
                phoneNumber: userRow.phone_number
            },
            company: {
                id: companyRow.id,
                name: companyRow.name,
                legalName: companyRow.legal_name,
                businessType: companyRow.business_type,
                email: companyRow.email,
                phoneNumber: companyRow.phone_number,
                city: companyRow.city,
                address: companyRow.address
            }
        };
    }

    private validateRegisterPayload(payload: AuthPortalRegisterPayloadModel): void {
        if (!normalizeValue(payload.ownerFullName)) {
            throw new Error('Nama akun utama wajib diisi.');
        }

        if (!normalizeValue(payload.ownerUsername)) {
            throw new Error('Username akun utama wajib diisi.');
        }

        if (!normalizeValue(payload.ownerEmail)) {
            throw new Error('Email akun utama wajib diisi.');
        }

        if (!normalizeValue(payload.password)) {
            throw new Error('Password akun utama wajib diisi.');
        }

        if (!normalizeValue(payload.companyName)) {
            throw new Error('Nama perusahaan wajib diisi.');
        }

        payload.employees.forEach((employee, index) => {
            const employeeLabel = `user karyawan ${index + 1}`;

            if (!normalizeValue(employee.fullName)) {
                throw new Error(`Nama ${employeeLabel} wajib diisi.`);
            }

            if (!normalizeValue(employee.username)) {
                throw new Error(`Username ${employeeLabel} wajib diisi.`);
            }

            if (!normalizeValue(employee.password)) {
                throw new Error(`Password ${employeeLabel} wajib diisi.`);
            }
        });
    }

    private assertIdentityUniqueness(
        existingUsers: AuthPortalUsersRow[],
        username: string,
        email: string | null,
        entityLabel: string
    ): void {
        const normalizedUsername = normalizeIdentity(username);
        const normalizedEmail = normalizeIdentity(email);

        if (existingUsers.some((item) => normalizeIdentity(item.username) === normalizedUsername)) {
            throw new Error(`Username untuk ${entityLabel} sudah dipakai.`);
        }

        if (normalizedEmail && existingUsers.some((item) => normalizeIdentity(item.email) === normalizedEmail)) {
            throw new Error(`Email untuk ${entityLabel} sudah dipakai.`);
        }
    }

    private assertPayloadDuplicateIdentities(payload: AuthPortalRegisterPayloadModel): void {
        const usernames = new Set<string>();
        const emails = new Set<string>();

        const registerIdentity = (username: string, email: string | null, entityLabel: string): void => {
            const normalizedUsername = normalizeIdentity(username);
            const normalizedEmail = normalizeIdentity(email);

            if (usernames.has(normalizedUsername)) {
                throw new Error(`Username ${entityLabel} duplikat di form registrasi.`);
            }

            usernames.add(normalizedUsername);

            if (normalizedEmail) {
                if (emails.has(normalizedEmail)) {
                    throw new Error(`Email ${entityLabel} duplikat di form registrasi.`);
                }

                emails.add(normalizedEmail);
            }
        };

        registerIdentity(payload.ownerUsername, payload.ownerEmail, 'akun utama');
        payload.employees.forEach((employee, index) => {
            registerIdentity(employee.username, employee.email, `user karyawan ${index + 1}`);
        });
    }

    private closeStoredSessionIfNeeded(sessionRows: AuthPortalSessionsRow[]): AuthPortalSessionsRow[] {
        const storedSession = readAuthPortalStoredSession();
        if (!storedSession) {
            return [...sessionRows];
        }

        return this.closeSessionByToken(sessionRows, storedSession.sessionToken);
    }

    private closeSessionByToken(sessionRows: AuthPortalSessionsRow[], sessionToken: string): AuthPortalSessionsRow[] {
        const timestamp = createTimestamp();

        return sessionRows.map((item) =>
            item.session_token === sessionToken && item.session_status === 'active'
                ? {
                    ...item,
                    session_status: 'closed',
                    logout_at: timestamp,
                    updated_at: timestamp
                }
                : item
        );
    }
}
