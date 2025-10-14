<template>
  <section class="container my-5">
    <h1 class="text-3xl font-bold mb-4">General Women's Health</h1>

    <!-- Search box -->
    <div class="search-bar mb-4">
      <input v-model.trim="q" class="form-control" placeholder="Search events..." />
    </div>

    <!-- Event cards -->
    <div v-for="e in paged" :key="e.id" class="card shadow-sm p-3 d-flex flex-row align-items-center gap-3 mb-4">
      <img
        class="thumb rounded-3 shadow-sm"
        :src="e._img || placeholder"
        :alt="e.title"
        @error="e._img = placeholder"
      />
      <div class="flex-grow-1 min-w-0">
        <h5 class="mb-1 text-truncate">{{ e.title }}</h5>
        <div class="text-muted small">
          <strong>Date:</strong> {{ e.date }}
          <span class="mx-2">|</span>
          <strong>Location:</strong> {{ e.location }}
        </div>
        <RouterLink class="btn btn-success btn-sm mt-2" :to="{ path: '/events/' + (e.slug || e.id) }">
          Read More
        </RouterLink>
      </div>
    </div>

    <div v-if="paged.length === 0" class="text-center text-muted py-5">
      No events found.
    </div>

    <!-- Pagination -->
    <div class="d-flex align-items-center gap-2 mt-4 justify-content-center">
      <button class="btn btn-light" :disabled="page===1" @click="page--">Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button class="btn btn-light" :disabled="page===totalPages" @click="page++">Next</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { firebaseApp } from '@/services/firebase'
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { getStorage, ref as sref, getDownloadURL } from 'firebase/storage'

const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

const raw = ref([])
const q = ref('')
const page = ref(1)
const pageSize = 3
const placeholder = 'https://via.placeholder.com/300x180?text=No+Image'

// try to resolve image URL for an event
async function resolveImageFor(ev) {
  // 1) imageUrl fisrt
  if (ev.imageUrl) { ev._img = ev.imageUrl; return }

  // 2) acording to slug or id
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

  // 3) fallback to placeholder
  ev._img = placeholder
}

// read events from Firestore
async function loadEvents() {
  const qRef = query(collection(db, 'events'), orderBy('date', 'desc'))
  const snap = await getDocs(qRef)
  raw.value = snap.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      slug: data.slug || d.id,   
      title: data.title,
      summary: data.summary,
      location: data.location,
      date: data.date,          
      imageUrl: data.imageUrl || '',
      _img: ''                  
    }
  })

  // resolve images
  await Promise.all(raw.value.map(resolveImageFor))
}

onMounted(loadEvents)

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return raw.value.filter(e =>
    [e.title, e.summary, e.location].some(t => String(t || '').toLowerCase().includes(term))
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})
</script>

<style scoped>
.thumb{
  width: 180px;
  height: 120px;
  object-fit: cover;
  background: #f2f4f7;
}
</style>