import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AccountView from '@/views/AccountView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import EventsListView from '@/views/EventsListView.vue'
import EventDetailView from '@/views/EventsDetailView.vue'
import AdminHomeView from '@/views/AdminHomeView.vue'

import { auth } from '@/services/auth'

const routes = [
  { path: '/', name: 'home', component: HomeView },

  {
    path: '/account',
    name: 'account',
    component: AccountView,
    beforeEnter: (to, from, next) => {
      const user = auth.user
      if (user?.role === 'admin') return next({ name: 'admin' })  
      if (user?.email) return next({ name: 'profile' })           
      return next()                                              
    },
  },

  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },

  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
    const user = JSON.parse(localStorage.getItem('hhh_user') || 'null')
    if (user?.role === 'admin') {
      return next({ name: 'admin' })        
    }
    next()
  }
  },

  { path: '/events', name: 'events', component: EventsListView },
  { path: '/events/:slug', name: 'event-detail', component: EventDetailView, props: true },

  {
    path: '/admin',
    name: 'admin',
    component: AdminHomeView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, from, next) => {
  const user = auth.user
  if (to.meta.requiresAuth && !user?.email) {
    return next({ name: 'account' })
  }
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    alert('Only administrators can access the background')
    return next({ name: 'home' })
  }
  next()
})

export default router
