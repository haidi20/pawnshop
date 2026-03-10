export default [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@feature/dashboard/presentation/views/dashboard_view.vue'),
    meta: {
      // requiresAuth: true
    },
  },
];
