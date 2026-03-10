import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { branchCashAccountsDao, branchCashTransactionsDao } from '@feature/branch_finance/data/db';
import { customerContactsDao, customerDocumentsDao, customersDao } from '@feature/customer/data/db';
import { branchItemSettingsDao, itemCategoriesDao, itemTypesDao } from '@feature/item_master/data/db';
import { branchesDao } from '@feature/master_branch/data/db';
import {
    pawnContractsDao,
    pawnItemAccessoriesDao,
    pawnItemIssuesDao,
    pawnItemLocationMovementsDao,
    pawnItemsDao
} from '@feature/pawn_contract/data/db';
import { PawnContractLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_local_datasource';
import type {
    PawnContractDataModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel,
    SavePawnContractPayloadModel,
    SavePawnContractResultModel
} from '@feature/pawn_contract/domain/models';

const pawnContractFeatureDaos = [
    pawnContractsDao,
    pawnItemsDao,
    pawnItemAccessoriesDao,
    pawnItemIssuesDao,
    pawnItemLocationMovementsDao
];

const pawnContractFormDaos = [
    ...pawnContractFeatureDaos,
    branchesDao,
    branchCashAccountsDao,
    branchCashTransactionsDao,
    customersDao,
    customerContactsDao,
    customerDocumentsDao,
    itemCategoriesDao,
    itemTypesDao,
    branchItemSettingsDao
];

export class PawnContractRepositoryImpl implements PawnContractRepository {
    constructor(private readonly localDataSource: PawnContractLocalDatasource) {}

    async getData(): Promise<PawnContractDataModel> {
        await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFeatureDaos);

        return this.localDataSource.getData();
    }

    async getFormReferenceData(): Promise<PawnContractFormReferenceModel> {
        await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
        return this.localDataSource.getFormReferenceData();
    }

    async getFormValue(contractId: number): Promise<PawnContractFormValueModel> {
        await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
        return this.localDataSource.getFormValue(contractId);
    }

    async saveContract(payload: SavePawnContractPayloadModel): Promise<SavePawnContractResultModel> {
        await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
        return this.localDataSource.saveContract(payload);
    }
}
