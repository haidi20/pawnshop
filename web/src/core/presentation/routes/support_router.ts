import type { RouteRecordRaw } from 'vue-router';

const supportRoutes: Array<RouteRecordRaw> = [
    {
        path: '/support',
        name: 'Support',
        component: () => import('@feature/support/presentation/views/support.view.vue'),
        meta: {
            title: 'Support'
        }
    }
];

export default supportRoutes;
