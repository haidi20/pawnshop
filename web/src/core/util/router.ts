import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import dashboardRoutes from '@feature/dashboard/util/dashboard_router';
import masterBranchRoutes from '@feature/master_branch/util/master_branch_router';
import customerRoutes from '@feature/customer/util/customer_router';
import itemMasterRoutes from '@feature/item_master/util/item_master_router';
import pawnContractRoutes from '@feature/pawn_contract/util/pawn_contract_router';
import pawnTransactionRoutes from '@feature/pawn_transaction/util/pawn_transaction_router';
import branchFinanceRoutes from '@feature/branch_finance/util/branch_finance_router';
import masterInvestorRoutes from '@feature/master_investor/util/master_investor_router';
import authAccessRoutes from '@feature/auth_access/util/auth_access_router';
import authPortalRoutes from '@feature/auth_portal/util/auth_portal_router';
import supportRoutes from '@feature/support/util/support_router';
import { hasAuthPortalStoredSession } from '@feature/auth_portal/util/auth_portal_session';

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
    path: '/:pathMatch(.*)*', // Rute 404 (harus selalu di akhir)
    name: 'NotFound',
    component: () => import('@core/presentation/views/NotFoundView.vue'), // Asumsi view 404 ada di core
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

  next();
});


export default router;
