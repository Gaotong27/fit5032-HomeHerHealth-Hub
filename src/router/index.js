// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AccountView from '@/views/AccountView.vue'
// import Login from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
// import UserHomeView from '@/views/UserHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/account', name: 'account', component: AccountView },
    // { path: '/login',   name: 'login',   component: LoginView },
    { path: '/register',name: 'register',component: RegisterView },
    // { path: '/', name: 'home', component: UserHomeView },  
  ],
  scrollBehavior() { return { top: 0 } }
})

export default router
