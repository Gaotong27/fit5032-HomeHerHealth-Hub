// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AccountView from '@/views/AccountView.vue'      
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserProfileView from '@/views/UserProfileView.vue'

import { auth } from '@/services/auth'                 

const routes = [
  { path: '/', name: 'home', component: HomeView },

  
  {
    path: '/account',
    name: 'account',
    component: AccountView,
    beforeEnter: (to, from, next) => {
      if (auth.isLoggedIn()) next({ name: 'profile' })
      else next()
    },
  },

  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },


  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() { return { top: 0 } },
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn()) {
    next({ name: 'account' })
  } else {
    next()
  }
})

export default router
