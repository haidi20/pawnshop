import type { RouteRecordRaw } from 'vue-router';

const pawnTransactionRoutes: Array<RouteRecordRaw> = [
    {
        path: '/pawn-transactions',
        name: 'PawnTransaction',
        component: () => import('@feature/pawn_transaction/presentation/views/pawn_transaction.view.vue'),
        meta: {
            title: 'Transaksi Gadai'
        }
    }
];

export default pawnTransactionRoutes;
