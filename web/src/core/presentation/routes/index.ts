import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import dashboardRoutes from '@core/presentation/routes/dashboard_router';
import masterBranchRoutes from '@core/presentation/routes/master_branch_router';
import customerRoutes from '@core/presentation/routes/customer_router';
import itemMasterRoutes from '@core/presentation/routes/item_master_router';
import pawnContractRoutes from '@core/presentation/routes/pawn_contract_router';
import pawnTransactionRoutes from '@core/presentation/routes/pawn_transaction_router';
import branchFinanceRoutes from '@core/presentation/routes/branch_finance_router';
import masterInvestorRoutes from '@core/presentation/routes/master_investor_router';
import authAccessRoutes from '@core/presentation/routes/auth_access_router';
import authPortalRoutes from '@core/presentation/routes/auth_portal_router';
import supportRoutes from '@core/presentation/routes/support_router';

import {
  hasAuthPortalStoredSession,
  isCurrentAuthPortalOwner
} from '@feature/auth_portal/util/auth_portal_session';

// Kumpulkan semua rute fitur ke dalam satu array
const featureRoutes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...masterBranchRoutes,
  ...customerRoutes,
  ...itemMasterRoutes,
  ...pawnContractRoutes,
  ...pawnTransactionRoutes,
  ...branchFinanceRoutes,
  ...masterInvestorRoutes,
  ...authAccessRoutes,
  ...authPortalRoutes,
  ...supportRoutes,
];

// Definisi rute umum atau global (misalnya: Home, 404 Not Found)
const globalRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/dashboard',
  },
  {
    path: '/settings/profile',
    name: 'Profile',
    component: () => import('@core/presentation/views/ProfileView.vue'),
  },
  {
    path: '/settings/company',
    name: 'Company',
    component: () => import('@core/presentation/views/CompanyView.vue'),
    meta: { ownerOnly: true },
  },
  {
    path: '/settings/system',
    name: 'Settings',
    component: () => import('@core/presentation/views/SettingsView.vue'),
  },
  {
    path: '/:pathMatch(.*)*', // Rute 404 (harus selalu di akhir)
    name: 'NotFound',
    component: () => import('@core/presentation/views/NotFoundView.vue'),
  }
];

// Gabungkan rute global dan rute fitur
const routes: RouteRecordRaw[] = [
  ...globalRoutes,
  ...featureRoutes,
];

// Buat instance Vue Router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Anda dapat menambahkan Navigation Guard (Middleware) di sini.
// Misalnya, memeriksa otentikasi.
router.beforeEach((to, _from, next) => {
  const isPublicRoute = Boolean(to.meta.publicAuth);
  const isLoggedIn = hasAuthPortalStoredSession();

  if (isPublicRoute && isLoggedIn) {
    next({ path: '/dashboard' });
    return;
  }

  if (!isPublicRoute && !isLoggedIn) {
    next({
      name: 'Login',
      query: to.fullPath && to.fullPath !== '/login'
        ? { redirect: to.fullPath }
        : undefined,
    });
    return;
  }

  if (to.meta.ownerOnly && !isCurrentAuthPortalOwner()) {
    next({ path: '/dashboard' });
    return;
  }

  next();
});

export default router;
