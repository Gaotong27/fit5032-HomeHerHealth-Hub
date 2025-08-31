<!-- src/App.vue -->
<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/services/auth'         

const router = useRouter()
const logoUrl = new URL('./assets/logo.svg', import.meta.url).href

const user = ref(null)

function refreshUser() {
  const raw = localStorage.getItem('hhh_user')
  if (!raw) { user.value = null; return }
  try { user.value = JSON.parse(raw) } catch { user.value = null }
}

onMounted(() => {
  refreshUser()
  window.addEventListener('storage', (e) => {
    if (e.key === 'hhh_user' || e.key === 'hhh.session') {
      refreshUser()
    }
  })
  window.addEventListener('hhh:auth-updated', refreshUser)
})

onUnmounted(() => {
  window.removeEventListener('hhh:auth-updated', refreshUser)
})

const userInitial = computed(() => {
  const n = user.value?.name?.trim?.() || ''
  return n ? n.charAt(0).toUpperCase() : 'U'
})

function logout() {
  auth.logout()
  refreshUser()                              
  router.replace({ name: 'account' })        
}
</script>

<template>
  <div class="hhh-page">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container-fluid px-5">
        <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2 fw-bold">
          <img :src="logoUrl" alt="logo" height="32" />
          <span class="brand-text">HomeHerHealth Hub</span>
        </RouterLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="nav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li class="nav-item">
              <RouterLink to="/" class="nav-link hhh-nav-link">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/resources" class="nav-link hhh-nav-link">Resources</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/events" class="nav-link hhh-nav-link">Events</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/clinics" class="nav-link hhh-nav-link">Clinics Map</RouterLink>
            </li>

            <!-- not logged in：show Sign in button -->
            <li v-if="!user" class="nav-item">
              <RouterLink
                :to="{ name: 'account' }"
                class="btn btn-primary rounded-pill px-3 py-1 d-flex align-items-center gap-2"
              >
                <i class="bi bi-person"></i>
                Sign in
              </RouterLink>
            </li>

            <!-- logged in：Avatar + name -->
            <li v-else class="nav-item dropdown">
              <button
                class="btn btn-light rounded-pill px-2 d-flex align-items-center gap-2"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span class="hhh-avatar">{{ userInitial }}</span>
                <span class="fw-semibold d-none d-md-inline">{{ user?.name }}</span>
                <i class="bi bi-caret-down-fill small"></i>
              </button>

              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li class="px-3 py-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="hhh-avatar hhh-avatar-sm">{{ userInitial }}</span>
                    <div>
                      <div class="fw-semibold">{{ user?.name }}</div>
                      <div class="text-muted small">{{ user?.email }}</div>
                    </div>
                  </div>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <RouterLink class="dropdown-item" :to="{ name: 'profile' }">
                    <i class="bi bi-gear me-2"></i> My Account
                  </RouterLink>
                </li>
                <li>
                  <RouterLink class="dropdown-item" to="/help">
                    <i class="bi bi-question-circle me-2"></i> Help
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item text-danger" @click="logout">
                    <i class="bi bi-box-arrow-right me-2"></i> Log out
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main>
      <RouterView :key="$route.fullPath" />
    </main>
  </div>
</template>

<style scoped>
.brand-text { letter-spacing: 0.2px; }

.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  color: var(--bs-primary);
  font-weight: 600;
}

.hhh-avatar{
  width: 32px; height: 32px; border-radius: 999px;
  display: grid; place-items: center;
  background: #ff2db3; color: #fff; font-weight: 700;
}
.hhh-avatar-sm{
  width: 36px; height: 36px; font-size: 14px;
}
</style>
