<template>
  <section class="profile-page">
    <div class="card" v-if="user">
      <h1 class="title">Your profile</h1>
      <div class="row"><span class="label">Email</span><span>{{ user.email }}</span></div>
      <div class="row"><span class="label">Username</span><span>{{ user.name }}</span></div>
      <div class="row"><span class="label">Gender</span><span>{{ user.gender || '—' }}</span></div>
      <div class="row"><span class="label">Age</span><span>{{ user.age ?? '—' }}</span></div>
      <div class="row"><span class="label">Reason</span><span>{{ user.reason || '—' }}</span></div>

      <div class="actions">
        <button class="btn btn-secondary" @click="goBack">← Back</button>
        <button class="btn" @click="logout" :disabled="loadingLogout">
          {{ loadingLogout ? 'Signing out…' : 'Log out' }}
        </button>
      </div>
    </div>

    <div class="card" v-else>
      <h1 class="title">Loading…</h1>
      <div class="row"><span class="label">Please wait</span><span>Checking your session</span></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/services/firebase'
import { auth } from '@/services/auth'

const router = useRouter()
const ADMIN_EMAIL = 'admin@homeherhealth.org'

const user = ref(null)
const unsub = ref(null)
const loadingLogout = ref(false)

onMounted(async () => {
  await auth.refresh()

  unsub.value = onAuthStateChanged(firebaseAuth, () => {
    const u = auth.user
    if (!u?.email) {
      user.value = null
      router.replace({ name: 'account' })
      return
    }
    if (u.email.toLowerCase() === ADMIN_EMAIL) {
      router.replace({ name: 'admin' })
      return
    }
    user.value = {
      email: u.email,
      name: u.name,
      gender: u.gender,
      age: u.age,
      reason: u.reason,
    }
  })

  const u0 = auth.user
  if (u0?.email && u0.email.toLowerCase() !== ADMIN_EMAIL) {
    user.value = {
      email: u0.email,
      name: u0.name,
      gender: u0.gender,
      age: u0.age,
      reason: u0.reason,
    }
  }
})

onBeforeUnmount(() => {
  if (typeof unsub.value === 'function') unsub.value()
})

async function logout() {
  try {
    loadingLogout.value = true
    await auth.logout()
    router.replace({ name: 'account' })
  } finally {
    loadingLogout.value = false
  }
}

function goBack() {
  router.replace({ name: 'home' }) // 或者 router.push('/')
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100dvh - 72px);
  display: grid;
  place-items: center;
  background: #f6f8fb;
  padding: 24px;
}
.card {
  width: min(720px, 100%);
  background: #fff;
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.06);
}
.title {
  font-weight: 800;
  font-size: 28px;
  margin: 4px 0 16px;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.row:last-child {
  border-bottom: 0;
}
.label {
  color: #5f6368;
}
.actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  padding: 10px 18px;
  border-radius: 18px;
  font-weight: 700;
  border: 1px solid #dadce0;
  background: #fff;
  cursor: pointer;
}
.btn:hover {
  background: #f8f9fa;
}
.btn-secondary {
  background: #e9edf3;
  border: 1px solid #dadce0;
  color: #202124;
}
.btn-secondary:hover {
  background: #dde4ec;
}
</style>