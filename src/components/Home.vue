<template>
  <div class="hhh-page">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container-fluid px-5">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#">
          <img :src="logoUrl" alt="logo" height="32" />
          <span class="brand-text">HomeHerHealth Hub</span>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div id="nav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li class="nav-item"><a class="nav-link hhh-nav-link active" href="#">Home</a></li>
            <li class="nav-item"><a class="nav-link hhh-nav-link" href="#">Resources</a></li>
            <li class="nav-item"><a class="nav-link hhh-nav-link" href="#">Events</a></li>
            <li class="nav-item"><a class="nav-link hhh-nav-link" href="#">Clinics Map</a></li>
            <li class="nav-item"><a class="nav-link hhh-nav-link" href="#">Account</a></li>
            <li class="nav-item"><a class="nav-link hhh-nav-link" href="#">Contact us</a></li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Hero Banner -->
    <section
      class="hhh-hero hhh-bleed d-flex align-items-center text-center text-white"
      :style="{ backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.35), rgba(0,0,0,.35)), url(${heroUrl})` }"
    >
      <div class="container-fluid px-5">
        <h1 class="hhh-hero-title fw-bold">Women’s Health</h1>
        <p class="hhh-hero-sub mb-2">Your Health at Every Age</p>
        <p class="hhh-hero-desc">
          A dedicated platform providing trusted health information, resources, and support for women of all ages.
        </p>
        <button class="btn btn-primary btn-lg mt-2">Learn More</button>
      </div>
    </section>

    <!-- Three major classifications -->
    <section class="py-5 bg-light">
      <div class="container-fluid px-5">
        <div class="row g-4">
          <div class="col-12 col-md-4" v-for="c in categories" :key="c.title">
            <div class="card h-100 shadow-sm border-0 hhh-feature text-center">
              <div class="card-body">
                <div class="hhh-badge mx-auto mb-3" :style="{ background: c.badge }">
                  <i class="bi bi-star-fill"></i>
                </div>
                <h5 class="fw-semibold mb-2">{{ c.title }}</h5>
                <p class="text-muted small mb-0">{{ c.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="py-5">
      <div class="container-fluid px-5">
        <div class="text-center mb-4">
          <h2 class="fw-bold hhh-section-title">Upcoming Events</h2>
          <p class="text-muted small">
            Join workshops, health talks, and community activities designed for women's wellbeing.
          </p>
        </div>

        <div class="row g-4">
          <div class="col-12 col-md-4" v-for="e in events" :key="e.id">
            <div class="card h-100 shadow-sm border-0 hhh-event">
              <img class="card-img-top" :src="e.image" :alt="e.title" />
              <div class="card-body d-flex flex-column">
                <h6 class="fw-semibold">{{ e.title }}</h6>
                <p class="small text-muted">{{ e.desc }}</p>
                <button class="btn btn-success mt-auto align-self-start">Read More</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="hhh-footer hhh-bleed text-white py-5 mt-5">
      <div class="container-fluid px-5">
        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-4">
            <h6 class="fw-semibold">About HomeHerHealth Hub</h6>
            <p class="small opacity-90 mb-0">
              We are committed to empowering women through knowledge, resources, and community support.
              From preventative care to specialized guidance, we aim to help women live healthy, confident lives.
            </p>
          </div>
          <div class="col-6 col-lg-4">
            <h6 class="fw-semibold">Useful Links</h6>
            <ul class="list-unstyled small">
              <li><a href="#" class="link-light text-decoration-none">HOME</a></li>
              <li><a href="#" class="link-light text-decoration-none">ABOUT</a></li>
              <li><a href="#" class="link-light text-decoration-none">RESOURCES</a></li>
              <li><a href="#" class="link-light text-decoration-none">EVENTS</a></li>
              <li><a href="#" class="link-light text-decoration-none">CONTACT US</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-4">
            <h6 class="fw-semibold">GET IN TOUCH</h6>
            <p class="small mb-1">Head Office<br/>Monash Campus (Clayton), Melbourne, Australia</p>
            <p class="small mb-1">Email<br/>tgao0019@student.monash.edu</p>
            <p class="small mb-0">Phone<br/>+61 1234 567 89</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// import picture
import logoPng from '../assets/logo/logo.png'
import heroPng from '../assets/hero/home.png'
import ev1Png from '../assets/events/HomeEvent1.png'
import ev2Png from '../assets/events/HomeEvent2.png'
import ev3Png from '../assets/events/HomeEvent3.png'

const logoUrl = logoPng
const heroUrl = heroPng

const categories = ref([
  {
    title: "General Women's Health",
    desc: 'Find reliable health tips, lifestyle advice, and wellness resources for women at every stage of life.',
    badge: '#dfe9ff'
  },
  {
    title: 'Pregnancy & Postpartum',
    desc: 'Guidance for a healthy pregnancy, safe delivery, and smooth postpartum recovery.',
    badge: '#ffe9c7'
  },
  {
    title: 'Menopause & Beyond',
    desc: 'Support and advice to manage symptoms, stay active, and maintain overall wellbeing.',
    badge: '#e6f7df'
  }
])

const events = ref([
  {
    id: 1,
    title: 'Women’s Health: The Unstoppable Rise',
    desc: 'Inspiring stories and empowerment talks.',
    image: ev1Png
  },
  {
    id: 2,
    title: 'Guidelines for Physical Activity During Pregnancy',
    desc: 'Expert advice for safe exercises.',
    image: ev2Png
  },
  {
    id: 3,
    title: 'Women Living Well: Healthy, Empowered, Equal',
    desc: 'Annual report on women’s health initiatives.',
    image: ev3Png
  }
])
</script>

<style scoped>

.hhh-page { font-family: 'Poppins', system-ui, -apple-system, Arial, sans-serif; }

/* ------------ Navbar -------------- */
.brand-text { font-weight: 700; }

.hhh-nav-link {
  position: relative;
  font-weight: 500;
  color: #2b2b2b;
}
.hhh-nav-link:hover { color: #377dff; }
.hhh-nav-link:focus,
.hhh-nav-link:active {
  outline: none !important;
  box-shadow: none !important;
  text-decoration: none !important;
  border: none !important;
  color: #377dff !important;
}
.hhh-nav-link.active {
  color: #377dff !important;
  font-weight: 600;
}
.hhh-nav-link.active::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: -6px;
  height: 3px; background: #377dff; border-radius: 2px;
}

/* ------------ Full-bleed -------------- */
.hhh-bleed {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

/* ------------ Hero -------------- */
.hhh-hero {
  min-height: 420px;
  padding: 36px 0;
  background-size: cover;
  background-position: center;
}
.hhh-hero-title { font-size: clamp(32px, 4.4vw, 64px); }
.hhh-hero-sub { font-size: clamp(14px, 1.8vw, 18px); opacity:.95; }
.hhh-hero-desc { font-size: 13.5px; max-width: 820px; margin: 0 auto; opacity:.9; }

/* ------------ Three major classifications -------------- */
.hhh-feature { border-radius: 16px; }
.hhh-feature .card-body { padding: 32px 24px; }
.hhh-badge {
  width: 64px; height: 64px; border-radius: 50%;
  display: grid; place-items: center; color: #1b1b1b;
}
.hhh-badge .bi { font-size: 22px; }

/* ------------ Events -------------- */
.hhh-event { border-radius: 16px; overflow: hidden; }
.hhh-event img {
  width: 100%;
  height: 500px;          
  object-fit: cover;      
  display: block;
}
.hhh-event .card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 16px 18px;
}
.hhh-event .btn {
  margin-top: auto;       
  align-self: flex-start; 
}

/* Section */
.hhh-section-title { letter-spacing:.3px; }

/* ------------ Footer -------------- */
/* Footer */
.hhh-footer {
  background: #212529;
  font-family: 'Poppins', Arial, sans-serif;
}

/* subtitle（About / Useful Links / Get in Touch） */
.hhh-footer h6 {
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;   
  letter-spacing: 0.5px;
  color: #ffffff;              
  margin-bottom: 1rem;
}

/* body（Describe / contact information） */
.hhh-footer p,
.hhh-footer a,
.hhh-footer li,
.hhh-footer .small {
  font-weight: 400;
  font-size: 0.875rem;         
  color: #cccccc;             
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.hhh-footer a {
  text-decoration: none;
}

.hhh-footer a:hover {
  color: #ffffff;              
}


/*  container-fluid */
.container-fluid { max-width: 1600px; }
</style>
