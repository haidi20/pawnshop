import type { RouteRecordRaw } from 'vue-router';

const pawnContractRoutes: Array<RouteRecordRaw> = [
    {
        path: '/pawn-contracts',
        name: 'PawnContract',
        component: () => import('@feature/pawn_contract/presentation/views/pawn_contract.view.vue'),
        meta: {
            title: 'Pawn Contract'
        }
    }
];

export default pawnContractRoutes;
