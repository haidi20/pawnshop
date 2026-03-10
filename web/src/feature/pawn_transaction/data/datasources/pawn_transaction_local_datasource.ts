import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { contractPaymentsDao, contractExtensionsDao, auctionTransactionsDao } from '@feature/pawn_transaction/data/db';
import { createPawnTransactionDataFromRows } from '@feature/pawn_transaction/data/mappers/pawn_transaction.mapper';
import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';

export class PawnTransactionLocalDatasource {
    async getData(): Promise<PawnTransactionDataModel> {
        const [
            contractPaymentsRows,
            contractExtensionsRows,
            auctionTransactionsRows
        ] = await Promise.all([
            contractPaymentsDao.getAll(),
            contractExtensionsDao.getAll(),
            auctionTransactionsDao.getAll()
        ]);

        return createPawnTransactionDataFromRows({
            module: getAppModuleByKey('pawn-transaction'),
            contractPaymentsRows,
            contractExtensionsRows,
            auctionTransactionsRows,
        });
    }
}
