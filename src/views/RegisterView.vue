<!-- src/views/RegisterView.vue -->
<template>
  <section class="register-page">
    <div class="card">

      <div class="grid">
        <!-- left -->
        <div class="left">
          <h1 class="title">Create an Account</h1>
          <p class="subtitle">Enter your details</p>
        </div>

        <!-- right -->
        <div class="right">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <!-- Row 1: Email | Password -->
              <div class="field">
                <label>Email</label>
                <input
                  v-model.trim="form.email"
                  type="email"
                  placeholder="you@example.com"
                  @blur="touch('email')"
                  :class="{ invalid: touched.email && !rules.email(form.email) }"
                  aria-invalid="touched.email && !rules.email(form.email)"
                  required
                />
                <small v-if="touched.email && !rules.email(form.email)">Please enter a valid email.</small>
              </div>

              <div class="field">
                <label>Password</label>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="Create a password"
                  @blur="touch('password')"
                  :class="{ invalid: touched.password && !rules.password(form.password) }"
                  aria-invalid="touched.password && !rules.password(form.password)"
                  required
                />
                <small v-if="touched.password && !rules.password(form.password)">
                  At least 6 characters.
                </small>
              </div>

              <!-- Row 2: Name -->
              <div class="field span-2">
                <label>Name</label>
                <input
                  v-model.trim="form.name"
                  type="text"
                  placeholder="Your name"
                  @blur="touch('name')"
                  :class="{ invalid: touched.name && !rules.required(form.name) }"
                  aria-invalid="touched.name && !rules.required(form.name)"
                  required
                />
                <small v-if="touched.name && !rules.required(form.name)">Name is required.</small>
              </div>

              <!-- Row 3: Gender | Age -->
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
                  @blur="touch('age')"
                  :class="{ invalid: touched.age && !rules.age(form.age) }"
                  aria-invalid="touched.age && !rules.age(form.age)"
                  required
                />
                <small v-if="touched.age && !rules.age(form.age)">
                  Please enter a valid age (10–120).
                </small>
              </div>

              <!-- Row 4: Reason to join  -->
              <div class="field span-2">
                <label>Reason to join</label>
                <textarea
                  v-model.trim="form.reason"
                  rows="4"
                  placeholder="Tell us briefly why you want to join"
                  @blur="touch('reason')"
                  :class="{ invalid: touched.reason && !rules.required(form.reason) }"
                  aria-invalid="touched.reason && !rules.required(form.reason)"
                  required
                ></textarea>
                <small v-if="touched.reason && !rules.required(form.reason)">
                  This field is required.
                </small>
              </div>
            </div>

            <!-- button -->
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

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const submitting = ref(false)

const form = reactive({
  email: '', name: '', password: '', gender: '', age: null, reason: ''
})

const touched = reactive({ email:false, password:false, name:false, age:false, reason:false })

const rules = {
  required: v => !!v && String(v).trim().length > 0,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || ''),
  password: v => (v || '').length >= 6,
  age: v => Number.isFinite(v) && v >= 10 && v <= 120,
}

function touch(k){ touched[k] = true }

async function submit () {
  Object.keys(touched).forEach(touch)
  if (!rules.email(form.email) || !rules.password(form.password)
      || !rules.required(form.name) || !rules.age(form.age)
      || !rules.required(form.reason)) return

  submitting.value = true
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
  align-items: stretch;                 
  min-height: clamp(520px, 70vh, 780px);
}


.left{
  padding: 8px;                         
  display:flex;
  flex-direction: column;
  justify-content: center;              
}

@media (max-width: 960px){
  .grid{ grid-template-columns:1fr; min-height: unset; }
  .left{ justify-content: flex-start; padding-top: 8px; }
}
.title{
  font-weight: 800;            
  font-size: clamp(32px, 4vw, 56px);
  line-height: 1.05;
  color: #202124;
}




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
</style>
