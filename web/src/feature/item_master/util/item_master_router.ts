import type { RouteRecordRaw } from 'vue-router';

const itemMasterRoutes: Array<RouteRecordRaw> = [
    {
        path: '/item-masters',
        name: 'ItemMaster',
        component: () => import('@feature/item_master/presentation/views/item_master.view.vue'),
        meta: {
            title: 'Item Master'
        }
    }
];

export default itemMasterRoutes;
