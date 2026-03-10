import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { itemTypesTable, type ItemTypesRow } from '@feature/item_master/data/db/item_types.table';

export class ItemTypesDao extends FeatureTableDao<ItemTypesRow> {
    constructor() {
        super(itemTypesTable);
    }
}

export const itemTypesDao = new ItemTypesDao();
