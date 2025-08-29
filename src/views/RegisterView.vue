<!-- src/views/RegisterView.vue -->
<template>
  <section class="register-page">
    <div class="card">
      <!-- Logo -->
      <router-link class="logo" to="/" aria-label="Go home">
        <img src="@/assets/logo.svg" alt="logo" />
        <span class="brand">HomeHerHealth Hub</span>
      </router-link>


      <div class="grid">
        <!-- left title -->
        <div class="left">
          <h1 class="title">Create an Account</h1>
          <p class="subtitle">Enter your details</p>
        </div>

        <!-- right form -->
        <div class="right">
          <form @submit.prevent="onSubmit">
            <div class="form-grid">
              <!-- Row1：Email | Password -->
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
                  placeholder="Create a password"
                  @blur="() => validate('password', true)"
                  @input="() => validate('password', false)"
                  :class="{ invalid: touched.password && errors.password }"
                  :aria-invalid="touched.password && !!errors.password"
                  required
                />
                <small v-if="touched.password && errors.password">{{ errors.password }}</small>
              </div>

              <!-- Row2：Name -->
              <div class="field span-2">
                <label>Name</label>
                <input
                  v-model.trim="form.name"
                  type="text"
                  placeholder="Your name"
                  @blur="() => validate('name', true)"
                  @input="() => validate('name', false)"
                  :class="{ invalid: touched.name && errors.name }"
                  :aria-invalid="touched.name && !!errors.name"
                  required
                />
                <small v-if="touched.name && errors.name">{{ errors.name }}</small>
              </div>

              <!-- Row3：Gender | Age -->
              <div class="field">
                <label>Gender <span class="muted">(optional)</span></label>
                <select v-model="form.gender">
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="field">
                <label>Age</label>
                <input
                  v-model.number="form.age"
                  type="number"
                  min="10" max="120"
                  placeholder="e.g. 28"
                  @blur="() => validate('age', true)"
                  @input="() => validate('age', false)"
                  :class="{ invalid: touched.age && errors.age }"
                  :aria-invalid="touched.age && !!errors.age"
                  required
                />
                <small v-if="touched.age && errors.age">{{ errors.age }}</small>
              </div>

              <!-- Row4：Reason -->
              <div class="field span-2">
                <label>Reason to join</label>
                <textarea
                  v-model.trim="form.reason"
                  rows="4"
                  placeholder="Tell us briefly why you want to join"
                  @blur="() => validate('reason', true)"
                  @input="() => validate('reason', false)"
                  :class="{ invalid: touched.reason && errors.reason }"
                  :aria-invalid="touched.reason && !!errors.reason"
                  required
                ></textarea>
                <small v-if="touched.reason && errors.reason">{{ errors.reason }}</small>
              </div>
            </div>

            <!-- buttom -->
            <div class="actions">
              <router-link class="btn btn-ghost" to="/login">Sign in instead</router-link>
              <button class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Creating…' : 'Next' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      submitting: false,
      form: {
        email: '',
        password: '',
        name: '',
        gender: '',
        age: null,
        reason: '',
      },
      touched: { email:false, password:false, name:false, age:false, reason:false },
      errors:  { email:'',   password:'',   name:'',   age:'',   reason:'' }
    }
  },
  methods: {
    isRequired(v) { return !!v && String(v).trim().length > 0 },
    isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') },
    isPassword(v) { return (v || '').length >= 6 },
    isAge(v) { return Number.isFinite(+v) && +v >= 10 && +v <= 120 },

    validate(key, fromBlur = false) {
      if (fromBlur) this.touched[key] = true

      const v = this.form[key]
      let msg = ''

      switch (key) {
        case 'email':
          if (!this.isRequired(v)) msg = 'Email is required.'
          else if (!this.isEmail(v)) msg = 'Please enter a valid email.'
          break
        case 'password':
          if (!this.isRequired(v)) msg = 'Password is required.'
          else if (!this.isPassword(v)) msg = 'At least 6 characters.'
          break
        case 'name':
          if (!this.isRequired(v)) msg = 'Name is required.'
          break
        case 'age':
          if (!this.isRequired(v)) msg = 'Age is required.'
          else if (!this.isAge(v)) msg = 'Please enter a valid age (10–120).'
          break
        case 'reason':
          if (!this.isRequired(v)) msg = 'This field is required.'
          break
      }

      this.errors[key] = msg
      return !msg
    },

    validateAll(markTouched = false) {
      if (markTouched) Object.keys(this.touched).forEach(k => this.touched[k] = true)
      const keys = ['email','password','name','age','reason']
      return keys.every(k => this.validate(k))
    },

    async onSubmit () {
  if (!this.validateAll(true)) return
  this.submitting = true
  try {
    this.$router.replace('/user')
  } finally {
    this.submitting = false 
  }
}

  }
}
</script>

<style scoped>
.register-page{
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
  min-height: clamp(520px, 70vh, 780px);
}
.left{
  padding:8px;
  display:flex; flex-direction:column; justify-content:center; 
}
.title{ font-weight:800; font-size:clamp(32px, 4vw, 56px); line-height:1.05; color:#202124; }
.subtitle{ font-size:20px; color:#3c4043; margin:6px 0 0; }

.right{ padding:24px 8px; }


.field{ display:flex; flex-direction:column; gap:8px; }
.field label{ font-weight:600; color:#202124; }
.field input,.field select,.field textarea{
  width:100%; padding:14px 16px;
  border:1px solid #dadce0; border-radius:14px;
  font-size:16px; background:#fff; outline:none;
  transition:border-color .15s, box-shadow .15s;
}
.field input:focus,.field select:focus,.field textarea:focus{
  border-color:#1a73e8; box-shadow:0 0 0 3px rgba(26,115,232,.15);
}
.field small{ color:#d93025; font-size:12px; }
.invalid{ border-color:#d93025 !important; box-shadow:0 0 0 3px rgba(217,48,37,.12) !important; }
.muted{ color:#5f6368; font-weight:400; }


.form-grid{ display:grid; grid-template-columns:1fr; gap:18px; }
@media (min-width: 960px){
  .form-grid{ grid-template-columns:1fr 1fr; column-gap:24px; row-gap:18px; }
  .span-2{ grid-column:1 / -1; }
}


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
</style>
