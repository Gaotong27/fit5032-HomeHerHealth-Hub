<template>
  <section class="admin-page">
    <div class="container py-5">

      <!-- title + statistics -->
      <div class="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 class="page-title">Admin Dashboard</h1>
          <div class="text-muted">Overview & management panels</div>
        </div>

        <div class="stats d-flex gap-3">
          <div class="stat card shadow-sm">
            <div class="label">Total</div>
            <div class="value">{{ totals.all }}</div>
          </div>
          <div class="stat card shadow-sm">
            <div class="label">Open</div>
            <div class="value text-success">{{ totals.open }}</div>
          </div>
          <div class="stat card shadow-sm">
            <div class="label">Full</div>
            <div class="value text-danger">{{ totals.full }}</div>
          </div>
          <div class="stat card shadow-sm">
            <div class="label">Ended</div>
            <div class="value text-secondary">{{ totals.ended }}</div>
          </div>
        </div>
      </div>

      <!-- ====== Events panel ====== -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='events' }">
        <button class="panel-head" @click="toggle('events')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-calendar-event"></i>
            <span class="h6 mb-0">Events</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">{{ totals.all }}</span>
          </div>
          <i class="bi" :class="activePanel==='events' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>

        <div class="panel-body">
          <!-- search / filter / add -->
          <div class="card-sub p-3 mb-3">
            <div class="d-flex gap-3 flex-wrap align-items-center">
              <div class="flex-grow-1">
                <input v-model.trim="q" type="search" class="form-control" placeholder="Search by title or location…" />
              </div>
              <select v-model="statusFilter" class="form-select w-auto">
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="ended">Ended</option>
              </select>
              <select v-model="sortKey" class="form-select w-auto">
                <option value="dateAsc">Date ↑</option>
                <option value="dateDesc">Date ↓</option>
                <option value="titleAsc">Title A–Z</option>
              </select>

              <button class="btn btn-primary ms-auto" @click="openCreate">+ Add New Event</button>
            </div>
          </div>

          <!-- list -->
          <div class="row g-3">
            <div v-for="ev in visibleEvents" :key="ev.id" class="col-12">
              <div class="event-card card shadow-sm p-3 d-flex flex-wrap align-items-center gap-3">
                <img :src="ev.imageUrl || getImageUrl(ev.image)" :alt="ev.title" class="thumb rounded-3 shadow-sm" />
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <h5 class="mb-0 text-truncate">{{ ev.title }}</h5>
                    <span class="badge rounded-pill"
                          :class="{
                            'bg-success': ev.status==='open',
                            'bg-danger':  ev.status==='full',
                            'bg-secondary': ev.status==='ended'
                          }">
                      {{ ev.statusText }}
                    </span>
                  </div>
                  <div class="meta text-muted small mt-1">
                    <i class="bi bi-calendar2 me-1"></i>{{ ev.date }}
                    <span class="mx-2">•</span>
                    <i class="bi bi-geo-alt me-1"></i>{{ ev.location }}
                    <span class="mx-2">•</span>
                    <i class="bi bi-people me-1"></i>{{ ev.registrations }} / {{ ev.capacity }}
                  </div>
                </div>

                <RouterLink class="btn btn-outline-primary" :to="{ path: '/events/' + ev.slug }">
                  View details
                </RouterLink>
                <button class="btn btn-outline-secondary" @click="openEdit(ev)">Edit</button>
                <button class="btn btn-outline-danger" @click="remove(ev)">Delete</button>
              </div>
            </div>

            <div v-if="visibleEvents.length === 0" class="col-12">
              <div class="text-center text-muted py-5">No events match your filters.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion：Users -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='users' }">
        <button class="panel-head" @click="toggle('users')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-people"></i>
            <span class="h6 mb-0">Users</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">—</span>
          </div>
          <i class="bi" :class="activePanel==='users' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div class="panel-body">
          <EmptyState
            title="User management"
            desc="Create, disable, or update roles here."
          />
        </div>
      </div>

      <!-- Accordion：Feedback -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='feedback' }">
        <button class="panel-head" @click="toggle('feedback')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-chat-square-dots"></i>
            <span class="h6 mb-0">Ratings & Comments</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">{{ feedbacks.length }}</span>
          </div>
          <i class="bi" :class="activePanel==='feedback' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>

        <div class="panel-body">
          <div class="card-sub p-3 mb-3 d-flex gap-3 align-items-center flex-wrap">
            <select v-model="selectedEvent" class="form-select w-auto">
              <option value="">All Events</option>
              <option v-for="e in allEvents" :key="e.id" :value="e.id">{{ e.title }}</option>
            </select>
            <button class="btn btn-outline-secondary btn-sm" @click="loadFeedbacks">Refresh</button>
          </div>

          <div class="table-responsive">
            <table class="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="feedbacks.length === 0">
                  <td colspan="7" class="text-muted text-center py-4">No feedbacks found.</td>
                </tr>
                <tr v-for="item in feedbacks" :key="item.eventId + '-' + item.email">
                  <td>{{ item.eventTitle }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.email }}</td>
                  <td>{{ item.value }}★</td>
                  <td>{{ item.comment || '—' }}</td>
                  <td>{{ new Date(item.updatedAt).toLocaleString() }}</td>
                  <td>
                    <button class="btn btn-outline-danger btn-sm" @click="removeFeedback(item)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Accordion：Resources -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='resources' }">
        <button class="panel-head" @click="toggle('resources')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-journal-medical"></i>
            <span class="h6 mb-0">Resources</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">—</span>
          </div>
          <i class="bi" :class="activePanel==='resources' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div class="panel-body">
          <EmptyState
            title="Resource library"
            desc="Add articles, guides, and links for users."
          />
        </div>
      </div>

      <!-- Accordion：Clinics -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='clinics' }">
        <button class="panel-head" @click="toggle('clinics')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-hospital"></i>
            <span class="h6 mb-0">Clinics</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">—</span>
          </div>
          <i class="bi" :class="activePanel==='clinics' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div class="panel-body">
          <EmptyState
            title="Clinics directory"
            desc="Manage clinic list, addresses, and contacts."
          />
        </div>
      </div>

      <!-- Accordion：Content -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='content' }">
        <button class="panel-head" @click="toggle('content')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-layout-text-sidebar"></i>
            <span class="h6 mb-0">Content</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">—</span>
          </div>
          <i class="bi" :class="activePanel==='content' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div class="panel-body">
          <EmptyState
            title="Site content"
            desc="Configure homepage sections, banners, and pages."
          />
        </div>
      </div>

      <!-- Accordion：Reports -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='reports' }">
        <button class="panel-head" @click="toggle('reports')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-graph-up"></i>
            <span class="h6 mb-0">Reports</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">—</span>
          </div>
          <i class="bi" :class="activePanel==='reports' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div class="panel-body">
          <EmptyState
            title="Analytics & reports"
            desc="Download CSVs or view trends once available."
          />
        </div>
      </div>

      <!-- Accordion：Settings -->
      <div class="panel card shadow-sm" :class="{ open: activePanel==='settings' }">
        <button class="panel-head" @click="toggle('settings')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-gear"></i>
            <span class="h6 mb-0">Settings</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">—</span>
          </div>
          <i class="bi" :class="activePanel==='settings' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div class="panel-body">
          <EmptyState
            title="Workspace settings"
            desc="Branding, roles & permissions will appear here."
          />
        </div>
      </div>

      <!-- ===== Modal: create / edit (teleport to <body>) ===== -->
      <teleport to="body">
        <div v-if="showModal">
          <!-- Bootstrap modal -->
          <div class="modal fade show d-block" tabindex="-1" aria-modal="true" role="dialog" style="z-index:1055">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content border-0 rounded-4">
                <div class="modal-header">
                  <h5 class="modal-title">{{ editing ? 'Edit Event' : 'Create Event' }}</h5>
                  <button type="button" class="btn-close" @click="closeModal"></button>
                </div>

                <div class="modal-body">
                  <div class="row g-2">
                    <div class="col-12">
                      <label class="form-label small">Title</label>
                      <input v-model.trim="form.title" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small">Slug (ID)</label>
                      <input v-model.trim="form.slug" class="form-control" readonly />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small">Status</label>
                      <select v-model="form.status" class="form-select">
                        <option value="open">open</option>
                        <option value="full">full</option>
                        <option value="ended">ended</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small">Date (start)</label>
                      <input v-model="form.startAt" type="date" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small">Capacity</label>
                      <input v-model.number="form.capacity" type="number" min="0" class="form-control" />
                    </div>
                    <div class="col-12">
                      <label class="form-label small">Location</label>
                      <input v-model.trim="form.location" class="form-control" />
                    </div>

                    <!-- B. Upload selected file -->
                    <div class="col-12">
                      <label class="form-label small">OR Upload file</label>
                      <input type="file" accept="image/*" class="form-control" @change="onFileChange" />
                      <div v-if="form.previewUrl" class="mt-2">
                        <img :src="form.previewUrl" alt="preview" style="max-width:180px;border-radius:10px" />
                      </div>
                    </div>

                    <div class="col-12">
                      <label class="form-label small">Description</label>
                      <textarea v-model.trim="form.description" class="form-control" rows="4"></textarea>
                    </div>
                  </div>
                </div>

                <div class="modal-footer">
                  <button class="btn btn-light" @click="closeModal">Cancel</button>
                  <button class="btn btn-success" :disabled="saving" @click="save">
                    {{ saving ? 'Saving…' : (editing ? 'Save changes' : 'Create') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Backdrop -->
          <div class="modal-backdrop fade show" style="z-index:1050"></div>
        </div>
      </teleport>

    </div>
  </section>
</template>

<script setup>
// Generate random slug and ensure uniqueness
import {
  getFirestore, collection, getDocs, getDoc, onSnapshot,
  doc, setDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'

// Generate a random slug like "ev-abc123xy"
function randomSlug(len = 8) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  let s = ''
  for (const b of bytes) s += alphabet[b % alphabet.length]
  return 'ev-' + s
}

// Try to allocate a unique slug by checking Firestore
async function allocRandomUniqueSlug(retries = 5) {
  for (let i = 0; i < retries; i++) {
    const slug = randomSlug(8)
    const ref = doc(db, 'events', slug)
    const snap = await getDoc(ref)
    if (!snap.exists()) return slug
  }
  throw new Error('Failed to generate a unique slug, please retry.')
}

import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as eventsApi from '@/services/events'

// === Firestore written（CRUD） ===
import { firebaseApp } from '@/services/firebase'

import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
const storage = getStorage(firebaseApp);
const selectedFile = ref(null);
const db = getFirestore(firebaseApp)

/* -------- helpers -------- */
function getRegistrations(eventId) {
  const data = JSON.parse(localStorage.getItem('hhh_registrations') || '{}')
  const list = data[eventId]
  return Array.isArray(list) ? list : []
}
function getImageUrl(fileName) {
  return new URL(`../assets/events/${fileName}`, import.meta.url).href
}

/* -------- state -------- */
const route = useRoute()
const router = useRouter()
const activePanel = ref('events')

const all = ref([])
const q = ref('')
const statusFilter = ref('')
const sortKey = ref('dateAsc')

// modal
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const form = ref({
  title: '', slug: '', startAt: '', location: '',
  capacity: 0, description: '', imageUrl: '', status: 'open'
})

/* -------- load events -------- */
async function loadEvents() {
  const loader =
    eventsApi.getAllEvents ||
    eventsApi.getEvents ||
    eventsApi.listEvents ||
    eventsApi.fetchAll

  const raw = loader ? await loader() : []
  const today = new Date()

  all.value = raw.map(ev => {
    const regs = getRegistrations(ev.id)
    const dateObj = new Date(ev.date)
    const status =
      dateObj < today ? 'ended'
      : regs.length >= ev.capacity ? 'full'
      : 'open'
    const statusText = status === 'open' ? 'Open' : status === 'full' ? 'Full' : 'Ended'
    return {
      ...ev,
      registrations: regs.length,
      status, statusText,
      _dateObj: dateObj
    }
  })
}


onMounted(() => {
  // Real-time listener
  const q = collection(db, 'events')
  onSnapshot(collection(db, 'events'), (snapshot) => {
    const today = new Date()
    all.value = snapshot.docs.map(docSnap => {
      const ev = docSnap.data()
      const dateObj = new Date(ev.date)
      const status =
        dateObj < today ? 'ended'
        : (Number(ev.bookedCount || 0) >= Number(ev.capacity || 0) ? 'full' : 'open')
      return {
        ...ev,
        id: docSnap.id,
        slug: ev.slug || docSnap.id,        
        registrations: Number(ev.bookedCount || 0),
        status,
        statusText: status.charAt(0).toUpperCase() + status.slice(1),
        _dateObj: dateObj,
      }
    })
  })

  // open panel from URL query
  const p = String(route.query.panel || '').toLowerCase()
  if (['events','users','feedback','resources','clinics','content','reports','settings'].includes(p)) {
    activePanel.value = p
  }
})
watch(() => route.query.panel, (p) => {
  if (!p) return
  activePanel.value = String(p)
})

/* -------- accordion actions -------- */
function toggle(id) {
  activePanel.value = activePanel.value === id ? '' : id
  router.replace({ name: route.name, query: activePanel.value ? { panel: activePanel.value } : {} })
}

/* -------- list views -------- */
const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return all.value.filter(ev => {
    const okQ = !term ||
      ev.title.toLowerCase().includes(term) ||
      String(ev.location || '').toLowerCase().includes(term)
    const okStatus = !statusFilter.value || ev.status === statusFilter.value
    return okQ && okStatus
  })
})
const sorted = computed(() => {
  const list = [...filtered.value]
  switch (sortKey.value) {
    case 'dateDesc': return list.sort((a, b) => b._dateObj - a._dateObj)
    case 'titleAsc': return list.sort((a, b) => a.title.localeCompare(b.title))
    case 'dateAsc':
    default: return list.sort((a, b) => a._dateObj - b._dateObj)
  }
})
const visibleEvents = computed(() => sorted.value)

const totals = computed(() => ({
  all: all.value.length,
  open: all.value.filter(e => e.status === 'open').length,
  full: all.value.filter(e => e.status === 'full').length,
  ended: all.value.filter(e => e.status === 'ended').length,
}))

/* -------- file upload -------- */
function onFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  selectedFile.value = file;
  form.value.previewUrl = URL.createObjectURL(file);
}

/* -------- CRUD: open/save/remove -------- */
async function openCreate() {
  editing.value = false
  selectedFile.value = null
  form.value = {
    title: '', slug: '', startAt: '',
    location: '', capacity: 0,
    description: '', imageUrl: '', status: 'open',
    previewUrl: ''
  }

  // Open modal first
  showModal.value = true

  // Then allocate slug
  try {
    form.value.slug = await allocRandomUniqueSlug()
  } catch (e) {
    console.error('alloc slug failed:', e)
    form.value.slug = 'event-' + Date.now().toString(36).slice(4)
  }
}

function openEdit(ev) {
  editing.value = true
  form.value = {
    title: ev.title,
    slug: ev.slug,
    startAt: ev.date,
    location: ev.location,
    capacity: ev.capacity,
    description: ev.description || '',
    imageUrl: ev.imageUrl || '',
    status: ev.status || 'open',
    bookedCount: Number(ev.bookedCount || ev.registrations || 0), // ✅
    previewUrl: ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function save() {
  if (!form.value.slug || !form.value.title) {
    alert('Please fill Title and Slug'); return
  }
  saving.value = true
  try {
    // Upload file if selected
    let imageUrl = form.value.imageUrl || ''
    if (selectedFile.value) {
      const file = selectedFile.value
      const ext = file.name.split('.').pop().toLowerCase() || 'png' 
      const path = `events/${form.value.slug}.${ext}`                 
      const fileRef = sref(storage, path)
      await uploadBytes(fileRef, file)
      imageUrl = await getDownloadURL(fileRef)
    }

    const payload = {
      slug: form.value.slug,                
      title: form.value.title,
      summary: form.value.summary || '',
      location: form.value.location || '',
      startAt: new Date(form.value.startAt),
      date: form.value.startAt,              
      capacity: Number(form.value.capacity || 0),
      bookedCount: Number(
        editing.value ? (form.value.bookedCount ?? 0) : 0
      ),                                     
      description: form.value.description || '',
      imageUrl,
      status: form.value.status || 'open',
      updatedAt: serverTimestamp(),
    }
    if (!editing.value) payload.createdAt = serverTimestamp()

    // Save to Firestore
    const ref = doc(db, 'events', String(form.value.slug))
    if (editing.value) await updateDoc(ref, payload)
    else await setDoc(ref, payload)

    showModal.value = false
  } catch (e) {
    console.error(e)
    alert(e.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

async function remove(ev) {
  if (!confirm(`Delete "${ev.title}"?`)) return
  try {
    await deleteDoc(doc(db, 'events', ev.slug)) // 或 ev.id
  } catch (e) {
    console.error(e)
    alert(e.message || 'Failed to delete')
  }
}

/* -------- tiny empty component -------- */
const EmptyState = {
  props: { title: String, desc: String },
  template: `
    <div class="empty text-center p-5">
      <div class="icon mb-2"><i class="bi bi-box"></i></div>
      <h6 class="mb-1">{{ title }}</h6>
      <p class="text-muted mb-0">{{ desc }}</p>
    </div>
  `
}

/* -------- feedbacks -------- */
import { getDatabase, ref as dbRef, onValue, remove as dbRemove } from 'firebase/database'

const rtdb = getDatabase(firebaseApp)

const allEvents = ref([])
const selectedEvent = ref('')
const feedbacks = ref([])

/* Load the list of activity titles (remain unchanged) */
async function loadAllEvents() {
  const snap = await getDocs(collection(db, 'events'))
  allEvents.value = snap.docs.map(d => ({
    id: d.id,
    title: d.data().title || d.id
  }))
}

/* ===== User data cache + acquisition function ===== */
const userCache = new Map()

async function getUserProfile(uid) {
  if (userCache.has(uid)) return userCache.get(uid)
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    const data = snap.exists() ? snap.data() : {}
    const profile = {
      name: data.name || uid.slice(0, 8),
      email: data.email || ''
    }
    userCache.set(uid, profile)
    return profile
  } catch {
    const profile = { name: uid.slice(0, 8), email: '' }
    userCache.set(uid, profile)
    return profile
  }
}

/* ===== Load all rating feedback in real time ===== */
function loadFeedbacks() {
  const ratingsRef = dbRef(rtdb, 'ratings')
  onValue(ratingsRef, async (snapshot) => {
    const data = snapshot.val() || {}
    const rows = []

    for (const [eventId, users] of Object.entries(data)) {
      if (selectedEvent.value && selectedEvent.value !== eventId) continue
      const perEvent = users || {}

      // Batch fetch user profiles
      const uids = Object.keys(perEvent)
      const profiles = await Promise.all(uids.map(getUserProfile))
      const profileByUid = Object.fromEntries(uids.map((u, i) => [u, profiles[i]]))

      for (const [uid, r] of Object.entries(perEvent)) {
        const prof = profileByUid[uid] || {}
        rows.push({
          eventId,
          eventTitle: allEvents.value.find(e => e.id === eventId)?.title || eventId,
          uid,
          name: prof.name || uid.slice(0, 8),
          email: prof.email || '',
          value: r.value,
          comment: r.comment,
          updatedAt: r.updatedAt
        })
      }
    }

    feedbacks.value = rows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  })
}

/* ===== Delete a single comment ===== */
async function removeFeedback(item) {
  if (!confirm(`Delete feedback by ${item.name}?`)) return
  const path = `ratings/${item.eventId}/${item.uid}`
  await dbRemove(dbRef(rtdb, path))
  alert('Deleted successfully!')
}

onMounted(() => {
  loadAllEvents().then(loadFeedbacks)
})
</script>

<style scoped>
.admin-page{
  background:#f6f8fb;
  min-height:calc(100dvh - 72px);
  font-family:"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.page-title{
  font-weight:800;
  font-size: clamp(24px, 2.6vw, 36px);
  line-height:1.06;
  color:#202124;
}

/* stats */
.stats .stat{ width:120px; padding:10px 14px; border:1px solid #e7eaee; border-radius:16px; text-align:center; }
.stats .stat .label{ font-size:12px; color:#5f6368; text-transform:uppercase; letter-spacing:.2px; }
.stats .stat .value{ font-weight:800; font-size:22px; line-height:1.1; }

/* accordion */
.panel{ border:1px solid #e7eaee; border-radius:16px; }
.panel-head{
  width:100%; background:#fff; border:0; padding:14px 16px; border-radius:16px;
  display:flex; align-items:center; justify-content:space-between; font-weight:700; color:#202124;
}
.panel-head .bi{ font-size:18px; }
.panel-body{ display:none; padding:16px; border-top:1px solid #eef1f4; }
.panel.open .panel-body{ display:block; }

.card-sub{ border:1px solid #e7eaee; border-radius:12px; background:#f9fafb; }

/* event list */
.event-card{ border:1px solid #e7eaee; border-radius:16px; }
.thumb{ width:128px; height:96px; object-fit:cover; }
.meta i{ opacity:.6; }

/* modal (simple) */
.modal-backdrop{
  position:fixed; inset:0; background:rgba(0,0,0,.25);
  display:flex; align-items:center; justify-content:center; z-index:1000;
}
.modal-dialog{ width:min(720px, 92vw); }
.modal-content{ border-radius:16px; }
</style>