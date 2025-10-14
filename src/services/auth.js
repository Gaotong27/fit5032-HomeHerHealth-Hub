import { firebaseAuth } from './firebase'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  getFirestore, doc, setDoc, getDoc,
} from 'firebase/firestore'

const db = getFirestore()
const ADMIN_EMAIL = 'admin@homeherhealth.org'

let currentUser = null

// ---------- helpers ----------
function normalizeEmail(e) {
  return (e || '').trim().toLowerCase()
}

function composeUser(fbUser, docData) {
  const email = normalizeEmail(fbUser?.email)
  const base = {
    uid: fbUser.uid,
    email: fbUser.email, 
    name: fbUser.displayName || (email ? email.split('@')[0] : 'User'),
    role: email === ADMIN_EMAIL ? 'admin' : 'user',
  }
  return docData ? { ...base, ...docData } : base
}

async function writeUserDoc(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

// ---------- public API ----------
export async function register({ email, password, name, gender, age, reason }) {
  const emailNorm = normalizeEmail(email)

  // 1) Create user in Firebase Auth
  const cred = await createUserWithEmailAndPassword(firebaseAuth, emailNorm, password)

  // 2) Update displayName in Firebase Auth profile
  if (name) await updateProfile(cred.user, { displayName: name })

  // 3) Create user document in Firestore
  const payload = {
    uid: cred.user.uid,
    email: cred.user.email,                        
    name: name || (emailNorm ? emailNorm.split('@')[0] : 'User'),
    role: emailNorm === ADMIN_EMAIL ? 'admin' : 'user',
  }
  if (gender !== undefined) payload.gender = gender
  if (age !== undefined && age !== null && age !== '') payload.age = Number(age)
  if (reason !== undefined) payload.reason = String(reason).trim()

  try {
    await writeUserDoc(cred.user.uid, payload)
  } catch (e) {
    console.warn('register: setDoc failed, will continue anyway:', e)
  }

  return cred.user
}

export async function login({ email, password }) {
  const cred = await signInWithEmailAndPassword(firebaseAuth, normalizeEmail(email), password)
  return cred.user
}

export async function logout() {
  await signOut(firebaseAuth)
}

export async function refresh() {
  const fbUser = firebaseAuth.currentUser
  if (!fbUser) {
    currentUser = null
    window.dispatchEvent(new CustomEvent('hhh:auth-updated'))
    return null
  }
  try {
    const ref = doc(db, 'users', fbUser.uid)
    const snap = await getDoc(ref)
    currentUser = snap.exists() ? composeUser(fbUser, snap.data()) : composeUser(fbUser)
  } catch (e) {
    console.warn('refresh getDoc failed:', e)
    currentUser = composeUser(fbUser)
  }
  window.dispatchEvent(new CustomEvent('hhh:auth-updated'))
  return currentUser
}

// ---------- auth-state listener ----------
onAuthStateChanged(firebaseAuth, async (fbUser) => {
  if (!fbUser) {
    currentUser = null
    window.dispatchEvent(new CustomEvent('hhh:auth-updated'))
    return
  }

  try {
    const ref = doc(db, 'users', fbUser.uid)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      currentUser = composeUser(fbUser, snap.data())
    } else {
      // New user, create a document
      const base = composeUser(fbUser)
      await writeUserDoc(fbUser.uid, {
        uid: fbUser.uid,
        email: base.email,
        name: base.name,
        role: base.role,
      })
      currentUser = base
    }
  } catch (e) {
    console.warn('onAuthStateChanged getDoc failed:', e)
    currentUser = composeUser(fbUser)
  }

  window.dispatchEvent(new CustomEvent('hhh:auth-updated'))
})

export const auth = {
  get user() { return currentUser },
  isLoggedIn() { return !!currentUser?.email },
  register,
  login,
  logout,
  refresh, 
}