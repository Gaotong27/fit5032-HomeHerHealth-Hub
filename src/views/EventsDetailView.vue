<template>
  <section class="event-detail-page">
    <div class="container py-5">
      <router-link class="link-back" :to="{ name: 'events' }">← Back to Events</router-link>

      <div class="detail-card shadow-lg" v-if="event">
        <h1 class="title">{{ event.title }}</h1>

        <div class="row g-4">
          <!-- 左侧封面列 -->
          <div class="col-lg-7">
            <img
              :src="event.imageUrl || getImageUrl(event.image)"
              :alt="event.title"
              class="hero-img rounded-3 shadow-sm"
            />

            <!-- 管理员导出报名名单 -->
            <div v-if="user && user.role === 'admin'" class="admin-export">
              <button class="btn btn-outline-dark btn-sm" @click="exportRegistrations" title="Export attendees (CSV)">
                <i class="bi bi-download me-1"></i> Export attendees (CSV)
              </button>
            </div>
          </div>

          <!-- 右侧信息列 -->
          <div class="col-lg-5">
            <div class="panel card shadow-sm">
                <div class="card-body">

                <!-- 状态 -->
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

                <!-- 基本信息 -->
                <ul class="list-unstyled mb-3 key-info">
                  <li class="mb-2"><span class="key">Date: </span><span class="val">{{ event.date }}</span></li>
                  <li class="mb-2"><span class="key">Location: </span><span class="val">{{ event.location }}</span></li>
                </ul>

                <div class="divider"></div>

                <!-- 介绍 -->
                <h6 class="section-title">About this event</h6>
                <p class="about mb-3" v-html="safeAboutHtml"></p>
                <!-- 通用活动说明 -->
                <div class="generic-tip mt-2">
                  <i class="bi bi-info-circle me-1"></i>
                  This program opens <strong>periodically</strong>. Seats may be released in batches.
                  If it’s full, please check back later or watch for the next window.
    
                </div>

                <!-- ✅ 注册按钮移到 About 后 -->
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

            <!-- ✅ 管理员的评分摘要放在右侧面板下方 -->
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

        <!-- ✅ 普通用户/访客的评论区块（放在页面底部） -->
        <div v-if="!user || user.role !== 'admin'" class="col-12 mt-5">
          <div class="ratings-section card p-4 shadow-sm">
            <h6 class="section-title mb-3">Ratings & Comments</h6>

            <!-- 所有人都能看到的评论 -->
            <div v-if="raterRows.length">
              <div v-for="row in raterRows" :key="row.email" class="mb-3 border-bottom pb-2">
                <div class="fw-bold">{{ row.name }}</div>
                <div class="text-warning small">
                  <i v-for="n in row.value" :key="n" class="bi bi-star-fill"></i>
                </div>
                <div class="text-muted small">{{ new Date(row.updatedAt).toLocaleString() }}</div>
                <p class="mb-0">{{ row.comment }}</p>
              </div>
            </div>
            <div v-else class="text-muted small text-center">No ratings yet</div>

            <!-- 登录用户输入区 -->
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
import { ref, computed, onMounted } from 'vue'
import { sanitizeHtml } from '@/utils/sanitize'
import { useRoute } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/services/firebase'
import { auth } from '@/services/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getDatabase, ref as dbRef, set, onValue } from 'firebase/database'
import StarRating from '@/components/StarRating.vue'
import { get as rtdbGet } from 'firebase/database'

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

function getImageUrl(fileName){ return new URL(`../assets/events/${fileName}`, import.meta.url).href }
function getUserKey(u){ return u?.email ? String(u.email).trim().toLowerCase() : null }

/* --- 当前用户同步 --- */
function syncUser(){
  const u = auth.user
  user.value = u ? { email:u.email, name:u.name||u.email.split('@')[0], role:u.role||'user' } : null
}

/* --- 加载活动详情 --- */
async function load(){
  const ref = doc(db, 'events', route.params.slug)
  const snap = await getDoc(ref)
  if (!snap.exists()){ event.value = null; return }
  const data = snap.data()
  event.value = { id: route.params.slug, ...data, registrations: data.bookedCount||0 }
  listenToRatings(event.value.id)
}

/* --- 实时监听评分 --- */
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

/* --- 保存评分 --- */
async function saveRating(){
  if(!event.value||!user.value||user.value.role==='admin')return
  const key=getUserKey(user.value); if(!key||!myRating.value)return
  saving.value=true
  const ref=dbRef(rtdb,`ratings/${event.value.id}/${key}`)
  await set(ref,{
    value:myRating.value,
    comment:userComment.value||'',
    updatedAt:new Date().toISOString(),
    name:user.value.name,
    email:user.value.email
  })
  saving.value=false; flash.value=true
  setTimeout(()=>flash.value=false,1200)
}

/* --- 状态与描述计算 --- */
const status=computed(()=>{
  if(!event.value)return'loading'
  const today=new Date(),date=new Date(event.value.date)
  if(date<today)return'ended'
  if(event.value.registrations>=event.value.capacity)return'full'
  return'open'
})
const statusText=computed(()=>status.value==='open'?'Open':status.value==='full'?'Full':'Ended')
const remaining=computed(()=>Math.max(0,(event.value?.capacity||0)-(event.value?.registrations||0)))
const safeAboutHtml=computed(()=>sanitizeHtml(event.value?.description||'This workshop provides practical wellness tips.'))
const starIcons=computed(()=>{
  const a=Math.max(0,Math.min(5,Number(summary.value.avg||0)));const res=[]
  for(let i=1;i<=5;i++){if(a>=i-0.25)res.push('bi-star-fill');else if(a>=i-0.75)res.push('bi-star-half');else res.push('bi-star')}
  return res
})

// 导出报名名单为 CSV（姓名、邮箱、性别、年龄）——管理员使用
async function exportRegistrations() {
  if (!event.value) return;
  const eventId = event.value.id;
  const eventTitle = String(event.value.title || eventId);

  try {
    // 1) 读 RTDB: registrations/{eventId}
    const regSnap = await rtdbGet(dbRef(rtdb, `registrations/${eventId}`));
    const regs = regSnap.exists() ? regSnap.val() : {};

    const rows = [];

    // 2) 汇总报名信息（报名节点优先，补齐 RTDB/Firestore 的 users）
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

    // 3) 生成 CSV（表头 5 列，第一列是活动标题）
    const header = ['Name', 'Email', 'Gender', 'Age'];
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const lines = [
      header.join(','),
      ...rows.map(r => [
        eventTitle,          // ✅ CSV 里用原始标题，不要 encode
        r.name,
        r.email,
        r.gender,
        r.age
      ].map(esc).join(','))
    ];

    // 文件名可以用安全版（但别用到 CSV 单元格里）
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

onMounted(()=>{
  onAuthStateChanged(firebaseAuth,()=>syncUser())
  syncUser()
  load()
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
.learn-list{margin-left:10px;color:#333;}
.btn.w-100{border-radius:16px;font-weight:700;}
.ratings-section{background:#fff;border-radius:20px;}
.ratings-section .bi-star-fill{color:#f5b301;}
.display-avg{font-size:38px;font-weight:800;color:#222;}
.ratings-summary {
  border-radius: 20px;
  background: #fff;
}

.display-avg {
  font-size: 38px;
  font-weight: 800;
  color: #222;
}

.ratings-summary .bi-star-fill {
  color: #f5b301;
}

.generic-tip {
  background: #f8fafc;
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  padding: 12px 14px;
  color: #445066;
  font-size: 0.95rem;
  line-height: 1.5;
}

.admin-export {
  margin-top: 12px;
}
</style>