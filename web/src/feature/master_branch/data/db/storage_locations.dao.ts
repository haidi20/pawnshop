import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { storageLocationsTable, type StorageLocationsRow } from '@feature/master_branch/data/db/storage_locations.table';

export class StorageLocationsDao extends FeatureTableDao<StorageLocationsRow> {
    constructor() {
        super(storageLocationsTable);
    }
}

export const storageLocationsDao = new StorageLocationsDao();
