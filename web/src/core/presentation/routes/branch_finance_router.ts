import type { RouteRecordRaw } from 'vue-router';

const branchFinanceRoutes: Array<RouteRecordRaw> = [
    {
        path: '/branch-finance',
        name: 'BranchFinance',
        component: () => import('@feature/branch_finance/presentation/views/branch_finance.view.vue'),
        meta: {
            title: 'Branch Finance'
        }
    }
];

export default branchFinanceRoutes;
