import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { authPortalViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal.vm';
import { dashboardPawnTransactionDao } from '@feature/dashboard/data/db/dashboard_pawn_transaction.dao';
import {
    authPortalCompaniesDao,
    authPortalSessionsDao,
    authPortalUsersDao
} from '@feature/auth_portal/data/db';
import { pawnContractsDao } from '@feature/pawn_contract/data/db';
import {
    writeAuthPortalStoredSession,
    clearAuthPortalStoredSession
} from '@feature/auth_portal/util/auth_portal_session';

/**
 * Mocking global fetch untuk mencegah pemanggilan jaringan yang sebenarnya 
 * saat proses seeding data otomatis di dalam DAO.
 */
global.fetch = vi.fn();

describe('Integrasi Autentikasi dan Scoping Dashboard', () => {
    /**
     * Set-up awal sebelum setiap test dijalankan.
     * Membersihkan state Pinia, localStorage, dan session auth.
     */
    beforeEach(async () => {
        setActivePinia(createPinia());
        localStorage.clear();
        clearAuthPortalStoredSession();
        vi.clearAllMocks();

        // Mencegah error saat DAO memanggil seeding data demo
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => []
        } as Response);
    });

    test('setelah login, dashboard hanya menampilkan data milik perusahaan yang sedang login', async () => {
        /**
         * PROSES 1: Inisialisasi Data Dummy untuk dua perusahaan berbeda.
         * Kita mensimulasikan data yang tersimpan di LocalDB (localStorage) dengan key yang berbeda.
         */
        const company1Id = 101;
        const company2Id = 102;

        // Mendefinisikan key storage berdasarkan pola scoping: pawnshop.localdb.company_{id}.{tableName}
        const company1ContractsKey = `pawnshop.localdb.company_${company1Id}.pawn_contracts`;
        const company2ContractsKey = `pawnshop.localdb.company_${company2Id}.pawn_contracts`;

        // Menyimpan 2 kontrak untuk Perusahaan 1
        localStorage.setItem(company1ContractsKey, JSON.stringify([
            { id: 1, company_id: company1Id, contract_number: 'C1-001', disbursed_value: 1000, contract_date: '2026-03-14' },
            { id: 2, company_id: company1Id, contract_number: 'C1-002', disbursed_value: 2000, contract_date: '2026-03-14' }
        ]));

        // Menyimpan 1 kontrak untuk Perusahaan 2 (Data ini tidak boleh muncul saat login sebagai Perusahaan 1)
        localStorage.setItem(company2ContractsKey, JSON.stringify([
            { id: 3, company_id: company2Id, contract_number: 'C2-001', disbursed_value: 5000, contract_date: '2026-03-14' }
        ]));

        /**
         * PROSES 2: Simulasi Login.
         * Menulis session ke storage sehingga aplikasi menganggap kita masuk sebagai Perusahaan 1.
         */
        writeAuthPortalStoredSession({
            sessionToken: 'token-c1',
            loginAt: new Date().toISOString(),
            user: {
                id: 1,
                companyId: company1Id,
                role: 'owner',
                assignedBranchId: null,
                assignedBranchName: null,
                fullName: 'Owner C1',
                username: 'owner.c1',
                email: 'owner@c1.com',
                phoneNumber: '123'
            },
            company: {
                id: company1Id,
                name: 'Company 1',
                legalName: 'Company 1 Legal',
                businessType: 'Pegadaian',
                email: 'contact@c1.com',
                phoneNumber: '123',
                city: 'Jakarta',
                address: 'Address 1'
            }
        });

        /**
         * PROSES 3: Pengambilan Data Dashboard.
         * DAO akan mendeteksi scope 'company_101' dan hanya mengambil data dari key tersebut.
         */
        const snapshot = await dashboardPawnTransactionDao.getSnapshot();

        /**
         * PROSES 4: Verifikasi (Assertion).
         * Memastikan data yang muncul hanya berjumlah 2 (milik Company 1) dan bukan 3 (total semua data).
         */
        expect(snapshot.contractCount).toBe(2);
        expect(snapshot.chartItems.find(i => i.key === 'pawn_contracts')?.count).toBe(2);
        
        // Memastikan tidak ada transaksi dari kontrak milik Company 2 (ID 3) yang bocor ke sini
        expect(snapshot.recentTransactions.every(t => t.contractId === 1 || t.contractId === 2)).toBe(true);
    });

    test('setelah registrasi perusahaan baru, data dashboard harus bernilai 0', async () => {
        /**
         * PROSES 1: Simulasi Sesi Baru hasil Registrasi.
         * ID Perusahaan baru (999) belum memiliki data apapun di storage.
         */
        const newCompanyId = 999;

        writeAuthPortalStoredSession({
            sessionToken: 'token-new',
            loginAt: new Date().toISOString(),
            user: {
                id: 10,
                companyId: newCompanyId,
                role: 'owner',
                assignedBranchId: null,
                assignedBranchName: null,
                fullName: 'New Owner',
                username: 'new.owner',
                email: 'new@owner.com',
                phoneNumber: '456'
            },
            company: {
                id: newCompanyId,
                name: 'New Company',
                legalName: 'New Company Legal',
                businessType: 'Pegadaian',
                email: 'contact@new.com',
                phoneNumber: '456',
                city: 'Bandung',
                address: 'Address New'
            }
        });

        /**
         * PROSES 2: Pengambilan Snapshot Dashboard.
         */
        const snapshot = await dashboardPawnTransactionDao.getSnapshot();

        /**
         * PROSES 3: Verifikasi.
         * Semua metrik haruslah 0 dan daftar transaksi harus kosong.
         */
        expect(snapshot.contractCount).toBe(0);
        expect(snapshot.chartItems.every(i => i.count === 0)).toBe(true);
        expect(snapshot.recentTransactions).toHaveLength(0);
        expect(snapshot.lineSeries).toHaveLength(0);
    });
});
