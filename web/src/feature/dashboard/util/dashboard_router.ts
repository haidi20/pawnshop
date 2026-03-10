import type { RouteRecordRaw } from 'vue-router';

const dashboardRoutes: Array<RouteRecordRaw> = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@feature/dashboard/presentation/views/dashboard_view.vue'),
        meta: {
            title: 'Dashboard'
        }
    }
];

export default dashboardRoutes;
