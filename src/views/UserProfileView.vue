<template>
  <section class="profile-page">
    <div class="card">
      <h1 class="title">Your profile</h1>
      <div class="row"><span class="label">Email</span><span>{{ user?.email }}</span></div>
      <div class="row"><span class="label">Name</span><span>{{ user?.name }}</span></div>
      <div class="row"><span class="label">Gender</span><span>{{ user?.gender || '—' }}</span></div>
      <div class="row"><span class="label">Age</span><span>{{ user?.age ?? '—' }}</span></div>
      <div class="row"><span class="label">Reason</span><span>{{ user?.reason || '—' }}</span></div>

      <div class="actions">
        <button class="btn" @click="logout">Log out</button>
      </div>
    </div>
  </section>
</template>

<script>
import { auth } from '@/services/auth'

export default {
  name: 'UserProfileView',
  computed: {
    user() { return auth.user }   
  },
  methods: {
    logout() {
      auth.logout()
      
      this.$router.replace({ name: 'account' })
    }
  }
}
</script>

<style scoped>
.profile-page{ min-height:calc(100dvh - 72px); display:grid; place-items:center; background:#f6f8fb; padding:24px; }
.card{ width:min(720px,100%); background:#fff; border-radius:20px; padding:20px 24px; box-shadow:0 8px 26px rgba(0,0,0,.06); }
.title{ font-weight:800; font-size:28px; margin:4px 0 16px; }
.row{ display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee; }
.row:last-child{ border-bottom:0; }
.label{ color:#5f6368; }
.actions{ margin-top:16px; display:flex; justify-content:flex-end; }
.btn{ padding:10px 18px; border-radius:18px; font-weight:700; border:1px solid #dadce0; background:#fff; cursor:pointer; }
.btn:hover{ background:#f8f9fa; }
</style>
