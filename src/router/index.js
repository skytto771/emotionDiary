import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'portal',
      redirect: '/diaryList',
      component: () => import('../views/portal/portalCon.vue'),
      children: [
        {
          path: '/diaryList',
          name: 'diaryList',
          component: () => import('../views/diary/diaryList.vue'),
        },
        {
          path: '/diaryList/diaryWriting',
          name: 'diaryWriting',
          component: () => import('../views/diary/diaryWriting.vue'),
        },
        {
          path: '/community',
          name: 'community',
          component: () => import('../views/community/community.vue'),
        },
        {
          path: '/personal',
          name: 'personal',
          component: () => import('../views/personal/personal.vue'),
        },
        {
          path: '/report',
          name: 'report',
          component: () => import('../views/report/report.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/login.vue'),
    },
  ],
})

export default router
