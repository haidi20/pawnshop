import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import {
    pawnContractsDao,
    pawnItemAccessoriesDao,
    pawnItemIssuesDao,
    pawnItemLocationMovementsDao,
    pawnItemsDao
} from '@feature/pawn_contract/data/db';
import { createPawnContractDataFromRows } from '@feature/pawn_contract/data/mappers/pawn_contract.mapper';
import type { PawnContractDataModel } from '@feature/pawn_contract/domain/models';

export class PawnContractLocalDatasource {
    async getData(): Promise<PawnContractDataModel> {
        const [contractRows, itemRows, accessoryRows, issueRows, locationMovementRows] =
            await Promise.all([
                pawnContractsDao.getAll(),
                pawnItemsDao.getAll(),
                pawnItemAccessoriesDao.getAll(),
                pawnItemIssuesDao.getAll(),
                pawnItemLocationMovementsDao.getAll()
            ]);

        return createPawnContractDataFromRows({
            module: getAppModuleByKey('pawn-contract'),
            contractRows,
            itemRows,
            accessoryRows,
            issueRows,
            locationMovementRows
        });
    }
}
