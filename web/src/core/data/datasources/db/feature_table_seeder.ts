import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';

export const seedFeatureTablesIfEmpty = async (
    featureName: string,
    daos: Array<FeatureTableDao<any>>
): Promise<void> => {
    for (const dao of daos) {
        const seeded = await dao.seedIfEmpty();
        if (seeded) {
            console.info(`[${featureName}] Seeded ${dao.getTable().tableName} from ${dao.getTable().seedPath ?? 'memory seed'}.`);
        }
    }
};
