import type { RouteRecordRaw } from 'vue-router';

const masterBranchRoutes: Array<RouteRecordRaw> = [
    {
        path: '/branches',
        name: 'MasterBranch',
        component: () => import('@feature/master_branch/presentation/views/master_branch.view.vue'),
        meta: {
            title: 'Master Branch'
        }
    }
];

export default masterBranchRoutes;
