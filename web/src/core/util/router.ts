import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import dashboardRoutes from '@feature/dashboard/util/dashboard_router';

// Kumpulkan semua rute fitur ke dalam satu array
const featureRoutes: RouteRecordRaw[] = [
  ...dashboardRoutes,
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
  const requiresAuth = to.meta.requiresAuth;
  const isLoggedIn = false;

  // if (requiresAuth && !isLoggedIn) {
  //   // Redirect ke halaman login jika rute butuh autentikasi tapi belum login
  //   next({ name: 'Login' });
  // } else {
  //   next();
  // }

  next();
});


export default router;
