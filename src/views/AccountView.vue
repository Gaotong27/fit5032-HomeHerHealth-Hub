<template>
  <section class="account-landing">
    <div class="card-wrap" v-if="!user">
      <!-- profile photo -->
      <div class="avatar">
        <i class="bi bi-person"></i>
      </div>

      <!-- title & subtitle -->
      <h1 class="title">Set up your account</h1>
      <p class="subtitle">
        Sign in to sync your preferences, or create a new account
      </p>

      <!-- buttons -->
      <div class="actions-vertical">
        <RouterLink class="btn btn-primary w-100" to="/login">Sign in</RouterLink>
        <RouterLink class="btn btn-ghost w-100" to="/register">Create an account</RouterLink>
      </div>
    </div>

    <!-- Logged in shows "Welcome" -->
    <div class="card-wrap" v-else>
      <div class="avatar">
        <i class="bi bi-person-check"></i>
      </div>
      <h1 class="title">Welcome back!</h1>
      <p class="subtitle">You're already signed in as {{ user.email }}</p>

      <div class="actions-vertical">
        <RouterLink v-if="isAdmin" class="btn btn-primary w-100" to="/admin">
          Go to Admin Dashboard
        </RouterLink>
        <RouterLink v-else class="btn btn-primary w-100" to="/profile">
          Go to My Profile
        </RouterLink>

        <button class="btn btn-ghost w-100" @click="logout">Sign out</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/services/auth'

const router = useRouter()
const ADMIN_EMAIL = 'admin@homeherhealth.org'
const user = ref(null)

onMounted(() => {
  user.value = auth.user
  setTimeout(() => (user.value = auth.user), 300)
})

const isAdmin = computed(() => user.value?.email === ADMIN_EMAIL)

const logout = async () => {
  await auth.logout()
  user.value = null
  router.replace('/')
}
</script>

<style scoped>
.account-landing {
  min-height: calc(100dvh - 72px);
  display: grid;
  place-items: center;
  background: #fff;
  font-family: "Poppins", sans-serif;
}

.card-wrap {
  text-align: center;
  max-width: 420px;
  padding: 24px;
  width: 100%;
}

.avatar {
  width: 96px;
  height: 96px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background: #ffb74d;
  display: grid;
  place-items: center;
}
.avatar i {
  font-size: 48px;
  color: #222;
}

.title {
  font-weight: 700;
  font-size: 28px;
  margin-bottom: 8px;
  color: #202124;
}
.subtitle {
  color: #5f6368;
  margin-bottom: 28px;
  font-size: 16px;
}

.actions-vertical {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn {
  padding: 12px 28px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #1a73e8;
  color: #fff;
}
.btn-primary:hover { background: #1666cc; }

.btn-ghost {
  background: #fff;
  color: #1a73e8;
  border: 1px solid #dadce0;
}
.btn-ghost:hover { background: #f8f9fa; }
</style>