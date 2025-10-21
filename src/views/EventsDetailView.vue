<template>
  <section class="event-detail-page">
    <div class="container py-5">
      <router-link class="link-back" :to="{ name: 'events' }">← Back to Events</router-link>

      <div class="detail-card shadow-lg" v-if="event">
        <h1 class="title">{{ event.title }}</h1>

        <div class="row g-4">
          <!-- Left Event Image -->
          <div class="col-lg-7">
            <img
              :src="event.imageUrl || getImageUrl(event.image)"
              :alt="event.title"
              class="hero-img rounded-3 shadow-sm"
            />

            <!-- Administrator exports -->
            <div v-if="user && user.role === 'admin'" class="admin-export">
              <button class="btn btn-outline-dark btn-sm" @click="exportRegistrations" title="Export attendees (CSV)">
                <i class="bi bi-download me-1"></i> Export attendees (CSV)
              </button>
            </div>
          </div>

          <!-- Right Event Info -->
          <div class="col-lg-5">
            <div class="panel card shadow-sm">
              <div class="card-body">
                <!-- Status -->
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <span class="badge rounded-pill"
                        :class="{
                          'bg-success': status==='open',
                          'bg-danger':  status==='full',
                          'bg-secondary': status==='ended'
                        }">
                    {{ statusText }}
                  </span>
                  <!-- Remaining -->
                  <span class="chip">Remaining: {{ remaining }} / {{ event.capacity }}</span>
                </div>

                <div class="divider"></div>

                <!-- Event Info -->
                <ul class="list-unstyled mb-3 key-info">
                  <li class="mb-2"><span class="key">Date: </span><span class="val">{{ event.date }}</span></li>
                  <li class="mb-2"><span class="key">Location: </span><span class="val">{{ event.location }}</span></li>
                </ul>

                <div class="divider"></div>

                <!--  Event Introduce -->
                <h6 class="section-title">About this event</h6>
                <p class="about mb-3" v-html="safeAboutHtml"></p>

                <!-- General Activity Description -->
                <div class="generic-tip mt-2 mb-3">
                  <i class="bi bi-info-circle me-1"></i>
                  This program opens <strong>periodically</strong>. Seats may be released in batches.
                  If it’s full, please check back later or watch for the next window.
                </div>

                <!-- Registeration Button -->
                <div v-if="user && user.role !== 'admin'" class="mb-3">
                  <button v-if="!alreadyRegistered"
                          class="btn btn-success w-100"
                          :disabled="status!=='open' || registering"
                          @click="register">
                    {{ registering ? 'Registering…' : 'Register now' }}
                  </button>
                  <button v-else class="btn btn-danger w-100" @click="cancelOnDetail">
                    Cancel registration
                  </button>
                </div>

                <router-link
                  v-if="!user"
                  class="btn btn-primary w-100"
                  :to="{ name: 'login' }">
                  Sign in to register
                </router-link>
              </div>
            </div>

            <!-- Feedback (Admin can see) -->
            <div v-if="user && user.role === 'admin'" class="ratings-summary card p-4 shadow-sm mt-4">
              <h6 class="section-title mb-3">Ratings & Comments</h6>
              <div class="d-flex align-items-center gap-3">
                <div class="d-flex align-items-center gap-2">
                  <div class="display-avg">{{ summary.count ? summary.avg.toFixed(1) : '—' }}</div>
                  <div class="stars">
                    <i v-for="(icon, i) in starIcons" :key="'adm-'+i" class="bi" :class="icon"></i>
                  </div>
                </div>
                <div class="text-muted">
                  {{ summary.count }} ratings · {{ raterRows.length }} comments
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback (User and visitor can see) -->
        <div v-if="!user || user.role !== 'admin'" class="col-12 mt-5">
          <div class="ratings-section card p-4 shadow-sm">
            <h6 class="section-title mb-3">Ratings & Comments</h6>

            <!-- Comment -->
            <div v-if="raterRows.length">
              <div v-for="row in raterRows" :key="row.email" class="mb-3 border-bottom pb-2">
                <div class="fw-bold">{{ row.name }}</div>
                <div class="text-warning small">
                  <i v-for="n in row.value" :key="n" class="bi bi-star-fill"></i>
                </div>
                <div class="text-muted small">{{ row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '' }}</div>
                <p class="mb-0">{{ row.comment }}</p>
              </div>
            </div>
            <div v-else class="text-muted small text-center">No ratings yet</div>

            <!-- User enter comment -->
            <div v-if="user && user.role !== 'admin'" class="mt-4 border-top pt-3">
              <StarRating v-model="myRating" />
              <textarea v-model.trim="userComment"
                        class="form-control mt-2"
                        rows="2"
                        placeholder="Leave your comment (optional)">
              </textarea>
              <button class="btn btn-success btn-sm mt-2"
                      :disabled="saving || !myRating"
                      @click="saveRating">
                {{ saving ? 'Saving…' : 'Submit' }}
              </button>
              <div class="small text-muted mt-2">
                Avg {{ summary.avg.toFixed(2) }} ({{ summary.count }})
              </div>
              <div v-if="flash" class="text-success small mt-1">Thanks for your feedback!</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty text-center mt-5">
        <p class="text-danger mb-3">Event not found.</p>
        <router-link class="btn btn-primary" :to="{ name: 'events' }">Back</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
/* -------------------- Imports -------------------- */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { sanitizeHtml } from '@/utils/sanitize'
import { useRoute } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/services/firebase'
import { auth } from '@/services/auth'

/* Firestore */
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'

/* Realtime Database */
import { getDatabase, ref as dbRef, set, update, get as rtdbGet, remove, onValue, serverTimestamp } from 'firebase/database'
import StarRating from '@/components/StarRating.vue'

/* -------------------- State -------------------- */
const route = useRoute()
const event = ref(null)
const user = ref(null)
const myRating = ref(0)
const userComment = ref('')
const summary = ref({ avg: 0, count: 0, dist: [0,0,0,0,0] })
const raterRows = ref([])
const saving = ref(false)
const flash = ref(false)
const registering = ref(false)
const alreadyRegistered = ref(false)

const db = getFirestore()
const rtdb = getDatabase()

let unsubEventDoc = null 

/* -------------------- Utils -------------------- */
function getImageUrl(fileName){ return new URL(`../assets/events/${fileName}`, import.meta.url).href }
function getUserKey(u){
  if (u?.uid) return u.uid
  if (u?.email) {
    return String(u.email).trim().toLowerCase().replace(/[.#$\[\]@]/g, '_')
  }
  return null
}
/* Current User */
function syncUser(){
  const fu = firebaseAuth.currentUser
  const au = auth.user
  const uid = fu?.uid || au?.uid
  const email = fu?.email || au?.email
  const displayName = fu?.displayName || au?.name || (email ? email.split('@')[0] : '')
  const role = (au?.role || 'user')
  user.value = (uid || email) ? { uid, email, name: displayName, role } : null
}

/* Load event & subscribe changes */
async function load(){
  const eventId = route.params.slug
  const ref = doc(db, 'events', eventId)

  const snap = await getDoc(ref)
  if (!snap.exists()){
    event.value = null
  } else {
    const data = snap.data()
    event.value = {
      id: eventId,
      ...data,
      registrations: data.bookedCount ?? data.registrations ?? 0
    }
  }

  if (unsubEventDoc) unsubEventDoc()
  unsubEventDoc = onSnapshot(ref, (docSnap) => {
    if (!docSnap.exists()) { event.value = null; return }
    const d = docSnap.data()
    event.value = {
      id: eventId,
      ...d,
      registrations: d.bookedCount ?? d.registrations ?? 0
    }
  })

  listenToRatings(eventId)
  await loadAlreadyRegistered()
}

/* Listen Rating from RTDB */
function listenToRatings(eventId){
  const ratingsRef = dbRef(rtdb, `ratings/${eventId}`)
  onValue(ratingsRef, (snap)=>{
    const data = snap.val() || {}
    const values = Object.values(data).map(r=>Number(r.value))
    if (!values.length){
      summary.value = { avg:0, count:0, dist:[0,0,0,0,0] }
      raterRows.value = []
      return
    }
    const dist=[0,0,0,0,0]; values.forEach(v=>dist[v-1]++)
    summary.value = { avg:values.reduce((a,b)=>a+b,0)/values.length, count:values.length, dist }
    raterRows.value = Object.entries(data).map(([uid,r])=>({
      email: r.email || uid,
      name:  r.name  || uid,
      value: r.value,
      comment: r.comment,
      updatedAt: r.updatedAt
    }))
  })
}

/* Save Rating */
async function saveRating(){
  if(!event.value||!user.value||user.value.role==='admin')return
  const uid=user.value.uid; if(!uid||!myRating.value)return
  saving.value=true
  try {
    const ref = dbRef(rtdb, `ratings/${event.value.id}/${uid}`)
    await update(ref, {
      value: Number(myRating.value),             
      comment: (userComment.value || '').trim(), 
      name: user.value.name || '',
      email: user.value.email || '',
      updatedAt: serverTimestamp(),              
    })
  } catch (e) {
    console.error('saveRating failed:', e)
    alert('Failed to submit rating. Please try again.')
  } finally {
    saving.value=false
 }
 flash.value=true
 setTimeout(()=>flash.value=false,1200)
}

/* === Registrations/Count Sync（无 SendGrid） === */
const remaining = computed(() => {
  if (event.value?.remaining != null) return Number(event.value.remaining)
  const cap  = Number(event.value?.capacity || 0)
  const regs = Number(event.value?.registrations ?? event.value?.bookedCount ?? 0)
  return Math.max(0, cap - regs)
})

const status = computed(()=>{
  if(!event.value) return 'loading'
  const today = new Date()
  const date  = new Date(event.value.date)
  if(date < today) return 'ended'
  if(remaining.value <= 0) return 'full'
  return 'open'
})

const statusText = computed(()=>status.value==='open'?'Open':status.value==='full'?'Full':'Ended')
const safeAboutHtml = computed(()=>sanitizeHtml(event.value?.description || 'This workshop provides practical wellness tips.'))
const starIcons = computed(()=>{
  const a=Math.max(0,Math.min(5,Number(summary.value.avg||0)));const res=[]
  for(let i=1;i<=5;i++){if(a>=i-0.25)res.push('bi-star-fill');else if(a>=i-0.75)res.push('bi-star-half');else res.push('bi-star')}
  return res
})

/* Count RTDB registrations and write back to Firestore */
async function syncCountToEvent(eventId) {
  const snap = await rtdbGet(dbRef(rtdb, `registrations/${eventId}`))
  const count = snap.exists() ? Object.keys(snap.val()).length : 0
  await updateDoc(doc(db, 'events', eventId), { registrations: count })
}

/* Check if current user registered */
async function loadAlreadyRegistered() {
  if (!user.value?.uid || !event.value?.id) { alreadyRegistered.value = false; return }
  const ref = dbRef(rtdb, `registrations/${event.value.id}/${user.value.uid}`)
  const snap = await rtdbGet(ref)
  alreadyRegistered.value = snap.exists()
}


/* Register Event */
async function register() {
  if (!user.value?.uid || !event.value?.id) return
  try {
    registering.value = true
    const { uid, email, name } = user.value
    const payload = {
      name: name || '',
      email: email || '',
      time: new Date().toISOString(),
      registered: true
    }
    await set(dbRef(rtdb, `registrations/${event.value.id}/${uid}`), payload)
    alreadyRegistered.value = true
    await syncCountToEvent(event.value.id)
  } finally {
    registering.value = false
  }
}

/* Cancel Event (no email sending) */
async function cancelOnDetail() {
  if (!user.value?.uid || !event.value?.id) return
  const { uid, email, name } = user.value
  await remove(dbRef(rtdb, `registrations/${event.value.id}/${uid}`))
  alreadyRegistered.value = false
  await syncCountToEvent(event.value.id)
}

/* Admin export */
async function exportRegistrations() {
  if (!event.value) return;
  const eventId = event.value.id;
  const eventTitle = String(event.value.title || eventId);

  try {
    const regSnap = await rtdbGet(dbRef(rtdb, `registrations/${eventId}`));
    const regs = regSnap.exists() ? regSnap.val() : {};
    const rows = [];

    for (const [uid, r] of Object.entries(regs)) {
      let name   = r.name   || '';
      let email  = r.email  || '';
      let gender = r.gender || '';
      let age    = r.age    ?? '';

      try {
        const u1 = await rtdbGet(dbRef(rtdb, `users/${uid}`));
        if (u1.exists()) {
          const u = u1.val();
          name   ||= u.name   || '';
          email  ||= u.email  || '';
          gender ||= u.gender || '';
          age    ||= u.age    || '';
        }
      } catch {}

      if (!name || !email || !gender || !age) {
        try {
          const u2 = await getDoc(doc(db, 'users', uid));
          if (u2.exists()) {
            const u = u2.data();
            name   ||= u.name   || '';
            email  ||= u.email  || '';
            gender ||= u.gender || '';
            age    ||= u.age    || '';
          }
        } catch {}
      }

      rows.push({ name, email, gender, age });
    }

    const header = ['Name', 'Email', 'Gender', 'Age'];
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      header.join(','),
      ...rows.map(r => [r.name, r.email, r.gender, r.age].map(esc).join(','))
    ];

    const safeFileTitle = eventTitle.replace(/[^\w\d]+/g, '-').toLowerCase();
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileTitle}-attendees.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert('Export failed. Please try again.');
  }
}

/* Lifecycle */
onMounted(()=>{
  onAuthStateChanged(firebaseAuth, () => { syncUser(); loadAlreadyRegistered() })
  syncUser()
  load()
})
onBeforeUnmount(() => {
  if (unsubEventDoc) unsubEventDoc()
})
</script>

<style scoped>
.event-detail-page{background:#f6f8fb;min-height:calc(100dvh - 72px);font-family:"Poppins",system-ui;}
.link-back{display:inline-block;margin-bottom:12px;text-decoration:none;color:#1a73e8;font-weight:600;}
.detail-card{background:#fff;border:1px solid #e7eaee;border-radius:28px;padding:24px 28px 12px;}
.title{font-weight:800;font-size:clamp(28px,3.2vw,44px);color:#202124;margin-bottom:16px;}
.hero-img{width:100%;max-height:560px;object-fit:cover;}
.badge{font-weight:700;padding:8px 12px;}
.chip{display:inline-block;background:#f1f3f4;color:#202124;padding:8px 12px;border-radius:999px;font-weight:700;}
.divider{height:1px;background:#e7eaee;margin:12px 0;}
.section-title{font-weight:800;font-size:14px;text-transform:uppercase;margin-bottom:6px;}
.btn.w-100{border-radius:16px;font-weight:700;}
.ratings-section{background:#fff;border-radius:20px;}
.ratings-section .bi-star-fill{color:#f5b301;}
.display-avg{font-size:38px;font-weight:800;color:#222;}
.ratings-summary { border-radius: 20px; background: #fff; }
.ratings-summary .bi-star-fill { color: #f5b301; }
.generic-tip {
  background: #f8fafc;
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  padding: 12px 14px;
  color: #445066;
  font-size: 0.95rem;
  line-height: 1.5;
}
.admin-export { margin-top: 12px; }
.chip{display:inline-block;background:#f1f3f4;color:#202124;padding:8px 12px;border-radius:999px;font-weight:700;}
</style>