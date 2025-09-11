<template>
  <section class="login-page">
    <div class="card">
      <!-- Logo -->
      <router-link class="logo" to="/" aria-label="Go home">
        <img src="@/assets/logo.svg" alt="logo" />
        <span class="brand">HomeHerHealth Hub</span>
      </router-link>

      <div class="grid">
        <!-- left title -->
        <div class="left">
          <h1 class="title">Sign in</h1>
          <p class="subtitle">Welcome back</p>
        </div>

        <!-- right table -->
        <div class="right">
          <form @submit.prevent="onSubmit">
            <!-- error -->
            <div v-if="serverError" class="banner-error">{{ serverError }}</div>

            <div class="form-grid">
              <!-- Email | Password -->
              <div class="field">
                <label>Email</label>
                <input
                  v-model.trim="form.email"
                  type="email"
                  placeholder="you@example.com"
                  @blur="() => validate('email', true)"
                  @input="() => validate('email', false)"
                  :class="{ invalid: touched.email && errors.email }"
                  :aria-invalid="touched.email && !!errors.email"
                  required
                />
                <small v-if="touched.email && errors.email">{{ errors.email }}</small>
              </div>

              <div class="field">
                <label>Password</label>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="Your password"
                  @blur="() => validate('password', true)"
                  @input="() => validate('password', false)"
                  :class="{ invalid: touched.password && errors.password }"
                  :aria-invalid="touched.password && !!errors.password"
                  required
                />
                <small v-if="touched.password && errors.password">{{ errors.password }}</small>
              </div>
            </div>

            <!-- buttom -->
            <div class="actions">
              <router-link class="btn btn-ghost" :to="{ name: 'register' }">Create an account</router-link>
              <button class="btn btn-primary" type="submit" :disabled="submitting">
                {{ submitting ? 'Signing in…' : 'Sign in' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { auth } from '@/services/auth'

export default {
  name: 'LoginView',
  data() {
    return {
      submitting: false,
      remember: true,     
      serverError: '',
      form: { email: '', password: '' },
      touched: { email: false, password: false },
      errors:  { email: '',   password: '' }
    }
  },
  methods: {
    // ===== JS validation =====
    isRequired(v){ return !!v && String(v).trim().length>0 },
    isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') },

    validate(key, fromBlur=false){
      if(fromBlur) this.touched[key] = true
      const v = this.form[key]; let msg = ''
      if (key === 'email') {
        if (!this.isRequired(v)) msg = 'Email is required.'
        else if (!this.isEmail(v)) msg = 'Please enter a valid email.'
      }
      if (key === 'password') {
        if (!this.isRequired(v)) msg = 'Password is required.'
      }
      this.errors[key] = msg
      return !msg
    },
    validateAll(markTouched=false){
      if(markTouched) Object.keys(this.touched).forEach(k => this.touched[k] = true)
      return ['email','password'].every(k => this.validate(k))
    },

    async onSubmit () {
      this.serverError = ''
      if (!this.validateAll(true)) return
      this.submitting = true

      try {
        // ===== Hard login for administrators =====
        if (this.form.email === 'admin@hhh.com' && this.form.password === 'admin123') {
          const exists = (auth.listUsers?.() || []).some(u => u.email === 'admin@hhh.com')
          if (!exists) {
            await auth.register({
              email: 'admin@hhh.com',
              password: 'admin123',
              name: 'Administrator',
              role: 'admin'
            }) 
          }

          await auth.login({ email: this.form.email, password: this.form.password })
          this.$router.replace('/admin')
          return
        }

        // ===== Users =====
        await auth.login({ email: this.form.email, password: this.form.password })
        this.$router.replace('/')

      } catch (e) {
        this.serverError = e?.message || 'Login failed'
        this.errors.password = this.serverError
        this.touched.password = true
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.login-page{
  background:#f6f8fb;
  min-height:calc(100dvh - 72px);
  display:grid; place-items:center;
  padding:24px;
  font-family:"Poppins",system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;
}
.card{
  width:min(1100px,100%);
  background:#fff;
  border-radius:28px;
  padding:24px 32px 32px;
  box-shadow:0 8px 28px rgba(0,0,0,.06);
}
.logo{ display:inline-flex; align-items:center; gap:10px; text-decoration:none; color:#202124; margin-bottom:8px; }
.logo img{ width:28px; height:28px; border-radius:6px; }
.brand{ font-weight:600; font-size:14px; }

.grid{
  display:grid;
  grid-template-columns:1.1fr 1fr;
  gap:32px;
  align-items:stretch;
  min-height: clamp(480px, 64vh, 720px);
}
.left{ padding:8px; display:flex; flex-direction:column; justify-content:center; }
.title{ font-weight:800; font-size:clamp(32px, 4vw, 56px); line-height:1.05; color:#202124; }
.subtitle{ font-size:20px; color:#3c4043; margin:6px 0 0; }
.right{
  padding: 24px 8px;
  display: grid;
  align-content: center;   
}


.form-grid{ display:grid; grid-template-columns:1fr; gap:18px; }
@media (min-width: 960px){
  .form-grid{ grid-template-columns:1fr 1fr; column-gap:24px; row-gap:18px; }
  .span-2{ grid-column:1 / -1; }
}
.field{ display:flex; flex-direction:column; gap:8px; }
.field label{ font-weight:600; color:#202124; }
.field input{
  width:100%; padding:14px 16px;
  border:1px solid #dadce0; border-radius:14px;
  font-size:16px; background:#fff; outline:none;
  transition:border-color .15s, box-shadow .15s;
}
.field input:focus{ border-color:#1a73e8; box-shadow:0 0 0 3px rgba(26,115,232,.15); }
.field small{ color:#d93025; font-size:12px; }
.invalid{ border-color:#d93025 !important; box-shadow:0 0 0 3px rgba(217,48,37,.12) !important; }


.banner-error{
  grid-column: 1 / -1;
  background:#fdecea;
  color:#b71c1c;
  border:1px solid #f3b7b1;
  border-radius:12px;
  padding:10px 14px;
  margin-bottom:6px;
  font-size:14px;
}


/* bottom */
.actions{ display:flex; justify-content:flex-end; gap:12px; margin-top:18px; }
.btn{ padding:12px 24px; border-radius:24px; font-weight:700; font-size:16px; border:0; cursor:pointer; }
.btn-primary{ background:#1a73e8; color:#fff; }
.btn-primary:hover{ background:#1666cc; }
.btn-ghost{ background:#fff; color:#1a73e8; border:1px solid #dadce0; text-decoration:none; display:inline-flex; align-items:center; }
.btn-ghost:hover{ background:#f8f9fa; }

@media (max-width: 960px){
  .grid{ grid-template-columns:1fr; min-height:unset; }
  .left{ justify-content:flex-start; padding-top:8px; }
}

@media (max-width: 960px){
  .right{ align-content: start; }
}
</style>
