import type { RouteRecordRaw } from 'vue-router';

const authPortalRoutes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@feature/auth_portal/presentation/views/auth_login.view.vue'),
        meta: {
            title: 'Login',
            publicAuth: true
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@feature/auth_portal/presentation/views/auth_register.view.vue'),
        meta: {
            title: 'Register',
            publicAuth: true
        }
    }
];

export default authPortalRoutes;
