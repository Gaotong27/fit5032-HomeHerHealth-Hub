<template>
  <section class="account-landing">
    <div class="card-wrap">
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
        <RouterLink class="btn btn-primary w-100" to="/Login">Sign in</RouterLink>
        <RouterLink class="btn btn-ghost w-100" to="/Register">Create an account</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>

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
