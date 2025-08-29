// （localStorage）
const LS_USERS = 'hhh.users';
const LS_SESS  = 'hhh.session';

function loadUsers(){ try{ return JSON.parse(localStorage.getItem(LS_USERS) || '[]') }catch{ return [] } }
function saveUsers(u){ localStorage.setItem(LS_USERS, JSON.stringify(u)) }
function setSession(userId){ localStorage.setItem(LS_SESS, JSON.stringify({ userId })) }
function getSession(){ try{ return JSON.parse(localStorage.getItem(LS_SESS) || 'null') }catch{ return null } }
function clearSession(){ localStorage.removeItem(LS_SESS) }
function sanitize(u){ if(!u) return null; const { password, ...rest } = u; return rest }

function randomSalt(len=16){ const a=new Uint8Array(len); crypto.getRandomValues(a); return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('') }
async function sha256(t){ const d=new TextEncoder().encode(t); const buf=await crypto.subtle.digest('SHA-256', d); return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('') }

export const auth = {
  get user(){
    const s=getSession(); if(!s) return null;
    const u=loadUsers().find(x=>x.id===s.userId);
    return sanitize(u);
  },
  isLoggedIn(){ return !!this.user },

  // { autoLogin:true }
  async register({ email, password, name, gender='', age, reason, role='user' }, opts = { autoLogin:false }){
    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === String(email).toLowerCase())){
      const e=new Error('Email already registered'); e.code='EMAIL_TAKEN'; throw e;
    }
    const id   = (crypto.randomUUID?.() || ('u_'+Date.now()));
    const salt = randomSalt();
    const hash = await sha256(salt + password);
    const user = { id, email, name, gender, age:Number(age), reason, role,
                   password:{ salt, hash }, createdAt:new Date().toISOString() };
    users.push(user); saveUsers(users);
    if (opts?.autoLogin) setSession(id);
    return sanitize(user);
  },

  async login({ email, password }){
    const users = loadUsers();
    const u = users.find(x => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u){ const e=new Error('User not found'); e.code='NOT_FOUND'; throw e }
    const hash = await sha256(u.password.salt + password);
    if (hash !== u.password.hash){ const e=new Error('Wrong password'); e.code='BAD_CREDENTIALS'; throw e }
    setSession(u.id);
    return sanitize(u);
  },

  logout(){ clearSession() },
  listUsers(){ return loadUsers().map(sanitize) },
};
