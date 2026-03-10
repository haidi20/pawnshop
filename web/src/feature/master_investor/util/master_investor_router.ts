import type { RouteRecordRaw } from 'vue-router';

const masterInvestorRoutes: Array<RouteRecordRaw> = [
    {
        path: '/investors',
        name: 'MasterInvestor',
        component: () => import('@feature/master_investor/presentation/views/master_investor.view.vue'),
        meta: {
            title: 'Master Investor'
        }
    }
];

export default masterInvestorRoutes;
