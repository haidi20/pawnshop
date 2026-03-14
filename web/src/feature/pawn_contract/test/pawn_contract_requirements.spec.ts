import { describe, expect, test } from 'vitest';
import { 
    createPawnContractDemoSeedDataset, 
    PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT 
} from '@feature/pawn_contract/data/seeders/pawn_contract_demo_data.seeder';
import { createGeneratedContractNumber } from '@core/util/pawn-contract-form';

describe('Pawn Contract Requirements Verification', () => {
    
    describe('Seeder 1-Data Rule', () => {
        test('createPawnContractDemoSeedDataset should return exactly 1 contract by default', () => {
            const dataset = createPawnContractDemoSeedDataset('2026-03-14', 1);
            
            // Verifikasi jumlah data sesuai dengan requirement (PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT = 1)
            expect(dataset.contracts).toHaveLength(PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT);
            expect(dataset.contracts).toHaveLength(1);
        });

        test('createPawnContractDemoSeedDataset should respect the limit parameter', () => {
             // Verifikasi jika pengen 0 data (misal saat register baru)
            const dataset = createPawnContractDemoSeedDataset('2026-03-14', 1, 0);
            expect(dataset.contracts).toHaveLength(0);
        });
    });

    describe('Contract Number Standardization', () => {
        const companyId = 1;
        const branchNumber = '01';
        const contractDate = '2026-03-14';

        test('should follow the format [CompanyID]-[YYYYMM]-[BranchNumber]-[Sequence]', () => {
            const contractNumber = createGeneratedContractNumber({
                existingContractNumbers: [],
                contractDate,
                companyId,
                branchNumber
            });

            // Format yang diharapkan: 1-202603-01-0001
            expect(contractNumber).toBe('1-202603-01-0001');
        });

        test('should increment the sequence correctly', () => {
             const existing = ['1-202603-01-0001', '1-202603-01-0002'];
             const contractNumber = createGeneratedContractNumber({
                existingContractNumbers: existing,
                contractDate,
                companyId,
                branchNumber
            });

            expect(contractNumber).toBe('1-202603-01-0003');
        });

        test('should reset sequence when the month changes', () => {
            const existingInMarch = ['1-202603-01-0001', '1-202603-01-0002'];
            const dateInApril = '2026-04-01';

            const contractNumber = createGeneratedContractNumber({
                existingContractNumbers: existingInMarch,
                contractDate: dateInApril,
                companyId,
                branchNumber
            });

            // Sequence harus kembali ke 0001 karena prefix bulan berubah jadi 202604
            expect(contractNumber).toBe('1-202604-01-0001');
        });

        test('should isolate sequence per branch', () => {
            const existingBranch01 = ['1-202603-01-0001'];
            const branch02 = '02';

            const contractNumber = createGeneratedContractNumber({
                existingContractNumbers: existingBranch01,
                contractDate,
                companyId,
                branchNumber: branch02
            });

            // Sequence mulai dari 0001 untuk cabang 02 walaupun cabang 01 sudah ada data
            expect(contractNumber).toBe('1-202603-02-0001');
        });

        test('should isolate sequence per company', () => {
            const existingCompany1 = ['1-202603-01-0001'];
            const company2 = 2;

            const contractNumber = createGeneratedContractNumber({
                existingContractNumbers: existingCompany1,
                contractDate,
                companyId: company2,
                branchNumber
            });

            // Sequence mulai dari 0001 untuk company 2 walaupun company 1 sudah ada data
            expect(contractNumber).toBe('2-202603-01-0001');
        });
    });
});
