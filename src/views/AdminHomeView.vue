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
                <h6 class="mb-0">Events (interactive table)</h6>
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
                <h6 class="mb-0">Users (interactive table)</h6>
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

      <!-- ===== Other panels (placeholders kept) ===== -->
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
          <EmptyState title="Resource library" desc="Add articles, guides, and links for users." />
        </div>
      </div>

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
          <EmptyState title="Clinics directory" desc="Manage clinic list, addresses, and contacts." />
        </div>
      </div>

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
          <EmptyState title="Site content" desc="Configure homepage sections, banners, and pages." />
        </div>
      </div>

      <div class="panel card shadow-sm" :class="{ open: activePanel==='reports' }">
        <button class="panel-head" @click="toggle('reports')">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-graph-up"></i>
            <span class="h6 mb-0">Reports</span>
            <span class="badge rounded-pill bg-light text-dark ms-2">—</span>
          </div>
          <i class="bi" :class="activePanel==='reports' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div class="panel-body">
          <EmptyState title="Analytics & reports" desc="Download CSVs or view trends once available." />
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

import {
  getFirestore, collection, onSnapshot, doc, getDoc,
  setDoc, updateDoc, deleteDoc, serverTimestamp, getDocs
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
const activePanel = ref('events')

function toggle(id){
  activePanel.value = activePanel.value === id ? '' : id
  router.replace({ name: route.name, query: activePanel.value ? { panel: activePanel.value } : {} })
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
  eventGridApi.value = params.api
  params.api.setQuickFilter(qTable.value)
  applyStatusFilter(statusSelect.value)
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

  const p = String(route.query.panel || '').toLowerCase()
  if (['events','users','feedback','resources','clinics','content','reports','settings'].includes(p)) {
    activePanel.value = p
  }

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
</style>