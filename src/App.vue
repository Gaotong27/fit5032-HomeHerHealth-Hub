<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/services/firebase'
import { auth } from '@/services/auth'

import NavbarSection from '@/views/NavbarSection.vue'
import FooterSection from '@/views/FooterSection.vue'

const router = useRouter()

const ADMIN_EMAIL = 'admin@homeherhealth.org'
const user = ref(null)
let unsub = null

function syncFromAuth() {
  const u = auth.user
  user.value = u
    ? { email: u.email, name: u.name || u.email?.split('@')[0] || 'User' }
    : null
}

onMounted(() => {
  // 1) Listen to Firebase Auth state changes

unsub = onAuthStateChanged(firebaseAuth, (fbUser) => {
  if (!fbUser) user.value = null
  else syncFromAuth() 
})

  // 2) First time sync
syncFromAuth()

// 3) Listen to custom auth update events
window.addEventListener('hhh:auth-updated', syncFromAuth)
})

onUnmounted(() => {
  if (typeof unsub === 'function') unsub()
window.removeEventListener('hhh:auth-updated', syncFromAuth)
})

const isAdmin = computed(() =>
  (user.value?.email || '').toLowerCase() === ADMIN_EMAIL
)

const userInitial = computed(() => {
  const n = user.value?.name?.trim?.() || user.value?.email || ''
  return n ? n.charAt(0).toUpperCase() : 'U'
})

async function logout() {
  await auth.logout()
  user.value = null
  router.replace({ name: 'home' })
}
</script>

<template>
  <div class="hhh-page">
    <NavbarSection />
    <main>
      <RouterView :key="$route.fullPath" />
    </main>
    <FooterSection />
  </div>
</template>

<style scoped>

.hhh-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1; /* Footer is placed at the bottom */
}
</style>