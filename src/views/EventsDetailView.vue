<!-- src/views/EventDetailView.vue -->
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
                <p class="about mb-3">
                  {{ specificDesc }}
                </p>

                <!-- learn points -->
                <ul class="learn-list">
                  <li v-for="(item, i) in learnPoints" :key="i">• {{ item }}</li>
                </ul>

                <!-- CTA -->
                <div class="d-grid gap-2 mt-4">
                  <router-link
                    v-if="!user"
                    class="btn btn-primary btn-lg"
                    :to="{ name: 'login' }"
                  >
                    Sign in to register
                  </router-link>

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
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getEventBySlug } from '@/services/events'

const route = useRoute()
const event = ref(null)
const user = ref(null)
const alreadyRegistered = ref(false)
const registering = ref(false)

/* ---------- utils: use email (lowercased) as unique key ---------- */
function getImageUrl(fileName) {
  return new URL(`../assets/events/${fileName}`, import.meta.url).href
}
function getUserKey(u) {
  return u?.email ? String(u.email).trim().toLowerCase() : null
}
// read / save registrations for an event (array of emails)
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
// dedupe old data and persist back
function normalizeRegistrations(eventId) {
  const unique = Array.from(new Set(getRegistrations(eventId)))
  saveRegistrations(eventId, unique)
  return unique
}

/* ---------- load & state ---------- */
async function load() {
  // base event
  event.value = await getEventBySlug(route.params.slug)

  // current user (ensure lowercased email)
  const raw = localStorage.getItem('hhh_user')
  user.value = raw ? JSON.parse(raw) : null
  if (user.value?.email) user.value.email = String(user.value.email).trim().toLowerCase()

  // sync registrations from localStorage (deduped)
  if (event.value) {
    const unique = normalizeRegistrations(event.value.id)
    const key = getUserKey(user.value)
    event.value.registrations = unique.length
    alreadyRegistered.value = !!(key && unique.includes(key))
  }
}
onMounted(load)
watch(() => route.params.slug, load)

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
const learnPoints = computed(() => [
  'Nutrition basics with a 7-day meal template',
  'Beginner-friendly 30–40 min exercise routine',
  'Mindfulness techniques for daily stress relief',
  'Q&A with facilitator and take-home checklist'
])

/* ---------- actions: email-based register / cancel ---------- */
function register() {
  if (!event.value || !user.value || status.value !== 'open' || registering.value) return
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

  // update UI
  event.value.registrations = next.length
  alreadyRegistered.value = false
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

/* note area inside the big card */
.detail-note{
  margin-top:16px;
  background:#f7f9fc;
  border:1px solid #e7eaee;
  border-radius:14px;
  padding:10px 14px;
}

.btn{ border-radius:20px; font-weight:700; padding:12px 18px; }
.btn-danger{ background:#d93025; color:#fff; border:0; }
.btn-danger:hover{ filter:brightness(.95); }
</style>
