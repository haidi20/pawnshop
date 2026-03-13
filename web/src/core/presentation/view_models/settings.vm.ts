import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isLeft } from 'fp-ts/Either';
import { showErrorMessage, showSuccessMessage } from '@core/util/alert';
import { pawnContractRepository } from '@feature/pawn_contract/presentation/di/pawn_contract.di';

export const settingsViewModel = defineStore('settingsViewModel', () => {
    const isProcessing = ref(false);

    const runDefaultSeeder = async (): Promise<void> => {
        isProcessing.value = true;
        try {
            const result = await pawnContractRepository.runDefaultSeeder();
            if (isLeft(result)) {
                throw result.left;
            }

            await showSuccessMessage('Seeder Berhasil', 'Seluruh data telah dibersihkan. Sistem akan memuat ulang 500 data demo standar.');

            await new Promise(resolve => setTimeout(resolve, 800));
            window.location.href = '/pawn-contracts/list/nasabah-gadai';
        } catch (error) {
            await showErrorMessage('Gagal menjalankan seeder', error instanceof Error ? error.message : String(error));
        } finally {
            isProcessing.value = false;
        }
    };

    const runSingleActiveSeeder = async (): Promise<void> => {
        isProcessing.value = true;
        try {
            const result = await pawnContractRepository.runSingleActiveSeeder();
            if (isLeft(result)) {
                throw result.left;
            }

            await showSuccessMessage('Seeder Berhasil', 'Data dibersihkan dan 1 kontrak aktif disiapkan menggunakan data asli dari repository. Halaman akan dimuat ulang.');

            await new Promise(resolve => setTimeout(resolve, 800));
            window.location.href = '/pawn-contracts/list/nasabah-gadai';
        } catch (error) {
            await showErrorMessage('Gagal menjalankan seeder', error instanceof Error ? error.message : String(error));
        } finally {
            isProcessing.value = false;
        }
    };

    return {
        isProcessing,
        runDefaultSeeder,
        runSingleActiveSeeder
    };
});
