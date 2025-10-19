import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AccountView from '@/views/AccountView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import EventsListView from '@/views/EventsListView.vue'
import EventDetailView from '@/views/EventsDetailView.vue'
import AdminHomeView from '@/views/AdminHomeView.vue'
import ClinicsView from '@/views/ClinicsView.vue'       
import ResourceOfflineView from '@/views/ResourceOfflineView.vue' 

import { auth } from '@/services/auth'

const ADMIN_EMAIL = 'admin@homeherhealth.org'

const routes = [
  { path: '/', name: 'home', component: HomeView },

  // Clinics Map
  { path: '/clinics', name: 'clinics', component: ClinicsView }, 

  // Account entry point
  {
    path: '/account',
    name: 'account',
    component: AccountView,
    beforeEnter: (to, from, next) => {
      const user = auth.user
      if (user?.email === ADMIN_EMAIL) return next({ name: 'admin' }) // Administrator
      if (user?.email) return next({ name: 'profile' }) // User
      return next() // Not logged in
    },
  },

  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },

  // User profile page
  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const user = auth.user
      if (user?.email === ADMIN_EMAIL) {
        return next({ name: 'admin' }) // Administrator
      }
      next()
    },
  },

  { path: '/events', name: 'events', component: EventsListView },
  { path: '/events/:slug', name: 'event-detail', component: EventDetailView, props: true },

  // Admin dashboard
  {
    path: '/admin',
    name: 'admin',
    component: AdminHomeView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  {
    path: '/resources',
    name: 'resources.offline',
    component: ResourceOfflineView,
    meta: { requiresAuth: false }
  }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  const user = auth.user

  // needs to be logged in
  if (to.meta.requiresAuth && !user?.email) {
    return next({ name: 'account' })
  }

  // needs to be admin
  if (to.meta.requiresAdmin && user?.email !== ADMIN_EMAIL) {
    alert('Only administrators can access the background')
    return next({ name: 'home' })
  }

  next()
})

export default router