<template>
  <section class="events-page container my-5">
    <h1 class="text-3xl font-bold mb-3">Events for Women's Health</h1>

    <!-- Single-line search filters the sort bar -->
    <div class="toolbar card-sub d-flex align-items-center flex-wrap gap-3 mb-4">
      <div class="flex-grow-1">
        <input
          v-model.trim="q"
          type="search"
          class="form-control big"
          placeholder="Search by title or location…"
        />
      </div>

      <select v-model="statusFilter" class="form-select pill w-auto">
        <option value="">All statuses</option>
        <option value="open">Open</option>
        <option value="full">Full</option>
        <option value="ended">Ended</option>
      </select>

      <select v-model="sortKey" class="form-select pill w-auto">
        <option value="dateAsc">Date ↑</option>
        <option value="dateDesc">Date ↓</option>
        <option value="titleAsc">Title A–Z</option>
      </select>
    </div>

    <!-- Event cards -->
    <div
      v-for="e in paged"
      :key="e.id"
      class="card shadow-sm p-3 d-flex flex-row align-items-center gap-3 mb-4 event-card"
    >
      <img
        class="thumb rounded-3 shadow-sm"
        :src="e._img || placeholder"
        :alt="e.title"
        @error="e._img = placeholder"
      />
      <div class="flex-grow-1 min-w-0">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <h5 class="mb-0 text-truncate">{{ e.title }}</h5>
          <span
            class="badge rounded-pill"
            :class="{
              'bg-success': e.status==='open',
              'bg-danger':  e.status==='full',
              'bg-secondary': e.status==='ended'
            }"
          >
            {{ e.statusText }}
          </span>
          <span class="text-muted small">
            <i class="bi bi-people ms-1 me-1"></i>{{ e.registrations }} / {{ e.capacity }}
          </span>
        </div>

        <div class="text-muted small mt-1">
          <strong>Date:</strong> {{ e.date }}
          <span class="mx-2">|</span>
          <strong>Location:</strong> {{ e.location }}
        </div>

        <RouterLink
          class="btn btn-success btn-sm mt-2"
          :to="{ path: '/events/' + (e.slug || e.id) }"
        >
          Read More
        </RouterLink>
      </div>
    </div>

    <div v-if="paged.length === 0" class="text-center text-muted py-5">
      No events match your filters.
    </div>

    <!-- Pagination -->
    <div class="d-flex align-items-center gap-2 mt-4 justify-content-center" v-if="totalPages>1">
      <button class="btn btn-light" :disabled="page===1" @click="page--">Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button class="btn btn-light" :disabled="page===totalPages" @click="page++">Next</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { firebaseApp } from '@/services/firebase'
import {
  getFirestore,
  collection,
  onSnapshot,
  orderBy,
  query
} from 'firebase/firestore'
import { getStorage, ref as sref, getDownloadURL } from 'firebase/storage'

/* ------------------- Firebase init ------------------- */
const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

/* ------------------- Page status ------------------- */
const raw = ref([])
const q = ref('')
const statusFilter = ref('')
const sortKey = ref('dateAsc')
const page = ref(1)
const pageSize = 6
const placeholder = 'https://via.placeholder.com/300x180?text=No+Image'

/* ------------------- Load image ------------------- */
async function resolveImageFor(ev) {
  if (ev.imageUrl) {
    ev._img = ev.imageUrl
    return
  }
  const slug = ev.slug || ev.id
  if (slug) {
    const candidates = ['jpg', 'png', 'jpeg', 'webp'].map(ext => `events/${slug}.${ext}`)
    for (const path of candidates) {
      try {
        ev._img = await getDownloadURL(sref(storage, path))
        return
      } catch { /* Keep trying the next extension */ }
    }
  }
  ev._img = placeholder
}

/* ------------------- Real-time listen Firestore ------------------- */
function startRealtimeEvents() {
  const qRef = query(collection(db, 'events'), orderBy('date', 'asc'))
  const unsub = onSnapshot(qRef, async (snapshot) => {
    const list = snapshot.docs.map(d => {
      const data = d.data()
      const registrations = Number(data.registrations ?? data.bookedCount ?? 0)
      const capacity = Number(data.capacity || 0)
      const dateObj = new Date(data.date)
      const today = new Date()

      // Judgment event status
      let status = 'open'
      if (dateObj < today) status = 'ended'
      else if (registrations >= capacity) status = 'full'

      return {
        id: d.id,
        slug: data.slug || d.id,
        title: data.title || d.id,
        summary: data.summary || '',
        location: data.location || '',
        date: data.date,
        imageUrl: data.imageUrl || '',
        capacity,
        registrations,
        status,
        statusText: status.charAt(0).toUpperCase() + status.slice(1),
        _img: '',
        _dateObj: dateObj
      }
    })

    // Preserve previous images if exist
    const prevImgs = new Map(raw.value.map(e => [e.id, e._img]))
    raw.value = list
    await Promise.all(
      raw.value.map(async e => {
        e._img = prevImgs.get(e.id) || ''
        if (!e._img) await resolveImageFor(e)
      })
    )
  })
  return unsub
}

let unsubscribe = null
onMounted(() => {
  unsubscribe = startRealtimeEvents()
})
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

/* ------------------- 过滤、排序、分页 ------------------- */
const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return raw.value.filter(e => {
    const okQ =
      !term ||
      [e.title, e.summary, e.location].some(t =>
        String(t || '').toLowerCase().includes(term)
      )
    const okStatus = !statusFilter.value || e.status === statusFilter.value
    return okQ && okStatus
  })
})

const sorted = computed(() => {
  const list = [...filtered.value]
  switch (sortKey.value) {
    case 'dateDesc':
      return list.sort((a, b) => b._dateObj - a._dateObj)
    case 'titleAsc':
      return list.sort((a, b) => a.title.localeCompare(b.title))
    case 'dateAsc':
    default:
      return list.sort((a, b) => a._dateObj - b._dateObj)
  }
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sorted.value.length / pageSize))
)
const paged = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  const start = (page.value - 1) * pageSize
  return sorted.value.slice(start, start + pageSize)
})
</script>

<style scoped>
.events-page{font-family:"Poppins",system-ui}
.card-sub{
  border:1px solid #e7eaee;
  border-radius:16px;
  background:#f9fafb;
  padding:12px 16px;
}
.form-control.big{
  padding:.85rem 1.1rem;
  border-radius:14px;
  font-size:1.05rem;
  box-shadow:none;
}
.form-select.pill{
  border-radius:14px;
  padding:.7rem 1rem;
  font-weight:600;
  min-width:150px;
}
.event-card{
  border:1px solid #e7eaee;
  border-radius:16px;
}
.thumb{
  width:180px;
  height:120px;
  object-fit:cover;
  background:#f2f4f7;
}
.toolbar.card-sub{
  border:1px solid #e7eaee;
  border-radius:16px;
  background:#f9fafb;
  padding:12px 16px;
  display:flex;
  align-items:center;
  gap:12px;
  flex-wrap: wrap;
}
.toolbar .form-control.big{
  padding:.85rem 1.1rem;
  border-radius:14px;
  font-size:1.05rem;
  box-shadow:none;
}
.toolbar .form-select{
  width:auto;
  min-width:160px;
  padding:.7rem 1rem;
  border-radius:14px;
  font-weight:600;
}
@media (min-width: 768px){
  .toolbar.card-sub{ flex-wrap: nowrap; }
}
</style>