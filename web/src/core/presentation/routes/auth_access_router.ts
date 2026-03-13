import type { RouteRecordRaw } from 'vue-router';

const authAccessRoutes: Array<RouteRecordRaw> = [
    {
        path: '/access-control',
        name: 'AuthAccess',
        component: () => import('@feature/auth_access/presentation/views/auth_access.view.vue'),
        meta: {
            title: 'Auth Access'
        }
    }
];

export default authAccessRoutes;
