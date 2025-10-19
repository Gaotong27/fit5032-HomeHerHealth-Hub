<template>
  <section class="admin-page">
    <div class="container py-5">

      <!-- ===== Dashboard header & stats ===== -->
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

      <!-- ===== Events panel ===== -->
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
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div class="d-flex gap-2 align-items-center">
                  <select v-model="statusSelect" class="form-select form-select-sm w-auto">
                    <option value="">All statuses</option>
                    <option value="open">Open</option>
                    <option value="full">Full</option>
                    <option value="ended">Ended</option>
                  </select>
                  <input v-model="qTable" class="form-control form-control-sm" placeholder="Quick search all..." style="width:200px"/>
                  <button class="btn btn-primary btn-sm" @click="openCreate">+ Add New Event</button>
                </div>
              </div>

              <AgGridVue
                class="ag-theme-quartz"
                style="width: 100%; height: 600px"
                :rowData="events"
                :columnDefs="eventColDefs"
                :defaultColDef="defaultColDef"
                :quickFilterText="qTable"
                :pagination="true"
                :paginationPageSize="10"
                :animateRows="true"
                @grid-ready="onEventGridReady"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Users panel (AG Grid) ===== -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='users' }">
        <button class="panel-head" @click="toggle('users')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-people"></i>
            <span class="h6 mb-0">Users</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">{{ users.length }}</span>
          </div>
          <i class="bi" :class="activePanel==='users' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>

        <div class="panel-body">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <input v-model="qUsers" class="form-control form-control-sm" placeholder="Quick search all..." style="width:220px"/>
              </div>

              <AgGridVue
                class="ag-theme-quartz"
                style="width: 100%; height: 520px"
                :rowData="users"
                :columnDefs="userColDefs"
                :defaultColDef="defaultColDef"
                :quickFilterText="qUsers"
                :pagination="true"
                :paginationPageSize="10"
                :animateRows="true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Ratings & Comments panel (AG Grid) ===== -->
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
          <div class="card-sub p-3 mb-3 d-flex gap-2 align-items-center flex-wrap">
            <select v-model="selectedEvent" class="form-select w-auto">
              <option value="">All Events</option>
              <option v-for="e in eventList" :key="e.id" :value="e.id">{{ e.title }}</option>
            </select>
            <button class="btn btn-outline-secondary btn-sm" @click="reloadFeedbacks">Refresh</button>

            <div class="ms-auto d-flex gap-2 align-items-center">
              <input v-model="qFb" class="form-control form-control-sm" placeholder="Quick search all..." style="width:220px"/>
            </div>
          </div>

          <AgGridVue
            class="ag-theme-quartz"
            style="width: 100%; height: 520px"
            :rowData="feedbacks"
            :columnDefs="fbColDefs"
            :defaultColDef="defaultColDef"
            :quickFilterText="qFb"
            :pagination="true"
            :paginationPageSize="10"
            :animateRows="true"
          />
        </div>
      </div>

      <!-- ===== Resources panel (AG Grid like Events) ===== -->
      <div class="panel card shadow-sm mb-3" :class="{ open: activePanel==='resources' }">
        <button class="panel-head" @click="toggle('resources')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-journal-medical"></i>
            <span class="h6 mb-0">Resources</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">{{ resources.length }}</span>
          </div>
          <i class="bi" :class="activePanel==='resources' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>

        <div class="panel-body">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div class="d-flex gap-2 align-items-center">
                  <select v-model="resStatus" class="form-select form-select-sm w-auto">
                    <option value="">All statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <input v-model="qRes" class="form-control form-control-sm" placeholder="Quick search all..." style="width:220px" />
                  <button class="btn btn-primary btn-sm" @click="openResCreate">+ Add New Resource</button>
                </div>
              </div>

              <AgGridVue
                class="ag-theme-quartz"
                style="width: 100%; height: 520px"
                :rowData="resources"
                :columnDefs="resColDefs"
                :defaultColDef="defaultColDef"
                :quickFilterText="qRes"
                :pagination="true"
                :paginationPageSize="10"
                :animateRows="true"
                @grid-ready="onResGridReady"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Modal: create / edit resource ===== -->
      <teleport to="body">
        <div v-if="showResModal">
          <div class="modal fade show d-block" tabindex="-1" style="z-index:1055">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content border-0 rounded-4">
                <div class="modal-header">
                  <h5 class="modal-title">{{ resEditing ? 'Edit Resource' : 'Create Resource' }}</h5>
                  <button type="button" class="btn-close" @click="closeResModal"></button>
                </div>
                <div class="modal-body">
                  <div class="row g-2">
                    <div class="col-md-7">
                      <label class="form-label small">Title</label>
                      <input v-model.trim="resForm.title" class="form-control" />
                    </div>
                    <div class="col-md-5">
                      <label class="form-label small">Status</label>
                      <select v-model="resForm.status" class="form-select">
                        <option value="published">published</option>
                        <option value="draft">draft</option>
                      </select>
                    </div>

                    <div class="col-md-12">
                      <label class="form-label small">Tags (comma separated)</label>
                      <input v-model.trim="resForm.tags" class="form-control" placeholder="women, health" />
                    </div>

                    <div class="col-md-12">
                      <label class="form-label small">Upload file (.md / .txt / .json)</label>
                      <input type="file" accept=".md,.txt,.json" class="form-control" @change="onResFileChange" />
                      <small class="text-muted">Will be stored under Storage: <code>resources/</code></small>
                      <div v-if="resForm.preview" class="mt-2 small text-muted" style="max-height:110px;overflow:auto;white-space:pre-wrap;border:1px solid #eee;border-radius:8px;padding:8px;">
                        {{ resForm.preview }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-light" @click="closeResModal">Cancel</button>
                  <button class="btn btn-success" :disabled="resSaving" @click="saveResource">
                    {{ resSaving ? 'Saving…' : (resEditing ? 'Save changes' : 'Create') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-backdrop fade show" style="z-index:1050"></div>
        </div>
      </teleport>

      <!-- ===== Reports panel (Firestore) ===== -->
      <div class="panel card shadow-sm" :class="{ open: activePanel==='reports' }">
        <button class="panel-head" @click="toggle('reports')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-graph-up"></i>
            <span class="h6 mb-0">Reports</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">{{ events.length }}</span>
          </div>
          <i class="bi" :class="activePanel==='reports' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>

        <div class="panel-body">
          <div class="row g-3">
            <!-- chart 1：Events Registrations vs Capacity -->
            <div class="col-lg-7">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>Event Registrations vs Capacity</strong>
                    <small class="text-muted">source: Firestore /events</small>
                  </div>
                  <div class="chart-box">
                    <canvas ref="evtBarRef"></canvas>
                  </div>
                </div>
              </div>
            </div>

            <!-- chart 2：Ratings Distribution (1–5★) -->
            <div class="col-lg-5">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>Ratings Distribution</strong>
                    <small class="text-muted">source: Realtime DB /ratings</small>
                  </div>
                  <div class="chart-box">
                    <canvas ref="ratingPieRef"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="small text-muted mt-3 d-flex flex-wrap gap-3">
            <span><strong>Events:</strong> {{ events.length }}</span>
            <span><strong>Total capacity:</strong> {{ totalCapacity }}</span>
            <span><strong>Total registrations:</strong> {{ totalRegistrations }}</span>
            <span><strong>Ratings count:</strong> {{ totalRatings }}</span>
          </div>
        </div>
      </div>

      <!-- ===== Modal: create / edit event ===== -->
      <teleport to="body">
        <div v-if="showModal">
          <div class="modal fade show d-block" tabindex="-1" style="z-index:1055">
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
                      <label class="form-label small">Date</label>
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
                    <div class="col-12">
                      <label class="form-label small">Upload image</label>
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
          <div class="modal-backdrop fade show" style="z-index:1050"></div>
        </div>
      </teleport>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import Chart from 'chart.js/auto'

import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { getDatabase, ref as dbRef, onValue, remove as dbRemove } from 'firebase/database'
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getAuth } from 'firebase/auth'                
import { firebaseApp } from '@/services/firebase'


/* ---------- Firebase handles ---------- */
const db = getFirestore(firebaseApp)
const rtdb = getDatabase(firebaseApp)
const storage = getStorage(firebaseApp)
const auth = getAuth(firebaseApp)                      

/* ---------- router ---------- */
const route = useRoute()
const router = useRouter()


/* ---------- panel state ---------- */
const PANELS = ['events','users','feedback','resources','clinics','content','reports','settings']
const qPanel = String(route.query.panel || '').toLowerCase()
const activePanel = ref(PANELS.includes(qPanel) ? qPanel : '')   

function toggle(id){
  activePanel.value = activePanel.value === id ? '' : id
  router.replace({
    name: route.name,
    query: activePanel.value ? { panel: activePanel.value } : {} 
  })
}

/**
 * EVENTS (AG Grid)
 */
const events = ref([])
const qTable = ref('')
const statusSelect = ref('')
const eventGridApi = ref(null)

const defaultColDef = { sortable:true, filter:true, resizable:true, floatingFilter:true }

const eventColDefs = ref([
  {
    headerName:'Image', width:110, filter:false, sortable:false,
    cellRenderer:p=>{
      const img=document.createElement('img')
      img.src=p.data.imageUrl||''
      img.alt=p.data.title||''
      Object.assign(img.style,{width:'84px',height:'56px',objectFit:'cover',borderRadius:'8px',background:'#f2f4f7'})
      return img
    }
  },
  { headerName:'Title', field:'title', minWidth:220 },
  { headerName:'Date', field:'date', width:140, comparator:(a,b)=>new Date(a)-new Date(b) },
  { headerName:'Location', field:'location', minWidth:160 },
  { headerName:'Status', field:'status', width:110,
    valueFormatter:p=>(p.value||'').charAt(0).toUpperCase()+(p.value||'').slice(1) },
  { headerName:'Capacity', field:'capacity', width:120 },
  { headerName:'Registered', field:'registrations', width:130 },
  {
    headerName:'Action', width:220, filter:false, sortable:false,
    cellRenderer:p=>{
      const wrap=document.createElement('div'); wrap.style.display='flex'; wrap.style.gap='8px'
      const v=document.createElement('button'); v.className='btn btn-success btn-sm'; v.textContent='View'
      v.addEventListener('click',()=>router.push({path:`/events/${p.data.slug}`}))
      const e=document.createElement('button'); e.className='btn btn-outline-secondary btn-sm'; e.textContent='Edit'
      e.addEventListener('click',()=>openEdit(p.data))
      const d=document.createElement('button'); d.className='btn btn-outline-danger btn-sm'; d.textContent='Delete'
      d.addEventListener('click',()=>removeEvent(p.data))
      wrap.append(v,e,d); return wrap
    }
  }
])

function onEventGridReady(params){
  resGridApi.value = params.api
  applyResStatus(resStatus.value)
}

watch(qTable, v => eventGridApi.value?.setQuickFilter(v))
watch(statusSelect, applyStatusFilter)

function applyStatusFilter(val){
  if(!eventGridApi.value) return
  if(!val) eventGridApi.value.setFilterModel(null)
  else eventGridApi.value.setFilterModel({ status:{ filterType:'text', type:'equals', filter: val } })
}

/* realtime events */
onMounted(()=>{
  onSnapshot(collection(db,'events'), snap=>{
    const today=new Date()
    events.value = snap.docs.map(d=>{
      const ev=d.data()
      const cap=Number(ev.capacity||0)
      const regs=Number(ev.registrations ?? ev.bookedCount ?? 0)
      const dateObj=new Date(ev.date)
      const status = dateObj<today ? 'ended' : regs>=cap ? 'full' : 'open'
      return { id:d.id, slug:ev.slug||d.id, title:ev.title||d.id, location:ev.location||'',
               date:ev.date, imageUrl:ev.imageUrl||'', capacity:cap, registrations:regs, status, _dateObj:dateObj }
    })
  })

  loadAllEvents().then(loadFeedbacks)
})

/* totals for stats */
const totals = computed(()=>({
  all: events.value.length,
  open: events.value.filter(e=>e.status==='open').length,
  full: events.value.filter(e=>e.status==='full').length,
  ended: events.value.filter(e=>e.status==='ended').length
}))

/* ----- Event modal & CRUD ----- */
const showModal=ref(false), editing=ref(false), saving=ref(false), selectedFile=ref(null)
const form=ref({ title:'', slug:'', startAt:'', location:'', capacity:0, description:'', imageUrl:'', status:'open' })

function randomSlug(len=8){return'ev-'+Array.from(crypto.getRandomValues(new Uint8Array(len))).map(b=>'abcdefghijklmnopqrstuvwxyz0123456789'[b%36]).join('')}
async function allocSlug(){
  for(let i=0;i<5;i++){const s=randomSlug(); if(!(await getDoc(doc(db,'events',s))).exists()) return s}
  throw new Error('Failed to generate a unique slug, please retry.')
}
function onFileChange(e){const f=e.target.files?.[0]; if(!f) return; selectedFile.value=f; form.value.previewUrl=URL.createObjectURL(f)}
async function openCreate(){editing.value=false;selectedFile.value=null;form.value={title:'',slug:'',startAt:'',location:'',capacity:0,description:'',imageUrl:'',status:'open',previewUrl:''};showModal.value=true;form.value.slug=await allocSlug()}
function openEdit(ev){editing.value=true;form.value={title:ev.title,slug:ev.slug,startAt:ev.date,location:ev.location,capacity:ev.capacity,description:ev.description||'',imageUrl:ev.imageUrl||'',status:ev.status||'open',bookedCount:Number(ev.bookedCount||ev.registrations||0),previewUrl:''};showModal.value=true}
function closeModal(){showModal.value=false}

async function save(){
  if(!form.value.title){ alert('Please enter title'); return }
  saving.value=true
  try{
    let imageUrl=form.value.imageUrl||''
    if(selectedFile.value){
      const f=selectedFile.value, ext=(f.name.split('.').pop()||'png').toLowerCase()
      const r=sref(storage,`events/${form.value.slug}.${ext}`)
      await uploadBytes(r,f); imageUrl=await getDownloadURL(r)
    }
    const payload={ ...form.value, date:form.value.startAt, capacity:+form.value.capacity, imageUrl, updatedAt:serverTimestamp() }
    const ref=doc(db,'events',form.value.slug)
    editing.value ? await updateDoc(ref,payload) : await setDoc(ref,{...payload,createdAt:serverTimestamp()})
    showModal.value=false
  }catch(e){ alert(e.message || 'Failed to save') } finally{ saving.value=false }
}
async function removeEvent(ev){ if(confirm(`Delete "${ev.title}"?`)) await deleteDoc(doc(db,'events',ev.slug)) }

/**
 * USERS (AG Grid)
 */
const users = ref([])
const qUsers = ref('')

const userColDefs = ref([
  { headerName:'Email', field:'email', minWidth:240,
    cellRenderer:p=>{
      const a=document.createElement('a'); a.href=`mailto:${p.value||''}`; a.textContent=p.value||''; return a
    }
  },
  { headerName:'Username', field:'name', minWidth:180 },
  { headerName:'Gender', field:'gender', width:120,
    valueFormatter:p=> (p.value||'').toString().toLowerCase()
  },
  { headerName:'Age', field:'age', width:100, filter:'agNumberColumnFilter' },
  { headerName:'Reason', field:'reason', flex:1, minWidth:260 },
  { headerName:'Created', field:'createdAt', minWidth:180,
    comparator:(a,b)=>new Date(a)-new Date(b),
    valueFormatter:p=> p.value ? new Date(p.value).toLocaleString() : ''
  }
])

/* Not include admin */
onMounted(()=>{
  onSnapshot(collection(db,'users'), snap=>{
    const meUid   = auth.currentUser?.uid || ''
    const meEmail = (auth.currentUser?.email || '').toLowerCase()

    users.value = snap.docs
      .map(d=>{
        const u=d.data()
        return {
          id: d.id,
          email: (u.email || '').toLowerCase(),
          name: u.name || u.username || d.id.slice(0,8),
          gender: (u.gender || '').toString().toLowerCase(),
          age: Number(u.age ?? ''),
          reason: u.reason || u.about || '',
          role: (u.role || '').toString().toLowerCase(),          
          createdAt: u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : (u.createdAt || '')
        }
      })
      .filter(u=>{
        const isAdminRole = u.role === 'admin'
        const isMe = (u.id === meUid) || (meEmail && u.email === meEmail)
        return !isAdminRole && !isMe
      })
  })
})

/**
 * FEEDBACK (AG Grid)
 */
const eventList = ref([])          // for dropdown
const selectedEvent = ref('')      // dropdown filter
const feedbacks = ref([])
const qFb = ref('')

async function loadAllEvents(){
  const snap = await getDocs(collection(db,'events'))
  eventList.value = snap.docs.map(d=>({ id:d.id, title:d.data().title || d.id }))
}

/* cache for user profiles */
const userCache = new Map()
async function getUserProfile(uid){
  if(userCache.has(uid)) return userCache.get(uid)
  try{
    const s=await getDoc(doc(db,'users',uid))
    const data=s.exists()?s.data():{}
    const prof={ name:data.name || data.username || uid.slice(0,8), email:data.email || '' }
    userCache.set(uid,prof); return prof
  }catch{
    const prof={ name:uid.slice(0,8), email:'' }; userCache.set(uid,prof); return prof
  }
}

/* realtime ratings */
function loadFeedbacks(){
  const ratingsRef = dbRef(rtdb, 'ratings')
  onValue(ratingsRef, async (snapshot)=>{
    const data=snapshot.val() || {}
    const rows=[]
    for(const [eventId, usersObj] of Object.entries(data)){
      if(selectedEvent.value && selectedEvent.value !== eventId) continue
      const perEvent = usersObj || {}
      const uids = Object.keys(perEvent)
      const profiles = await Promise.all(uids.map(getUserProfile))
      const dict = Object.fromEntries(uids.map((u,i)=>[u,profiles[i]]))
      for(const [uid, r] of Object.entries(perEvent)){
        const prof=dict[uid] || {}
        rows.push({
          eventId,
          eventTitle: eventList.value.find(e=>e.id===eventId)?.title || eventId,
          uid,
          name: prof.name,
          email: prof.email,
          value: r.value,
          comment: r.comment || '',
          updatedAt: r.updatedAt
        })
      }
    }
    feedbacks.value = rows.sort((a,b)=> new Date(b.updatedAt)-new Date(a.updatedAt))
  })
}
function reloadFeedbacks(){ loadFeedbacks() }

async function removeFeedback(item){
  if(!confirm(`Delete feedback by ${item.name}?`)) return
  await dbRemove(dbRef(rtdb, `ratings/${item.eventId}/${item.uid}`))
  alert('Deleted successfully!')
}

const fbColDefs = ref([
  { headerName:'Event', field:'eventTitle', minWidth:220 },
  { headerName:'User', field:'name', width:140 },
  { headerName:'Email', field:'email', minWidth:220 },
  { headerName:'Rating', field:'value', width:110, filter:'agNumberColumnFilter',
    valueFormatter:p=>`${p.value}★` },
  { headerName:'Comment', field:'comment', flex:1, minWidth:260 },
  { headerName:'Updated', field:'updatedAt', minWidth:180,
    comparator:(a,b)=> new Date(a) - new Date(b),
    valueFormatter:p=> p.value ? new Date(p.value).toLocaleString() : '' },
  { headerName:'Action', width:120, filter:false, sortable:false,
    cellRenderer:params=>{
      const btn=document.createElement('button')
      btn.className='btn btn-outline-danger btn-sm'
      btn.textContent='Delete'
      btn.addEventListener('click',()=>removeFeedback(params.data))
      return btn
    }
  }
])

onMounted(()=>{ loadAllEvents().then(loadFeedbacks) })

/* ---------- tiny placeholder component ---------- */
const EmptyState = {
  props:{ title:String, desc:String },
  template:`<div class="empty text-center p-5">
    <div class="icon mb-2"><i class="bi bi-box"></i></div>
    <h6 class="mb-1">{{ title }}</h6>
    <p class="text-muted mb-0">{{ desc }}</p>
  </div>`
}

/** 
 * RESOURCES (AG Grid)
 */
const LS_KEY = 'hhh_offline_resources'

const resources   = ref([])
const qRes        = ref('')
const resStatus   = ref('')
const resGridApi  = ref(null)

const resColDefs = ref([
  { headerName:'Title',  field:'title',   minWidth:240 },
  { headerName:'Status', field:'status',  width:120,
    valueFormatter:p => (p.value||'').toString().toUpperCase()
  },
  { headerName:'Size',   field:'size',    width:110,
    valueFormatter:p => p.value ? `${Math.round(p.value/1024)} KB` : ''
  },
  { headerName:'Updated',field:'updatedAt', minWidth:180,
    comparator:(a,b)=> new Date(a) - new Date(b),
    valueFormatter:p => p.value ? new Date(p.value).toLocaleString() : ''
  },
  { headerName:'Tags',   field:'tags',    minWidth:220,
    valueFormatter:p => Array.isArray(p.value) ? p.value.join(', ') : ''
  },
  { headerName:'Action', width:260, filter:false, sortable:false,
    cellRenderer:(params)=>{
      const wrap=document.createElement('div'); wrap.style.display='flex'; wrap.style.gap='8px'
      const v=document.createElement('button'); v.className='btn btn-success btn-sm'; v.textContent='Open'
      v.addEventListener('click',()=>router.push({ path:'/resources', query:{ id: params.data.id }}))
      const e=document.createElement('button'); e.className='btn btn-outline-secondary btn-sm'; e.textContent='Edit'
      e.addEventListener('click',()=>openResEdit(params.data))
      const d=document.createElement('button'); d.className='btn btn-outline-danger btn-sm'; d.textContent='Delete'
      d.addEventListener('click',()=>removeResource(params.data))
      wrap.append(v,e,d); return wrap
    }
  }
])

function onResGridReady(params){
  resGridApi.value = params.api
  params.api.setQuickFilter(qRes.value)
  applyResStatus(resStatus.value)
}
watch(resStatus,    applyResStatus)

function applyResStatus(val){
  if(!resGridApi.value) return
  if(!val) resGridApi.value.setFilterModel(null)
  else     resGridApi.value.setFilterModel({ status:{ filterType:'text', type:'equals', filter: val } })
}

/* real-time loading Firestore /resources */
onMounted(()=>{
  onSnapshot(collection(db,'resources'), snap=>{
    resources.value = snap.docs.map(d=>{
      const r=d.data()
      return {
        id: d.id,
        title: r.title || d.id,
        status: r.status || 'published',
        size: Number(r.size || 0),
        tags: r.tags || [],
        storagePath: r.storagePath || '',
        updatedAt: r.updatedAt?.toDate ? r.updatedAt.toDate().toISOString() : (r.updatedAt || '')
      }
    })
  })
})

/* ----- Modal & CRUD ----- */
const showResModal = ref(false)
const resEditing   = ref(false)
const resSaving    = ref(false)
const resFile      = ref(null)
const resForm      = ref({ title:'', status:'published', tags:'', preview:'' })

function onResFileChange(e){
  const f = e.target.files?.[0] || null
  resFile.value = f
  resForm.value.preview = ''
  if(!f) return
  const reader = new FileReader()
  reader.onload = ev => {
    const text = (ev.target?.result || '').toString()
    resForm.value.preview = text.split('\n').slice(0,30).join('\n')
  }
  reader.readAsText(f)
}

function openResCreate(){
  resEditing.value=false
  resFile.value=null
  resForm.value={ title:'', status:'published', tags:'', preview:'' }
  showResModal.value=true
}
function openResEdit(row){
  resEditing.value=true
  resFile.value=null
  resForm.value={
    id: row.id,
    title: row.title,
    status: row.status,
    tags: (row.tags||[]).join(', '),
    storagePath: row.storagePath,
    preview:''
  }
  showResModal.value=true
}
function closeResModal(){ showResModal.value=false }

/* Offline cache（LocalStorage） */
function cacheToLocal(docId, title, text){
  const map = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  map[docId] = { id:docId, title, updatedAt: Date.now(), content: text.split('\n') }
  localStorage.setItem(LS_KEY, JSON.stringify(map))
}

async function saveResource(){
  if(!resForm.value.title){ alert('Please enter title'); return }
  if(!resEditing.value && !resFile.value){ alert('Please choose a file'); return }

  resSaving.value = true
  try{
    let storagePath = resForm.value.storagePath || ''
    let size = 0

    // prepare upload if new file selected
    if(resFile.value){
      const ext = (resFile.value.name.split('.').pop() || 'txt').toLowerCase()
      const id  = resEditing.value ? resForm.value.id : crypto.randomUUID()
      storagePath = `resources/${id}.${ext}`

      // cratically cache to LocalStorage first
      const text = await new Promise((resolve, reject)=>{
        const reader = new FileReader()
        reader.onload  = e => resolve((e.target?.result || '').toString())
        reader.onerror = reject
        reader.readAsText(resFile.value)
      })
      cacheToLocal(id, resForm.value.title, text)

      // upload to Firebase Storage
      const storeRef = sref(storage, storagePath)
      const snap = await uploadBytes(storeRef, resFile.value, { contentType: resFile.value.type || 'text/plain' })
      size = snap.metadata.size
    }

    const payload = {
      title: resForm.value.title,
      status: resForm.value.status,
      tags: String(resForm.value.tags||'').split(',').map(s=>s.trim()).filter(Boolean),
      storagePath,
      size,
      updatedAt: serverTimestamp()
    }

    if(resEditing.value){
      await updateDoc(doc(db,'resources',resForm.value.id), payload)
    }else{
      await addDoc(collection(db,'resources'), { ...payload, createdAt: serverTimestamp() })
    }

    showResModal.value=false
  }catch(e){
    console.error(e)
    alert(e?.message || 'Failed to save resource')
  }finally{
    resSaving.value=false
  }
}

async function removeResource(row){
  if(!confirm(`Delete resource "${row.title}"?`)) return
  await deleteDoc(doc(db,'resources',row.id))
  // cleanup local cache
  const map = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  if(map[row.id]){ delete map[row.id]; localStorage.setItem(LS_KEY, JSON.stringify(map)) }
}

// ===== Reports: refs & charts
const evtBarRef = ref(null)
const ratingPieRef = ref(null)
let evtBarChart, ratingPieChart

// Totals
const totalCapacity = computed(()=> events.value.reduce((s,e)=> s + Number(e.capacity||0), 0))
const totalRegistrations = computed(()=> events.value.reduce((s,e)=> s + Number(e.registrations||e.bookedCount||0), 0))

// Ratings distribution
const ratingBuckets = ref({1:0,2:0,3:0,4:0,5:0})
const totalRatings = computed(()=> Object.values(ratingBuckets.value).reduce((a,b)=>a+b,0))

// Firestore: listen /events
watch(events, drawEventsChart, { deep:true })

// RTDB: listen /ratings
onMounted(() => {
  const ratingsRef = dbRef(rtdb, 'ratings')
  onValue(ratingsRef, (snap)=>{
    const raw = snap.val() || {}
    const buckets = {1:0,2:0,3:0,4:0,5:0}
    // structure: ratings/{eventId}/{uid} => { value, comment?, updatedAt }
    for (const evId in raw) {
      const perEvent = raw[evId] || {}
      for (const uid in perEvent) {
        const v = Number(perEvent[uid]?.value || 0)
        if (v >=1 && v <=5) buckets[v]++
      }
    }
    ratingBuckets.value = buckets
    drawRatingsChart()
  })
})

// when panel active, draw charts
watch(activePanel, (p)=> {
  if (p === 'reports') {
    drawEventsChart()
    drawRatingsChart()
  }
})
onMounted(()=> {
  if (activePanel.value === 'reports') {
    drawEventsChart()
    drawRatingsChart()
  }
})

// draw charts
function drawEventsChart(){
  if (!evtBarRef.value) return
  const labels = events.value.map(e => e.title || e.slug || e.id)
  const cap = events.value.map(e => Number(e.capacity || 0))
  const regs = events.value.map(e => Number(e.registrations ?? e.bookedCount ?? 0))

  // destroy old chart
  if (evtBarChart) evtBarChart.destroy()

  evtBarChart = new Chart(evtBarRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Capacity', data: cap },
        { label: 'Registrations', data: regs }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
      plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } }
    }
  })
}

function drawRatingsChart(){
  if (!ratingPieRef.value) return
  const labels = ['1★','2★','3★','4★','5★']
  const data = labels.map((_,i)=> ratingBuckets.value[i+1] || 0)

  if (ratingPieChart) ratingPieChart.destroy()

  ratingPieChart = new Chart(ratingPieRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } }
    }
  })
}

</script>

<style scoped>
.admin-page{
  background:#f6f8fb;
  min-height:calc(100dvh - 72px);
  font-family:"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.page-title{ font-weight:800; font-size: clamp(24px, 2.6vw, 36px); line-height:1.06; color:#202124; }

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

.modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal-dialog{ width:min(720px, 92vw); }
.modal-content{ border-radius:16px; }

/* AG Grid theme tweaks */
.ag-theme-quartz{
  --ag-border-color:#e7eaee;
  --ag-header-background-color:#f9fafb;
  --ag-odd-row-background-color:#fcfcfd;
  --ag-row-hover-color:#f1f5f9;
  border-radius:12px;
  border:1px solid #e7eaee;
  overflow:hidden;
}

.chart-box{
  position: relative;
  height: 260px;
  width: 100%;
}
.chart-box > canvas{
  width: 100% !important;
  height: 100% !important;
}
</style>