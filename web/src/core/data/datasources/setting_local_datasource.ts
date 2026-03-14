import { settingDao } from '@core/data/datasources/db/setting.dao';

/**
 * Key konstanta untuk pengaturan yang tersedia.
 */
export const SETTING_KEY_VEHICLE_DAILY_DISABLED = 'pawn_contract.vehicle_daily_disabled';

/**
 * Mengambil nilai boolean dari tabel setting.
 * Mengembalikan `defaultValue` jika key tidak ditemukan.
 */
export const getSettingBoolean = async (key: string, defaultValue: boolean): Promise<boolean> => {
    const raw = await settingDao.getValue(key);
    if (raw === null) {
        return defaultValue;
    }

    return raw === 'true' || raw === '1';
};

/**
 * Menyimpan nilai boolean ke tabel setting.
 */
export const setSettingBoolean = async (key: string, value: boolean): Promise<void> => {
    await settingDao.setValue(key, value ? 'true' : 'false');
};
