import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { settingTable, type SettingRow } from '@core/data/datasources/db/setting.table';

export class SettingDao extends FeatureTableDao<SettingRow> {
    constructor() {
        super(settingTable);
    }

    /**
     * Mengambil nilai setting berdasarkan key.
     * Mengembalikan `null` jika key tidak ditemukan.
     */
    async getValue(key: string): Promise<string | null> {
        const row = await this.getByPrimaryKey(key);
        return row?.value ?? null;
    }

    /**
     * Menyimpan atau memperbarui nilai setting.
     */
    async setValue(key: string, value: string): Promise<void> {
        await this.upsert({ key, value });
    }
}

export const settingDao = new SettingDao();
