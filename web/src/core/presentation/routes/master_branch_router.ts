import type { RouteRecordRaw } from 'vue-router';

const masterBranchRoutes: Array<RouteRecordRaw> = [
    {
        path: '/branches',
        name: 'MasterBranch',
        component: () => import('@feature/master_branch/presentation/views/master_branch.view.vue'),
        meta: {
            title: 'Data Cabang'
        }
    },
    {
        path: '/locations',
        name: 'MasterLocation',
        component: () => import('@feature/master_branch/presentation/views/master_location.view.vue'),
        meta: {
            title: 'Lokasi Penyimpanan'
        }
    }
];

export default masterBranchRoutes;
