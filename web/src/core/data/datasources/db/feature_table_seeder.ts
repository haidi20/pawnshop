import { isCurrentAuthPortalDemoCompany, readAuthPortalStoredSession } from '@feature/auth_portal/util/auth_portal_session';

interface SeedableFeatureTableDao {
    seedIfEmpty(): Promise<boolean>;
    getTable(): {
        tableName: string;
        seedPath?: string;
    };
}

export const seedFeatureTablesIfEmpty = async (
    featureName: string,
    daos: SeedableFeatureTableDao[]
): Promise<void> => {
    const currentSession = readAuthPortalStoredSession();
    if (currentSession && !isCurrentAuthPortalDemoCompany()) {
        return;
    }

    for (const dao of daos) {
        const seeded = await dao.seedIfEmpty();
        if (seeded) {
            console.info(`[${featureName}] Seeded ${dao.getTable().tableName} from ${dao.getTable().seedPath ?? 'memory seed'}.`);
        }
    }
};
