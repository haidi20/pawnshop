import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { itemCategoriesTable, type ItemCategoriesRow } from '@feature/item_master/data/db/item_categories.table';

export class ItemCategoriesDao extends FeatureTableDao<ItemCategoriesRow> {
    constructor() {
        super(itemCategoriesTable);
    }
}

export const itemCategoriesDao = new ItemCategoriesDao();
