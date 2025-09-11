<template>
  <section class="event-detail-page">
    <div class="container py-5">
      <router-link class="link-back" :to="{ name: 'events' }">← Back to Events</router-link>

      <!-- unified big card -->
      <div class="detail-card shadow-lg" v-if="event">
        <!-- title -->
        <h1 class="title">{{ event.title }}</h1>

        <div class="row g-4">
          <!-- left: cover -->
          <div class="col-lg-7">
            <img
              :src="getImageUrl(event.image)"
              :alt="event.title"
              class="hero-img rounded-3 shadow-sm"
            />
          </div>

          <!-- right: info panel -->
          <div class="col-lg-5">
            <div class="panel card shadow-sm">
              <div class="card-body">
                <!-- status + capacity -->
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <span class="badge rounded-pill"
                    :class="{
                      'bg-success': status==='open',
                      'bg-danger':  status==='full',
                      'bg-secondary': status==='ended'
                    }">
                    {{ statusText }}
                  </span>
                  <span class="chip">{{ event.registrations }} / {{ event.capacity }}</span>
                </div>

                <div class="divider"></div>

                <!-- key info -->
                <ul class="list-unstyled mb-3 key-info">
                  <li class="mb-2">
                    <span class="key">Date:</span><span class="val">{{ event.date }}</span>
                  </li>
                  <li class="mb-2">
                    <span class="key">Location:</span><span class="val">{{ event.location }}</span>
                  </li>
                  <li class="mb-2">
                    <span class="key">Remaining:</span><span class="val">{{ remaining }}</span>
                  </li>
                </ul>

                <div class="divider"></div>

                <!-- about -->
                <h6 class="section-title">About this event</h6>
                <p class="about mb-3" v-html="safeAboutHtml"></p>

                <!-- learn points -->
                <ul class="learn-list">
                  <li v-for="(item, i) in learnPoints" :key="i">• {{ item }}</li>
                </ul>

                <!-- ===== Ratings ===== -->
                <div class="divider mt-3"></div>
                <h6 class="section-title">Ratings</h6>

                <!-- Not logged in: Only read the rating summary -->
                <div v-if="!user" class="card p-3 mb-3">
                  <div class="rating-summary">
                    <div class="count">{{ formattedCount }}</div>
                    <div class="score">{{ summary.count ? summary.avg.toFixed(1) : '—' }}</div>
                    <div class="stars">
                      <i v-for="(icon, i) in starIcons" :key="i" class="bi" :class="icon"></i>
                    </div>
                  </div>
                </div>


                <!-- Administrator: Read-only statistics + View list -->
                <div v-else-if="user.role === 'admin'" class="card p-3 mb-3">
                  <div class="d-flex align-items-center gap-3">
                    <div>
                      <div class="display-avg">{{ summary.avg.toFixed(1) }}</div>
                      <div class="text-muted small">{{ summary.count }} ratings</div>
                    </div>
                    <ul class="mb-0 ms-3 small">
                      <li v-for="n in 5" :key="'dist-admin-'+n">{{ 6 - n }}★ : {{ summary.dist[5 - n] }}</li>
                    </ul>
                    <button class="btn btn-outline-secondary btn-sm ms-auto"
                            @click="() => { showRaters = !showRaters; if (showRaters) loadRatersList() }">
                      {{ showRaters ? 'Hide raters' : 'View raters' }}
                    </button>
                  </div>

                  <div v-if="showRaters" class="mt-3">
                    <div class="table-responsive">
                      <table class="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th style="width:28%">User</th>
                            <th style="width:32%">Email</th>
                            <th style="width:12%">Rating</th>
                            <th style="width:28%">Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="raterRows.length === 0">
                            <td colspan="4" class="text-muted">No ratings yet.</td>
                          </tr>
                          <tr v-for="row in raterRows" :key="row.email">
                            <td>{{ row.name }}</td>
                            <td>{{ row.email }}</td>
                            <td>{{ row.value }}★</td>
                            <td>{{ new Date(row.updatedAt).toLocaleString() }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Users: can submit by star rating -->
                <div v-else class="d-flex align-items-center gap-2 mb-2">
                  <StarRating v-model="myRating" />
                  <button class="btn btn-success btn-sm" :disabled="saving || !myRating" @click="saveRating">
                    {{ saving ? 'Saving…' : (myRating ? 'Submit' : 'Select stars') }}
                  </button>
                  <span class="small text-muted ms-2">
                    Avg {{ summary.avg.toFixed(2) }} ({{ summary.count }})
                  </span>
                </div>
                <div v-if="flash" class="text-success small">Thanks for your feedback!</div>


                <!-- ===== Registrations (Admin only, read-only) ===== -->
                <div v-if="user && user.role === 'admin'" class="card p-3 mt-3 mb-2">
                  <div class="d-flex align-items-center gap-3">
                    <div>
                      <div class="display-avg">{{ event.registrations }}</div>
                      <div class="text-muted small">registrations</div>
                    </div>
                    <div class="ms-3 small">
                      Capacity: <strong>{{ event.capacity }}</strong>
                      <span class="text-muted ms-2">Remaining: {{ remaining }}</span>
                    </div>

                    <button
                      class="btn btn-outline-secondary btn-sm ms-auto"
                      @click="() => { showRegistrants = !showRegistrants; if (showRegistrants) loadRegistrantsList() }"
                    >
                      {{ showRegistrants ? 'Hide registrants' : 'View registrants' }}
                    </button>
                  </div>

                  <!-- List Table (read-only) -->
                  <div v-if="showRegistrants" class="mt-3">
                    <div class="table-responsive">
                      <table class="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th style="width:30%">User</th>
                            <th style="width:70%">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="registrantRows.length === 0">
                            <td colspan="2" class="text-muted">No registrations yet.</td>
                          </tr>
                          <tr v-for="row in registrantRows" :key="row.email">
                            <td>{{ row.name }}</td>
                            <td>{{ row.email }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <!-- ===== /Registrations ===== -->

                <!-- CTA：Only displayed by not logged in or ordinary users -->
                <div class="d-grid gap-2 mt-4" v-if="!user || user.role !== 'admin'">
                  <!-- Not logged in: Log in -->
                  <router-link
                    v-if="!user"
                    class="btn btn-primary btn-lg"
                    :to="{ name: 'login' }"
                  >
                    Sign in to register
                  </router-link>

                  <!-- User: Registration cancelled -->
                  <template v-else>
                    <button
                      v-if="!alreadyRegistered"
                      class="btn btn-success btn-lg"
                      :disabled="status!=='open' || registering"
                      @click="register"
                    >
                      {{ registering ? 'Registering…' : 'Register now' }}
                    </button>

                    <button
                      v-else
                      class="btn btn-danger btn-lg"
                      @click="cancelOnDetail"
                    >
                      Cancel registration
                    </button>
                  </template>
                </div>
                <!-- /CTA -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <p class="text-danger mb-3">Event not found.</p>
        <router-link class="btn btn-primary" :to="{ name: 'events' }">Back</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { sanitizeHtml } from '@/utils/sanitize'
import { useRoute } from 'vue-router'
import { getEventBySlug } from '@/services/events'
import StarRating from '@/components/StarRating.vue'
import { ratings } from '@/services/ratings'

const route = useRoute()
const event = ref(null)
const user = ref(null)
const alreadyRegistered = ref(false)
const registering = ref(false)

/* ratings */
const summary = ref({ avg: 0, count: 0, dist: [0,0,0,0,0] })
const myRating = ref(0)
const saving = ref(false)
const flash = ref(false)
const showRaters = ref(false)
const raterRows = ref([])

// The five stars corresponding to the average score (full, half and empty)
const starIcons = computed(() => {
  const a = Math.max(0, Math.min(5, Number(summary.value.avg || 0)));
  const res = [];
  for (let i = 1; i <= 5; i++) {
    if (a >= i - 0.25) res.push('bi-star-fill');   
    else if (a >= i - 0.75) res.push('bi-star-half'); 
    else res.push('bi-star');                       
  }
  return res;
});

// “X ratings / No ratings yet” 
const formattedCount = computed(() => {
  const c = summary.value.count || 0;
  return c ? `${c.toLocaleString()} ratings` : 'No ratings yet';
});

/* registrations (admin view only) */
const showRegistrants = ref(false)
const registrantRows = ref([])

function loadRatersList() {
  if (!event.value) return
  const rows = ratings.list(event.value.id)
  raterRows.value = rows.map(r => ({
    email: r.userKey,
    name: r.userKey.split('@')[0],
    value: r.value,
    updatedAt: r.updatedAt
  }))
}

function loadRegistrantsList() {
  if (!event.value) return
  const emails = getRegistrations(event.value.id)
  registrantRows.value = emails.map(em => ({
    email: em,
    name: em.split('@')[0]
  }))
}

/* ---------- utils ---------- */
function getImageUrl(fileName) {
  return new URL(`../assets/events/${fileName}`, import.meta.url).href
}
function getUserKey(u) {
  return u?.email ? String(u.email).trim().toLowerCase() : null
}

/* registrations in localStorage */
function getRegistrations(eventId) {
  const data = JSON.parse(localStorage.getItem('hhh_registrations') || '{}')
  const list = data[eventId]
  return Array.isArray(list) ? list : []
}
function saveRegistrations(eventId, list) {
  const data = JSON.parse(localStorage.getItem('hhh_registrations') || '{}')
  data[eventId] = list
  localStorage.setItem('hhh_registrations', JSON.stringify(data))
}
function normalizeRegistrations(eventId) {
  const unique = Array.from(new Set(getRegistrations(eventId)))
  saveRegistrations(eventId, unique)
  return unique
}

/* ---------- load ---------- */
async function load() {
  event.value = await getEventBySlug(route.params.slug)

  const raw = localStorage.getItem('hhh_user')
  user.value = raw ? JSON.parse(raw) : null
  if (user.value?.email) user.value.email = String(user.value.email).trim().toLowerCase()

  if (event.value) {
    const unique = normalizeRegistrations(event.value.id)
    const key = getUserKey(user.value)
    event.value.registrations = unique.length
    alreadyRegistered.value = !!(key && unique.includes(key))
  }

  loadRatings()

  if (user.value?.role === 'admin') loadRegistrantsList()
}

function loadRatings() {
  if (!event.value) return
  summary.value = ratings.getSummary(event.value.id)
  const key = getUserKey(user.value)
  myRating.value = key ? ratings.getUserRating(event.value.id, key) : 0
  if (user.value?.role === 'admin') loadRatersList()
}

onMounted(load)
watch(() => route.params.slug, load)
watch([() => event.value?.id, () => user.value?.email], loadRatings)
watch([() => event.value?.id, () => user.value?.role], () => {
  if (user.value?.role === 'admin') loadRegistrantsList()
})

/* ---------- derived ---------- */
const status = computed(() => {
  if (!event.value) return 'loading'
  const today = new Date()
  const date = new Date(event.value.date)
  if (date < today) return 'ended'
  if (event.value.registrations >= event.value.capacity) return 'full'
  return 'open'
})
const statusText = computed(() =>
  status.value === 'open' ? 'Open' :
  status.value === 'full' ? 'Full' : 'Ended'
)
const remaining = computed(() =>
  Math.max(0, (event.value?.capacity || 0) - (event.value?.registrations || 0))
)
const specificDesc = computed(() =>
  event.value?.content
    ? `${event.value.content} This session includes guided activities and take-home resources to help you put ideas into practice immediately.`
    : 'This session provides practical guidance with hands-on activities and take-home resources.'
)
const safeAboutHtml = computed(() => sanitizeHtml(specificDesc.value))
const learnPoints = computed(() => [
  'Nutrition basics with a 7-day meal template',
  'Beginner-friendly 30–40 min exercise routine',
  'Mindfulness techniques for daily stress relief',
  'Q&A with facilitator and take-home checklist'
])

/* ---------- actions: register / cancel ---------- */
function register() {
  if (!event.value || !user.value || status.value !== 'open' || registering.value) return
  if (user.value?.role === 'admin') return   

  registering.value = true

  const key = getUserKey(user.value)
  if (!key) { registering.value = false; return }

  const unique = new Set(getRegistrations(event.value.id))
  if (unique.has(key)) {
    alreadyRegistered.value = true
    registering.value = false
    return
  }
  unique.add(key)
  const list = Array.from(unique)
  saveRegistrations(event.value.id, list)

  event.value.registrations = list.length
  alreadyRegistered.value = true
  registering.value = false
}

function cancelOnDetail() {
  if (!event.value || !user.value) return
  if (!confirm('Cancel this registration?')) return

  const key = getUserKey(user.value)
  const list = getRegistrations(event.value.id)
  const next = list.filter(e => e !== key)
  saveRegistrations(event.value.id, next)

  event.value.registrations = next.length
  alreadyRegistered.value = false
}

/* ---------- actions: ratings ---------- */
function saveRating() {
  if (!event.value || !user.value) return
  if (user.value.role === 'admin') return 
  const key = getUserKey(user.value)
  if (!key || !myRating.value) return
  saving.value = true
  summary.value = ratings.set(event.value.id, key, myRating.value)
  saving.value = false
  flash.value = true
  setTimeout(() => (flash.value = false), 1200)
}

function resetRatings() {
  if (user.value?.role !== 'admin') return
  if (!confirm('Reset all ratings for this event?')) return
  summary.value = ratings.clearEvent(event.value.id)
  myRating.value = 0
  loadRatersList()
}
</script>

<style scoped>
.event-detail-page{
  background:#f6f8fb;
  min-height:calc(100dvh - 72px);
  font-family:"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.link-back{
  display:inline-block;
  margin-bottom:12px;
  text-decoration:none;
  color:#1a73e8;
  font-weight:600;
}
.link-back:hover{ text-decoration:underline; }

/* unified big card */
.detail-card{
  background:#fff;
  border:1px solid #e7eaee;
  border-radius:28px;
  padding:24px 28px 12px;
}

.title{
  font-weight:800;
  font-size: clamp(28px, 3.2vw, 44px);
  line-height:1.06;
  color:#202124;
  margin-bottom:16px;
}

.hero-img{
  width:100%;
  max-height:560px;
  object-fit:cover;
}

/* inside right card */
.panel{
  border:0;
  border-radius:18px;
}
.panel .card-body{ padding:20px; }

.badge{ font-weight:700; padding:8px 12px; letter-spacing:.2px; }
.chip{
  display:inline-block; background:#f1f3f4; color:#202124;
  padding:8px 12px; border-radius:999px; font-weight:700;
}

.key-info .key{
  width:95px; display:inline-block; color:#5f6368; font-weight:600;
}
.key-info .val{ color:#202124; }

.divider{ height:1px; background:#e7eaee; margin:12px 0; }

.section-title{
  font-weight:800; font-size:14px; color:#202124;
  letter-spacing:.2px; text-transform:uppercase; margin-bottom:6px;
}
.about{ color:#202124; margin-bottom:10px; }
.learn-list{ list-style:none; padding:0; margin:0; }
.learn-list li{ color:#5f6368; margin-bottom:6px; }

.display-avg { font-size: 32px; font-weight: 800; line-height: 1; }
.alert { border-radius: 14px; }

.rating-summary{
  text-align:center;
  display:flex;                
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.rating-summary .count{
  font-size:12px;
  color:#6b7280;
  font-weight:700;
  letter-spacing:.3px;
  text-transform:uppercase;
}
.rating-summary .score{
  font-size:42px;
  font-weight:800;
  line-height:1.1;
  margin:4px 0 6px;
}

.rating-summary .stars{ margin-top:2px; }
.rating-summary .stars .bi{ font-size:20px; margin:0 2px; }
.rating-summary .stars .bi-star-fill,
.rating-summary .stars .bi-star-half{ color:#f5b301; }   
.rating-summary .stars .bi-star{ color:#d1d5db; }        

.rating-summary.compact .score{ font-size:28px; }
.rating-summary.compact .stars .bi{ font-size:18px; }


.btn{ border-radius:20px; font-weight:700; padding:12px 18px; }
.btn-danger{ background:#d93025; color:#fff; border:0; }
.btn-danger:hover{ filter:brightness(.95); }
</style>
