import { beforeEach, describe, expect, test } from 'vitest';

import { authPortalUsersDao } from '@feature/auth_portal/data/db';
import {
    clearAuthPortalStoredSession,
    writeAuthPortalStoredSession
} from '@feature/auth_portal/util/auth_portal_session';
import { MasterBranchLocalDatasource } from '@feature/master_branch/data/datasources/master_branch_local_datasource';
import { branchesDao } from '@feature/master_branch/data/db';

describe('master_branch local datasource', () => {
    beforeEach(async () => {
        localStorage.clear();
        clearAuthPortalStoredSession();

        await authPortalUsersDao.replaceAll([]);

        writeAuthPortalStoredSession({
            sessionToken: 'owner-session-1',
            loginAt: '2026-03-12T01:00:00.000Z',
            user: {
                id: 1,
                companyId: 1,
                role: 'owner',
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
        });

        await branchesDao.replaceAll([]);
    });

    test('keeps a branch active when the branch is still delegated to an employee', async () => {
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
                assigned_branch_id: 2,
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

        await branchesDao.replaceAll([
            {
                id: 2,
                company_id: 1,
                branch_code: 'BR-SMD-002',
                branch_number: '002',
                branch_name: 'Pawnshop Samarinda Ilir',
                phone_number: '0541-810002',
                address: 'Jl. Otto Iskandardinata No. 12, Samarinda Ilir, Samarinda',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        const datasource = new MasterBranchLocalDatasource();

        await datasource.saveBranch({
            id: 2,
            branchCode: 'BR-SMD-002',
            branchNumber: '002',
            branchName: 'Pawnshop Samarinda Ilir',
            phoneNumber: '0541-810099',
            address: 'Alamat baru',
            isActive: false
        });

        const branches = await branchesDao.getAll();

        expect(branches).toHaveLength(1);
        expect(branches[0]?.is_active).toBe(1);
        expect(branches[0]?.phone_number).toBe('0541-810099');
        expect(branches[0]?.address).toBe('Alamat baru');
    });

    test('syncs inactive branches when only two employee delegations exist', async () => {
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

        await branchesDao.replaceAll([
            {
                id: 1,
                company_id: 1,
                branch_code: 'BR-SMD-001',
                branch_number: '001',
                branch_name: 'Pawnshop Samarinda Kota',
                phone_number: '0541-810001',
                address: 'Jl. Gajah Mada No. 1',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            },
            {
                id: 2,
                company_id: 1,
                branch_code: 'BR-SMD-002',
                branch_number: '002',
                branch_name: 'Pawnshop Samarinda Ilir',
                phone_number: '0541-810002',
                address: 'Jl. Otto Iskandardinata No. 12',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            },
            {
                id: 3,
                company_id: 1,
                branch_code: 'BR-SMD-003',
                branch_number: '003',
                branch_name: 'Pawnshop Samarinda Seberang',
                phone_number: '0541-810003',
                address: 'Jl. Bung Tomo No. 8',
                is_active: 1,
                created_at: '2026-03-11T08:00:00.000Z',
                updated_at: '2026-03-11T08:00:00.000Z'
            }
        ]);

        const datasource = new MasterBranchLocalDatasource();
        const result = await datasource.getData();

        expect(result.branches.filter((item) => item.isActive)).toHaveLength(2);
        expect(result.branches.find((item) => item.id === 1)?.isActive).toBe(true);
        expect(result.branches.find((item) => item.id === 2)?.isActive).toBe(true);
        expect(result.branches.find((item) => item.id === 3)?.isActive).toBe(false);
    });
});
