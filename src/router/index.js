import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'portal',
      component: () => import('../views/portal/portalCon.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/login.vue'),
    },
  ],
})

export default router
