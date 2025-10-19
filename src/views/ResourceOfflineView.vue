<!-- src/views/ResourceOfflineView.vue -->
<template>
  <section class="container py-4 resource-offline-page">
    <!-- === Network Status Bar === -->
    <div
      class="alert py-2 px-3 mb-3 d-flex align-items-center"
      :class="isOnline ? 'alert-success' : 'alert-warning'"
      role="status"
    >
      <span class="badge rounded-pill me-2" :class="isOnline ? 'bg-success' : 'bg-warning text-dark'"></span>
      <strong>{{ isOnline ? 'Online' : 'You are offline – viewing cached content' }}</strong>
      <small class="ms-auto text-muted">Last sync: {{ lastSyncText }}</small>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 m-0">Resources & Offline</h1>

      <!-- Tabs: All / Saved offline -->
      <div class="btn-group">
        <button class="btn btn-outline-secondary btn-sm" :class="{active:tab==='all'}"   @click="tab='all'">All</button>
        <button class="btn btn-outline-secondary btn-sm" :class="{active:tab==='saved'}" @click="tab='saved'">Saved offline</button>
      </div>
    </div>

    <div class="row g-3">
      <!-- ===== Left: list ===== -->
      <div class="col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="input-group mb-3">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input
                v-model.trim="keyword"
                class="form-control"
                type="text"
                placeholder="Search title..."
                @keyup.enter="applySearch"
                aria-label="Search by title"
              />
            </div>

            <div class="list-group list-scroll">
              <button
                v-for="r in visibleList"
                :key="r.id"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                :class="{'active-item': current?.id===r.id}"
                @click="openResource(r)"
              >
                <div class="me-2">
                  <div class="fw-semibold">{{ r.title }}</div>
                  <div class="text-muted small">Updated: {{ formatDate(r.updatedAtMs) }}</div>
                  <div class="mt-1">
                    <span v-for="t in (r.tags || [])" :key="t" class="badge rounded-pill bg-light text-dark me-1 small">{{ t }}</span>
                  </div>
                </div>
                <span
                  v-if="isSaved(r.id)"
                  class="badge bg-secondary align-self-center"
                  title="Saved offline"
                >offline</span>
              </button>

              <div v-if="visibleList.length===0" class="text-center text-muted py-5">
                <div class="mb-2">No items</div>
                <div class="small" v-if="tab==='saved'">Open a resource once in “All” to cache it for offline use.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Right: content panel ===== -->
      <div class="col-lg-7">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <template v-if="current">
              <div class="d-flex align-items-start justify-content-between">
                <div>
                  <h2 class="h5 mb-1">{{ current.title }}</h2>
                  <div class="text-muted small">Updated: {{ formatDate(current.updatedAtMs) }}</div>
                </div>
              </div>

              <hr />
              <div v-if="loadingContent" class="text-muted small">Loading content...</div>
              <div v-else class="resource-content" v-text="currentContent"></div>

              <div class="mt-3 small d-flex gap-2 align-items-center text-muted">
                <span>Source: {{ contentSource }}</span>
                <span>·</span>
                <span>Size: {{ prettySize(current.size) }}</span>
              </div>
            </template>

            <template v-else>
              <div class="text-muted py-5 text-center">
                Select a resource from the left to view its content.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import { getStorage, ref as sref, getBytes } from 'firebase/storage'

import { firebaseApp } from '@/services/firebase'

const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

/** ====== Types ====== */
type ResItem = {
  id: string
  title: string
  tags?: string[]
  status?: string
  storagePath: string
  size?: number
  updatedAtMs: number
  createdAtMs?: number
}

/** ====== Reactive state ====== */
const isOnline = ref<boolean>(navigator.onLine)

const tab = ref<'all' | 'saved'>('all')
const keyword = ref('')

const current = ref<ResItem | null>(null)

const loadingContent = ref(false)
const currentContent = ref<string>('')               
const contentSource = ref<'cloud' | 'local' | '-'>('-') 

/** ====== Helpers: dates & size ====== */
const formatDate = (ms?: number) => {
  if (!ms) return '-'
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}/${m}/${day}`
}
const prettySize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '-'
  const units = ['B','KB','MB','GB']
  let n = bytes, i=0
  while(n>=1024 && i<units.length-1){ n/=1024; i++ }
  return `${n.toFixed( (i===0)?0:1 )} ${units[i]}`
}

/** 
 * LocalStorage schema 
 * key:  hhh:res:<id>
 * value: {
 *   id, title, tags, storagePath, size, updatedAtMs,
 *   content: string,
 *   savedAtMs: number
 * }
 */
const LS_PREFIX = 'hhh:res:'
const lsKey = (id: string) => `${LS_PREFIX}${id}`

const readLocal = (id: string) => {
  const raw = localStorage.getItem(lsKey(id))
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}
const writeLocal = (payload: any) => {
  localStorage.setItem(lsKey(payload.id), JSON.stringify(payload))
}
const isSaved = (id: string) => !!readLocal(id)

const offlineList = computed<ResItem[]>(() => {
  const items: ResItem[] = []
  for (let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i) as string
    if (!k?.startsWith(LS_PREFIX)) continue
    const v = localStorage.getItem(k)
    if (!v) continue
    try{
      const obj = JSON.parse(v)
      items.push({
        id: obj.id,
        title: obj.title,
        tags: obj.tags || [],
        status: 'saved',
        storagePath: obj.storagePath,
        size: obj.size,
        updatedAtMs: obj.updatedAtMs || 0,
        createdAtMs: obj.createdAtMs || 0,
      })
    }catch{/*ignore*/}
  }
  return items.sort((a,b)=> (b.updatedAtMs||0) - (a.updatedAtMs||0))
})

/** ====== Derived visible list ====== */
const visibleList = computed<ResItem[]>(() => {
  const base = tab.value === 'all' ? allList.value : offlineList.value
  if (!keyword.value) return base
  const kw = keyword.value.toLowerCase()
  return base.filter(r => r.title?.toLowerCase().includes(kw))
})

/** ====== Fetch Firestore (All tab) ====== */
const allList = ref<ResItem[]>([])
const lastSync = ref<number | null>(null)

const fetchResources = async () => {
  const qy = query(collection(db, 'resources'), where('status','==','published'))
  const snap = await getDocs(qy)
  const rows: ResItem[] = []
  snap.forEach(doc => {
    const d: any = doc.data()
    rows.push({
      id: doc.id,
      title: d.title,
      tags: d.tags || [],
      status: d.status,
      storagePath: d.storagePath,
      size: d.size,
      updatedAtMs: (d.updatedAt?.toMillis?.() ?? d.updatedAt ?? 0),
      createdAtMs: (d.createdAt?.toMillis?.() ?? d.createdAt ?? 0),
    })
  })
  allList.value = rows.sort((a,b)=> (b.updatedAtMs||0) - (a.updatedAtMs||0))
  lastSync.value = Date.now()
}

/** ====== Open a resource (auto-cache) ====== */
const openResource = async (r: ResItem) => {
  current.value = r
  currentContent.value = ''
  loadingContent.value = true
  contentSource.value = '-'

  const local = readLocal(r.id)
  if (local?.content) {
    currentContent.value = local.content
    contentSource.value = 'local'
    loadingContent.value = false
  }

  // use getBytes to read file from Storage
  if (navigator.onLine && r.storagePath) {
    try {
      const fileRef = sref(storage, r.storagePath)
      const bytes = await getBytes(fileRef)
      const text = new TextDecoder('utf-8').decode(bytes)

      currentContent.value = text
      contentSource.value = 'cloud'
      writeLocal({ ...r, content: text, savedAtMs: Date.now() })
    } catch (e) {
      console.error('Storage read failed:', e)
      if (!local?.content) currentContent.value = '(Failed to load content.)'
    } finally {
      loadingContent.value = false
    }
  }
}

const applySearch = () => {
  // no-op, as v-model + computed already handles filtering
}

/** ====== Online/Offline listeners ====== */
const handleOnline = () => { isOnline.value = true }
const handleOffline = () => { isOnline.value = false }

onMounted(async () => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  if (navigator.onLine) await fetchResources()
})

watch(tab, async (t) => {
  // fetch all resources when switching to 'all' tab and online
  if (t==='all' && navigator.onLine) {
    await fetchResources()
  }
})

/** ====== Last sync display ====== */
const lastSyncText = computed(() => {
  if (!lastSync.value) return '—'
  const d = new Date(lastSync.value)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`
})
</script>

<style scoped>
.resource-offline-page .list-scroll{
  max-height: 70vh;
  overflow: auto;
}
.resource-offline-page .list-group-item{
  border: 0;
  border-bottom: 1px solid rgba(0,0,0,.06);
  padding: .75rem .5rem;
  text-align: left;
}
.resource-offline-page .list-group-item:hover{
  background: #f8f9fa;
}
.resource-offline-page .active-item{
  background: #eef6ff;
}
.resource-content{
  white-space: pre-wrap;     
  line-height: 1.6;
  min-height: 40vh;
}
.btn-group .btn.active{
  background: #0d6efd;
  color: #fff;
  border-color: #0d6efd;
}
</style>