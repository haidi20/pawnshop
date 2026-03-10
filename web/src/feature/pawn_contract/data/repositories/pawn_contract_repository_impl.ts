import { PawnContractIndexLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_index_local_datasource';
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
    GetPawnContractAjtTableParamsModel,
    PawnContractDataFilterModel,
    PawnContractDataModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel,
    GetPawnContractIndexTabsParamsModel,
    GetPawnContractLocationTableParamsModel,
    GetPawnContractMaintenanceTableParamsModel,
    GetPawnContractNasabahTableParamsModel,
    GetPawnContractRingkasanTableParamsModel,
    GetPawnContractSettlementTableParamsModel,
    PawnContractAjtTableModel,
    PawnContractIndexTabModel,
    PawnContractLocationTableModel,
    PawnContractMaintenanceTableModel,
    PawnContractNasabahTableModel,
    PawnContractRingkasanTableModel,
    PawnContractSettlementTableModel,
    PawnContractSummaryModel,
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

const pawnContractDataDaos = [
    ...pawnContractFeatureDaos,
    branchesDao,
    branchCashAccountsDao,
    customersDao,
    customerContactsDao,
    customerDocumentsDao
];

const pawnContractFormDaos = [
    ...pawnContractDataDaos,
    branchCashTransactionsDao,
    itemCategoriesDao,
    itemTypesDao,
    branchItemSettingsDao
];

export class PawnContractRepositoryImpl implements PawnContractRepository {
    constructor(
        private readonly localDataSource: PawnContractLocalDatasource,
        private readonly indexLocalDataSource: PawnContractIndexLocalDatasource
    ) {}

    async getData(filters?: PawnContractDataFilterModel): Promise<PawnContractDataModel> {
        await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractDataDaos);

        return this.localDataSource.getData(filters);
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

    getContractSummaries(data: PawnContractDataModel | null): PawnContractSummaryModel[] {
        return this.indexLocalDataSource.getContractSummaries(data);
    }

    getNasabahTable(params: GetPawnContractNasabahTableParamsModel): PawnContractNasabahTableModel {
        return this.indexLocalDataSource.getNasabahTable(params);
    }

    getRingkasanTable(params: GetPawnContractRingkasanTableParamsModel): PawnContractRingkasanTableModel {
        return this.indexLocalDataSource.getRingkasanTable(params);
    }

    getAjtTable(params: GetPawnContractAjtTableParamsModel): PawnContractAjtTableModel {
        return this.indexLocalDataSource.getAjtTable(params);
    }

    getSettlementTable(params: GetPawnContractSettlementTableParamsModel): PawnContractSettlementTableModel {
        return this.indexLocalDataSource.getSettlementTable(params);
    }

    getLocationTable(params: GetPawnContractLocationTableParamsModel): PawnContractLocationTableModel {
        return this.indexLocalDataSource.getLocationTable(params);
    }

    getMaintenanceTable(params: GetPawnContractMaintenanceTableParamsModel): PawnContractMaintenanceTableModel {
        return this.indexLocalDataSource.getMaintenanceTable(params);
    }

    getIndexTabs(params: GetPawnContractIndexTabsParamsModel): PawnContractIndexTabModel[] {
        return this.indexLocalDataSource.getIndexTabs(params);
    }
}
