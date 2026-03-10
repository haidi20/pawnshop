import type { RouteRecordRaw } from 'vue-router';

const pawnContractRoutes: Array<RouteRecordRaw> = [
    {
        path: '/pawn-contracts',
        redirect: '/pawn-contracts/list'
    },
    {
        path: '/pawn-contracts/list',
        name: 'PawnContract',
        component: () => import('@feature/pawn_contract/presentation/views/pawn_contract.view.vue'),
        meta: {
            title: 'Data Gadai'
        }
    },
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
