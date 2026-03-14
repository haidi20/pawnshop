import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';
import { isLeft } from 'fp-ts/Either';
import { showErrorMessage, showSuccessMessage } from '@core/util/alert';
import { SETTING_KEY_VEHICLE_DAILY_DISABLED } from '@core/data/datasources/setting_local_datasource';
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

    const isVehicleDailyDisabled = ref(true);

    const toggleVehicleDailyDisabled = async (enabled: boolean): Promise<void> => {
        isVehicleDailyDisabled.value = enabled;
        await pawnContractRepository.setSettingBoolean(SETTING_KEY_VEHICLE_DAILY_DISABLED, enabled);
    };

    onMounted(async () => {
        isVehicleDailyDisabled.value = await pawnContractRepository.getSettingBoolean(SETTING_KEY_VEHICLE_DAILY_DISABLED, true);
    });

    return {
        isProcessing,
        isVehicleDailyDisabled,
        toggleVehicleDailyDisabled,
        runDefaultSeeder,
        runSingleActiveSeeder
    };
});
