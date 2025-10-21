<template>
  <div class="hhh-page">
    
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
      <div class="container-fluid px-3 px-md-5">
        <div class="row g-3 g-md-4">
          <div class="col-12 col-sm-6 col-lg-4" v-for="c in categories" :key="c.title">
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

    <!-- Health Highlights -->
    <section class="py-5">
      <div class="container-fluid px-3 px-md-5">
        <div class="text-center mb-4">
          <h2 class="fw-bold hhh-section-title">Health Highlights</h2>
          <p class="text-muted small">
            Join workshops, health talks, and community activities designed for women's wellbeing.
          </p>
        </div>

        <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3 g-md-4">
          <div class="col" v-for="e in events" :key="e.id">
            <div class="card h-100 shadow-sm border-0 hhh-event">
              <img class="card-img-top event-img" :src="e.image" :alt="e.title" />
              <div class="card-body d-flex flex-column">
                <h6 class="fw-semibold">{{ e.title }}</h6>
                <p class="small text-muted">{{ e.desc }}</p>
                <a class="btn btn-success mt-auto align-self-start"
                  :href="e.link"
                  target="_blank"
                  rel="noopener">
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// import picture
import heroPng from '../assets/hero/home.png'
import ev1Png from '../assets/events/HomeEvent1.png'
import ev2Png from '../assets/events/HomeEvent2.png'
import ev3Png from '../assets/events/HomeEvent3.png'
import ev4Png from '../assets/events/HomeEvent4.png'
import ev5Png from '../assets/events/HomeEvent5.png'


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
    image: ev1Png,
    link:'https://womenshealth.com.au/the-unstoppable-rise-of-laura-henshaw-and-steph-claire-smith/'
  },
  {
    id: 2,
    title: 'Guidelines for Physical Activity During Pregnancy',
    desc: 'Expert advice for safe exercises.',
    image: ev2Png,
    link:'https://www.health.gov.au/sites/default/files/2023-11/physical-activity-and-exercise-during-pregnancy-guidelines-brochure.pdf'
  },
  {
    id: 3,
    title: 'Women Living Well: Healthy, Empowered, Equal',
    desc: 'Annual report on women’s health initiatives.',
    image: ev3Png,
    link:'https://www.whv.org.au/training-and-resources/publications-and-submissons/womens-health-victoria-annual-report-2022-2023/'
  },
  {
    id: 4,
    title: 'Menopause, Mood & More: Real Talk in Australia',
    desc: 'Exploring the new era of women’s health and open conversations.',
    image: ev4Png,
    link:'https://www.fugenhealth.com.au/menopause-mood-more-the-new-era-of-womens-health-and-real-talk-in-australia/'
  },
  {
    id: 5,
    title: 'Women‘s Health Community Team',
    desc: 'Meet the dedicated team supporting women across Australia.',
    image: ev5Png,
    link:'https://www.health.vic.gov.au/womens-health-wellbeing-program/womens-health-wellbeing-support-groups-programs'
  }
])
</script>

<style scoped>
.hhh-page { font-family: 'Poppins', system-ui, -apple-system, Arial, sans-serif; }

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
.hhh-event img,
.event-img {
  width: 100%;
  height: auto;            
  max-height: 200px;      
  object-fit: contain;     
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
</style>
