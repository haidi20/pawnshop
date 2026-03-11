import { left, right, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
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
import { ensurePawnContractDemoDataSeed } from '@feature/pawn_contract/data/seeders/pawn_contract_demo_data.seeder';
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

    async getData(filters?: PawnContractDataFilterModel): Promise<Either<Error, PawnContractDataModel>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractDataDaos);

            return right(await this.localDataSource.getData(filters));
        } catch (error) {
            return left(toError(error));
        }
    }

    async getHistorySummaryById(contractId: number): Promise<Either<Error, PawnContractSummaryModel | null>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractDataDaos);

            const data = await this.localDataSource.getDataByContractId(contractId);
            if (!data) {
                return right(null);
            }

            return right(this.indexLocalDataSource.getContractSummaries(data)[0] ?? null);
        } catch (error) {
            return left(toError(error));
        }
    }

    async getFormReferenceData(): Promise<Either<Error, PawnContractFormReferenceModel>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
            return right(await this.localDataSource.getFormReferenceData());
        } catch (error) {
            return left(toError(error));
        }
    }

    async getFormValue(contractId: number): Promise<Either<Error, PawnContractFormValueModel>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
            return right(await this.localDataSource.getFormValue(contractId));
        } catch (error) {
            return left(toError(error));
        }
    }

    async saveContract(
        payload: SavePawnContractPayloadModel
    ): Promise<Either<Error, SavePawnContractResultModel>> {
        try {
            await ensurePawnContractDemoDataSeed();
            await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', pawnContractFormDaos);
            return right(await this.localDataSource.saveContract(payload));
        } catch (error) {
            return left(toError(error));
        }
    }

    getContractSummaries(data: PawnContractDataModel | null): Either<Error, PawnContractSummaryModel[]> {
        try {
            return right(this.indexLocalDataSource.getContractSummaries(data));
        } catch (error) {
            return left(toError(error));
        }
    }

    getNasabahTable(
        params: GetPawnContractNasabahTableParamsModel
    ): Either<Error, PawnContractNasabahTableModel> {
        try {
            return right(this.indexLocalDataSource.getNasabahTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    getRingkasanTable(
        params: GetPawnContractRingkasanTableParamsModel
    ): Either<Error, PawnContractRingkasanTableModel> {
        try {
            return right(this.indexLocalDataSource.getRingkasanTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    getAjtTable(params: GetPawnContractAjtTableParamsModel): Either<Error, PawnContractAjtTableModel> {
        try {
            return right(this.indexLocalDataSource.getAjtTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    getSettlementTable(
        params: GetPawnContractSettlementTableParamsModel
    ): Either<Error, PawnContractSettlementTableModel> {
        try {
            return right(this.indexLocalDataSource.getSettlementTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    getLocationTable(
        params: GetPawnContractLocationTableParamsModel
    ): Either<Error, PawnContractLocationTableModel> {
        try {
            return right(this.indexLocalDataSource.getLocationTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    getMaintenanceTable(
        params: GetPawnContractMaintenanceTableParamsModel
    ): Either<Error, PawnContractMaintenanceTableModel> {
        try {
            return right(this.indexLocalDataSource.getMaintenanceTable(params));
        } catch (error) {
            return left(toError(error));
        }
    }

    getIndexTabs(params: GetPawnContractIndexTabsParamsModel): Either<Error, PawnContractIndexTabModel[]> {
        try {
            return right(this.indexLocalDataSource.getIndexTabs(params));
        } catch (error) {
            return left(toError(error));
        }
    }
}
