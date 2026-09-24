import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

const base = import.meta.env.BASE_URL;

export const router = createRouter({
  history: base === '/' ? createWebHistory(base) : createWebHashHistory(base),
  routes: [
    {
      path: '/',
      name: 'stage',
      component: () => import('@/views/StageView.vue'),
      meta: { title: 'Sân khấu' },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
      meta: { title: 'Trò chuyện' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Cài đặt' },
    },
    ...(import.meta.env.DEV ? [{
      path: '/dev/design-system',
      name: 'design-system',
      component: () => import('@/views/DesignSystemView.vue'),
      meta: { title: 'Wishlight · Design system', layout: 'dev' },
    }] : []),
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Không tìm thấy trang' },
    },
  ],
  scrollBehavior: (to, from, savedPosition) => savedPosition || (to.hash ? { el: to.hash } : { top: 0 }),
});

router.afterEach((to) => {
  document.title = `${to.meta.title} · Anime Voice Assistant`;
});
