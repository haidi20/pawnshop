import type { RouteRecordRaw } from 'vue-router';

const customerRoutes: Array<RouteRecordRaw> = [
    {
        path: '/customers',
        name: 'Customer',
        component: () => import('@feature/customer/presentation/views/customer.view.vue'),
        meta: {
            title: 'Customer'
        }
    }
];

export default customerRoutes;
