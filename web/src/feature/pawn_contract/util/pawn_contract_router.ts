import type { RouteRecordRaw } from 'vue-router';
import {
    pawnContractIndexDefaultRoute,
    pawnContractIndexNavigationItems
} from '@feature/pawn_contract/util/pawn_contract_index_navigation';

const pawnContractIndexView = () => import('@feature/pawn_contract/presentation/views/pawn_contract.view.vue');

const pawnContractRoutes: Array<RouteRecordRaw> = [
    {
        path: '/pawn-contracts',
        redirect: pawnContractIndexDefaultRoute
    },
    {
        path: '/pawn-contracts/list',
        redirect: pawnContractIndexDefaultRoute
    },
    ...pawnContractIndexNavigationItems.map((item) => ({
        path: item.route,
        name: item.routeName,
        component: pawnContractIndexView,
        meta: {
            title: item.title
        }
    })),
    {
        path: '/pawn-contracts/create',
        name: 'PawnContractForm',
        component: () => import('@feature/pawn_contract/presentation/views/pawn_contract_form.view.vue'),
        meta: {
            title: 'Buat Gadai Baru'
        }
    },
    {
        path: '/pawn-contracts/:contractId/edit',
        name: 'PawnContractFormEdit',
        component: () => import('@feature/pawn_contract/presentation/views/pawn_contract_form.view.vue'),
        meta: {
            title: 'Ubah Gadai'
        }
    }
];

export default pawnContractRoutes;
