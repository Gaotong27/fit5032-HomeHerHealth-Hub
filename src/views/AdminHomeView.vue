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

      <!-- Accordion：Events -->
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
          <!-- search/ filter-->
          <div class="card-sub p-3 mb-3">
            <div class="d-flex gap-3 flex-wrap">
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
            </div>
          </div>

          <!-- list -->
          <div class="row g-3">
            <div v-for="ev in visibleEvents" :key="ev.id" class="col-12">
              <div class="event-card card shadow-sm p-3 d-flex flex-wrap align-items-center gap-3">
                <img :src="getImageUrl(ev.image)" :alt="ev.title" class="thumb rounded-3 shadow-sm" />
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

                <!-- enter events detail -->
                <RouterLink class="btn btn-outline-primary ms-auto" :to="{ path: '/events/' + ev.slug }">
                  View details
                </RouterLink>
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
            <span class="h6 mb-0">Feedback</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">—</span>
          </div>
          <i class="bi" :class="activePanel==='feedback' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div class="panel-body">
          <EmptyState
            title="Feedback inbox"
            desc="View ratings, comments, and reports from users."
          />
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

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as eventsApi from '@/services/events'

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
  loadEvents()
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
.stats .stat{
  width: 120px;
  padding: 10px 14px;
  border: 1px solid #e7eaee;
  border-radius: 16px;
  text-align: center;
}
.stats .stat .label{
  font-size:12px; color:#5f6368; text-transform:uppercase; letter-spacing:.2px;
}
.stats .stat .value{
  font-weight:800; font-size:22px; line-height:1.1;
}

/* accordion */
.panel{
  border: 1px solid #e7eaee; border-radius: 16px;
}
.panel-head{
  width:100%; background:#fff; border:0;
  padding:14px 16px; border-radius:16px;
  display:flex; align-items:center; justify-content:space-between;
  font-weight:700; color:#202124;
}
.panel-head .bi{ font-size:18px; }
.panel-body{
  display:none; padding:16px;
  border-top:1px solid #eef1f4;
}
.panel.open .panel-body{ display:block; }

.card-sub{ border:1px solid #e7eaee; border-radius:12px; background:#f9fafb; }

/* event list */
.event-card{ border: 1px solid #e7eaee; border-radius: 16px; }
.thumb{ width: 128px; height: 96px; object-fit: cover; }
.meta i{ opacity:.6; }

/* empties */
.empty .icon{ font-size:28px; opacity:.5; }
</style>
