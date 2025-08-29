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
              <!-- Email -->
              <div class="field span-2">
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

              <!-- Password -->
              <div class="field span-2">
                <label>Password</label>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="Create a password"
                  minlength="8"                  
                  maxlength="16" 
                  @blur="() => validate('password', true)"
                  @input="() => validate('password', false)"
                  :class="{ invalid: touched.password && errors.password }"
                  :aria-invalid="touched.password && !!errors.password"
                  required
                  autocomplete="new-password"
                />
                <small v-if="touched.password && errors.password">{{ errors.password }}</small>

              </div>


              <!-- Confirm password -->
              <div class="field span-2">
                <label>Confirm password</label>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  maxlength="16"
                  @blur="() => validate('confirmPassword', true)"
                  @input="() => validate('confirmPassword', false)"
                  :class="{ invalid: touched.confirmPassword && errors.confirmPassword }"
                  :aria-invalid="touched.confirmPassword && !!errors.confirmPassword"
                  required
                />
                <small v-if="touched.confirmPassword && errors.confirmPassword">
                  {{ errors.confirmPassword }}
                </small>
              </div>


              <!-- Row 2: Name (span 2 cols) -->
              <div class="field span-2">
                <label>Username</label>
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

              <!-- Row 3: Gender | Age -->
              <div class="field">
                <label>Gender</label>
                <select
                  v-model="form.gender"
                  required
                  @blur="() => validate('gender', true)"
                  @change="() => validate('gender', false)"
                  :class="{ invalid: touched.gender && errors.gender }"
                  :aria-invalid="touched.gender && !!errors.gender"
                >
                  <option disabled value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="prefer_not">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
                <small v-if="touched.gender && errors.gender">{{ errors.gender }}</small>
              </div>

              <div class="field">
                <label>Age</label>
                <input
                  v-model.number="form.age"
                  type="number" min="10" max="120"
                  placeholder="e.g. 28"
                  @blur="() => validate('age', true)"
                  @input="() => validate('age', false)"
                  :class="{ invalid: touched.age && errors.age }"
                  :aria-invalid="touched.age && !!errors.age"
                  required
                />
                <small v-if="touched.age && errors.age">{{ errors.age }}</small>
              </div>

              <!-- Row 4: Reason (span 2 cols) -->
              <div class="field span-2 textarea-field">
                <label>Reason to join</label>

                <textarea
                  v-model.trim="form.reason"
                  rows="4"
                  maxlength="200"
                  placeholder="Tell us briefly why you want to join"
                  @blur="() => validate('reason', true)"
                  @input="() => validate('reason', false)"
                  :class="{ invalid: touched.reason && errors.reason }"
                  :aria-invalid="touched.reason && !!errors.reason"
                  required
                ></textarea>

                <!-- reason count -->
                <span class="char-counter" :class="{ danger: reasonCount > 200 }">
                  {{ reasonCount }}/200
                </span>

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
import { auth } from '@/services/auth'

export default {
  name: 'RegisterView',
  data() {
    return {
      submitting: false,
      form: {
        email: '', password: '', confirmPassword: '',   
        name: '', gender: '', age: null, reason: ''
      },
      touched: {
        email:false, password:false, confirmPassword:false,  
        name:false, gender:false, age:false, reason:false
      },
      errors:  {
        email:'',   password:'',   confirmPassword:'',       
        name:'',    gender:'',     age:'', reason:''
      }
    }
  },
  computed: {
    reasonCount() {
      return (this.form.reason || '').trim().length
    },
    pwdState() {
      const p = String(this.form.password || '');
      const len = p.length;                 
      return {
        range: len >= 8 && len <= 16,       
        upper: /[A-Z]/.test(p),
        lower: /[a-z]/.test(p),
        number: /\d/.test(p),
      };
    },
    pwdAllOk() {
      const s = this.pwdState;
      return s.range && s.upper && s.lower && s.number; 
    }
  },
  methods: {
    /* ===== JS validation ===== */
    isRequired(v){ return !!v && String(v).trim().length>0 },
    isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') },
    isAge(v){ return Number.isFinite(+v) && +v>=10 && +v<=120 },
    isSame(a,b){ return String(a || '') === String(b || '') },

    validate(key, fromBlur=false){
      if(fromBlur) this.touched[key] = true;
      const v = this.form[key]; let msg = '';
      switch(key){
        case 'email':
          if(!this.isRequired(v)) msg='Email is required.'
          else if(!this.isEmail(v)) msg='Please enter a valid email.'
          break
        case 'password': {
          if (!this.isRequired(v)) {
            msg = 'Password is required.';
          } else if (!this.pwdAllOk) {
            msg = 'Must between 8 and 16 chars and include upper/lower, number.';
          } else {
            msg = '';                      
          }
          if (this.touched.confirmPassword) this.validate('confirmPassword')
          break
        }
        case 'confirmPassword': {
          if (!this.isRequired(v)) msg = 'Please confirm your password.'
          else if (!this.isSame(this.form.password, v)) msg = 'Passwords do not match.'
          break
        }
        case 'name':
          if(!this.isRequired(v)) msg='Name is required.'; break;
        case 'age':
          if(!this.isRequired(v)) msg='Age is required.';
          else if(!this.isAge(v)) msg='Please enter a valid age (10–120).'; break;
        case 'reason': {
          const len = (v || '').trim().length
          if (!len) msg = 'This field is required.'
          else if (len > 200) msg = `Up to 200 characters (current ${len}/200).`
          break
        }
      }
      this.errors[key] = msg;
      return !msg;
    },
    validateAll(markTouched=false){
      if(markTouched) Object.keys(this.touched).forEach(k => this.touched[k] = true)
      return ['email','password','confirmPassword','name','gender','age','reason']
        .every(k => this.validate(k))
    },

    async onSubmit(){
      if(!this.validateAll(true)) return;
      this.submitting = true;
      try{
        await auth.register({
          email: this.form.email,
          password: this.form.password,
          name: this.form.name,
          gender: this.form.gender,
          age: this.form.age,
          reason: this.form.reason,
          role: 'user'
        }, { autoLogin: false });

        // registed → login view
        this.$router.replace({ name: 'login' });
      }catch(e){
        alert(e?.message || 'Registration failed');
      }finally{
        this.submitting = false;
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
.left{ padding:8px; display:flex; flex-direction:column; justify-content:center; }
.title{ font-weight:800; font-size:clamp(32px, 4vw, 56px); line-height:1.05; color:#202124; }
.subtitle{ font-size:20px; color:#3c4043; margin:6px 0 0; }

.right{ padding:24px 8px; }

.textarea-field { position: relative; }
.char-counter{
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 12px;
  color: #5f6368;
  background: #fff;
  padding: 0 4px;
  pointer-events: none;
}
.char-counter.danger{ color: #d93025; }


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
/* ===== Compact sizing: smaller fonts & paddings ===== */
.register-page{ padding:16px; }
.card{
  padding:16px 20px 20px;
  border-radius:22px;
}
.grid{
  gap:24px;
  min-height: clamp(460px, 62vh, 660px);
}
.left{ padding:6px; }

.title{
  font-weight:800;
  font-size: clamp(26px, 3.2vw, 40px);
  line-height:1.06;
}
.subtitle{ font-size:16px; }

.form-grid{ gap:12px; }
@media (min-width:960px){
  .form-grid{ column-gap:16px; row-gap:12px; }
}

.field label{ font-weight:600; font-size:14px; }
.field input,
.field select,
.field textarea{
  padding:10px 12px;           
  font-size:14px;               
  border-radius:12px;           
}
.field ::placeholder{ font-size:14px; }

.char-counter{ right:10px; bottom:8px; font-size:11px; }

.actions{ margin-top:12px; gap:10px; }
.btn{ padding:10px 18px; border-radius:20px; font-size:14px; }

</style>

