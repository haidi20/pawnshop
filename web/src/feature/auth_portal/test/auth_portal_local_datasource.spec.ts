import { beforeEach, describe, expect, test } from 'vitest';

import {
    authPortalCompaniesDao,
    authPortalSessionsDao,
    authPortalUsersDao
} from '@feature/auth_portal/data/db';
import { AuthPortalLocalDatasource } from '@feature/auth_portal/data/datasources/auth_portal_local_datasource';
import {
    clearAuthPortalStoredSession,
    readAuthPortalStoredSession,
    writeAuthPortalStoredSession
} from '@feature/auth_portal/util/auth_portal_session';
import { branchesDao } from '@feature/master_branch/data/db';

describe('auth_portal local datasource', () => {
    beforeEach(async () => {
        localStorage.clear();
        clearAuthPortalStoredSession();

        await authPortalCompaniesDao.replaceAll([]);
        await authPortalUsersDao.replaceAll([]);
        await authPortalSessionsDao.replaceAll([]);

        writeAuthPortalStoredSession(createStoredSessionSnapshot());
        await branchesDao.replaceAll([]);
    });

    test('reactivates delegated branches when restoring the current session', async () => {
        await authPortalCompaniesDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                name: 'Sentra Gadai Nusantara',
                legal_name: 'PT Sentra Gadai Nusantara',
                business_type: 'Pegadaian Swasta',
                email: 'halo@sentragadai.id',
                phone_number: '0541-880101',
                city: 'Samarinda',
                address: 'Jl. Ahmad Yani No. 10',
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        await authPortalUsersDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                role: 'owner',
                assigned_branch_id: null,
                username: 'owner.sgn',
                password_hash: 'hash-owner',
                full_name: 'Rina Maharani',
                email: 'owner@sentragadai.id',
                phone_number: '0811-5400-101',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            },
            {
                id: 2,
                company_id: 1,
                role: 'staff',
                assigned_branch_id: 2,
                username: 'staff.sgn',
                password_hash: 'hash-staff',
                full_name: 'Mita Lestari',
                email: 'staff@sentragadai.id',
                phone_number: '0811-5400-103',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        await authPortalSessionsDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                user_id: 2,
                session_token: 'session-token-1',
                login_at: '2026-03-12T01:00:00.000Z',
                logout_at: null,
                session_status: 'active',
                created_at: '2026-03-12T01:00:00.000Z',
                updated_at: '2026-03-12T01:00:00.000Z'
            }
        ]);

        await branchesDao.replaceAll([
            createBranchRow({
                id: 1,
                branch_code: 'BR-SMD-001',
                branch_number: '001',
                branch_name: 'Pawnshop Samarinda Kota',
                is_active: 1
            }),
            createBranchRow({
                id: 2,
                branch_code: 'BR-SMD-002',
                branch_number: '002',
                branch_name: 'Pawnshop Samarinda Ilir',
                is_active: 0
            })
        ]);

        const datasource = new AuthPortalLocalDatasource();
        const session = await datasource.getCurrentSession();
        const branches = await branchesDao.getAll();

        expect(session?.user.assignedBranchId).toBe(2);
        expect(branches.find((item) => item.id === 2)?.is_active).toBe(1);
    });

    test('syncs branch active flags to the exact number of delegated employee branches', async () => {
        writeAuthPortalStoredSession(createOwnerSessionSnapshot());

        await authPortalCompaniesDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                name: 'Sentra Gadai Nusantara',
                legal_name: 'PT Sentra Gadai Nusantara',
                business_type: 'Pegadaian Swasta',
                email: 'halo@sentragadai.id',
                phone_number: '0541-880101',
                city: 'Samarinda',
                address: 'Jl. Ahmad Yani No. 10',
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        await authPortalUsersDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                role: 'owner',
                assigned_branch_id: null,
                username: 'owner.sgn',
                password_hash: 'hash-owner',
                full_name: 'Rina Maharani',
                email: 'owner@sentragadai.id',
                phone_number: '0811-5400-101',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            },
            {
                id: 2,
                company_id: 1,
                role: 'admin',
                assigned_branch_id: 1,
                username: 'admin.sgn',
                password_hash: 'hash-admin',
                full_name: 'Aldo Pratama',
                email: 'admin@sentragadai.id',
                phone_number: '0811-5400-102',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            },
            {
                id: 3,
                company_id: 1,
                role: 'staff',
                assigned_branch_id: 2,
                username: 'staff.sgn',
                password_hash: 'hash-staff',
                full_name: 'Mita Lestari',
                email: 'staff@sentragadai.id',
                phone_number: '0811-5400-103',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        await authPortalSessionsDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                user_id: 1,
                session_token: 'owner-session-1',
                login_at: '2026-03-12T01:00:00.000Z',
                logout_at: null,
                session_status: 'active',
                created_at: '2026-03-12T01:00:00.000Z',
                updated_at: '2026-03-12T01:00:00.000Z'
            }
        ]);

        await branchesDao.replaceAll([
            createBranchRow({
                id: 1,
                branch_code: 'BR-SMD-001',
                branch_number: '001',
                branch_name: 'Pawnshop Samarinda Kota',
                is_active: 1
            }),
            createBranchRow({
                id: 2,
                branch_code: 'BR-SMD-002',
                branch_number: '002',
                branch_name: 'Pawnshop Samarinda Ilir',
                is_active: 1
            }),
            createBranchRow({
                id: 3,
                branch_code: 'BR-SMD-003',
                branch_number: '003',
                branch_name: 'Pawnshop Samarinda Seberang',
                is_active: 1
            })
        ]);

        const datasource = new AuthPortalLocalDatasource();

        await datasource.getCurrentSession();

        const branches = await branchesDao.getAll();

        expect(branches.filter((item) => item.is_active === 1)).toHaveLength(2);
        expect(branches.find((item) => item.id === 1)?.is_active).toBe(1);
        expect(branches.find((item) => item.id === 2)?.is_active).toBe(1);
        expect(branches.find((item) => item.id === 3)?.is_active).toBe(0);
    });

    test('updates the active user profile and syncs the stored session snapshot', async () => {
        await authPortalCompaniesDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                name: 'Sentra Gadai Nusantara',
                legal_name: 'PT Sentra Gadai Nusantara',
                business_type: 'Pegadaian Swasta',
                email: 'halo@sentragadai.id',
                phone_number: '0541-880101',
                city: 'Samarinda',
                address: 'Jl. Ahmad Yani No. 10',
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        await authPortalUsersDao.replaceAll([
            {
                id: 2,
                company_id: 1,
                role: 'staff',
                assigned_branch_id: 2,
                username: 'staff.sgn',
                password_hash: 'hash-staff',
                full_name: 'Mita Lestari',
                email: 'staff@sentragadai.id',
                phone_number: '0811-5400-103',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            },
            {
                id: 3,
                company_id: 1,
                role: 'admin',
                assigned_branch_id: 1,
                username: 'admin.sgn',
                password_hash: 'hash-admin',
                full_name: 'Aldo Pratama',
                email: 'admin@sentragadai.id',
                phone_number: '0811-5400-102',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        await authPortalSessionsDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                user_id: 2,
                session_token: 'session-token-1',
                login_at: '2026-03-12T01:00:00.000Z',
                logout_at: null,
                session_status: 'active',
                created_at: '2026-03-12T01:00:00.000Z',
                updated_at: '2026-03-12T01:00:00.000Z'
            }
        ]);

        await branchesDao.replaceAll([
            createBranchRow({
                id: 2,
                branch_code: 'BR-SMD-002',
                branch_number: '002',
                branch_name: 'Pawnshop Samarinda Ilir',
                is_active: 1
            })
        ]);

        const datasource = new AuthPortalLocalDatasource();
        const updatedSession = await datasource.updateProfile({
            fullName: 'Mita Permata',
            username: 'mita.permata',
            email: 'mita.permata@sentragadai.id',
            phoneNumber: '0811-5400-999'
        });
        const users = await authPortalUsersDao.getAll();
        const storedSession = readAuthPortalStoredSession();

        expect(updatedSession.user.fullName).toBe('Mita Permata');
        expect(updatedSession.user.username).toBe('mita.permata');
        expect(updatedSession.user.email).toBe('mita.permata@sentragadai.id');
        expect(updatedSession.user.phoneNumber).toBe('0811-5400-999');
        expect(users.find((item) => item.id === 2)?.username).toBe('mita.permata');
        expect(users.find((item) => item.id === 2)?.full_name).toBe('Mita Permata');
        expect(storedSession?.user.username).toBe('mita.permata');
        expect(storedSession?.user.fullName).toBe('Mita Permata');
    });

    test('allows multiple employees to share one delegated branch and activates the branch on first save', async () => {
        writeAuthPortalStoredSession(createOwnerSessionSnapshot());

        await authPortalCompaniesDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                name: 'Sentra Gadai Nusantara',
                legal_name: 'PT Sentra Gadai Nusantara',
                business_type: 'Pegadaian Swasta',
                email: 'halo@sentragadai.id',
                phone_number: '0541-880101',
                city: 'Samarinda',
                address: 'Jl. Ahmad Yani No. 10',
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        await authPortalUsersDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                role: 'owner',
                assigned_branch_id: null,
                username: 'owner.sgn',
                password_hash: 'hash-owner',
                full_name: 'Rina Maharani',
                email: 'owner@sentragadai.id',
                phone_number: '0811-5400-101',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            },
            {
                id: 2,
                company_id: 1,
                role: 'admin',
                assigned_branch_id: null,
                username: 'admin.sgn',
                password_hash: 'hash-admin',
                full_name: 'Aldo Pratama',
                email: 'admin@sentragadai.id',
                phone_number: '0811-5400-102',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            },
            {
                id: 3,
                company_id: 1,
                role: 'staff',
                assigned_branch_id: null,
                username: 'staff.sgn',
                password_hash: 'hash-staff',
                full_name: 'Mita Lestari',
                email: 'staff@sentragadai.id',
                phone_number: '0811-5400-103',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        await authPortalSessionsDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                user_id: 1,
                session_token: 'owner-session-1',
                login_at: '2026-03-12T01:00:00.000Z',
                logout_at: null,
                session_status: 'active',
                created_at: '2026-03-12T01:00:00.000Z',
                updated_at: '2026-03-12T01:00:00.000Z'
            }
        ]);

        await branchesDao.replaceAll([
            createBranchRow({
                id: 2,
                branch_code: 'BR-SMD-002',
                branch_number: '002',
                branch_name: 'Pawnshop Samarinda Ilir',
                is_active: 0
            })
        ]);

        const datasource = new AuthPortalLocalDatasource();

        await datasource.updateUserBranchAssignment({ userId: 2, branchId: 2 });
        await datasource.updateUserBranchAssignment({ userId: 3, branchId: 2 });

        const users = await authPortalUsersDao.getAll();
        const branches = await branchesDao.getAll();

        expect(users.find((item) => item.id === 2)?.assigned_branch_id).toBe(2);
        expect(users.find((item) => item.id === 3)?.assigned_branch_id).toBe(2);
        expect(branches.find((item) => item.id === 2)?.is_active).toBe(1);
    });
});

function createStoredSessionSnapshot() {
    return {
        sessionToken: 'session-token-1',
        loginAt: '2026-03-12T01:00:00.000Z',
        user: {
            id: 2,
            companyId: 1,
            role: 'staff' as const,
            assignedBranchId: 2,
            assignedBranchName: 'Pawnshop Samarinda Ilir',
            fullName: 'Mita Lestari',
            username: 'staff.sgn',
            email: 'staff@sentragadai.id',
            phoneNumber: '0811-5400-103'
        },
        company: {
            id: 1,
            name: 'Sentra Gadai Nusantara',
            legalName: 'PT Sentra Gadai Nusantara',
            businessType: 'Pegadaian Swasta',
            email: 'halo@sentragadai.id',
            phoneNumber: '0541-880101',
            city: 'Samarinda',
            address: 'Jl. Ahmad Yani No. 10'
        }
    };
}

function createOwnerSessionSnapshot() {
    return {
        sessionToken: 'owner-session-1',
        loginAt: '2026-03-12T01:00:00.000Z',
        user: {
            id: 1,
            companyId: 1,
            role: 'owner' as const,
            assignedBranchId: null,
            assignedBranchName: null,
            fullName: 'Rina Maharani',
            username: 'owner.sgn',
            email: 'owner@sentragadai.id',
            phoneNumber: '0811-5400-101'
        },
        company: {
            id: 1,
            name: 'Sentra Gadai Nusantara',
            legalName: 'PT Sentra Gadai Nusantara',
            businessType: 'Pegadaian Swasta',
            email: 'halo@sentragadai.id',
            phoneNumber: '0541-880101',
            city: 'Samarinda',
            address: 'Jl. Ahmad Yani No. 10'
        }
    };
}

function createBranchRow(input: {
    id: number;
    branch_code: string;
    branch_number: string;
    branch_name: string;
    is_active: number;
}) {
    return {
        id: input.id,
        company_id: 1,
        branch_code: input.branch_code,
        branch_number: input.branch_number,
        branch_name: input.branch_name,
        phone_number: '0541-810000',
        address: 'Alamat demo',
        is_active: input.is_active,
        created_at: '2026-03-11T08:00:00.000Z',
        updated_at: '2026-03-11T08:00:00.000Z'
    };
}
