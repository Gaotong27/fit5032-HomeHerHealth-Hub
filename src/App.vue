<!-- src/App.vue -->
<script setup>
import { RouterLink, RouterView } from 'vue-router'


const logoUrl = new URL('./assets/logo.svg', import.meta.url).href
</script>

<template>
  <div class="hhh-page">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container-fluid px-5">
        <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2 fw-bold">
          <img :src="logoUrl" alt="logo" height="32" />
          <span class="brand-text">HomeHerHealth Hub</span>
        </RouterLink>

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
            <li class="nav-item">
              <RouterLink to="/" class="nav-link hhh-nav-link" exact>Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/resources" class="nav-link hhh-nav-link">Resources</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/events" class="nav-link hhh-nav-link">Events</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/clinics" class="nav-link hhh-nav-link">Clinics Map</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/account" class="nav-link hhh-nav-link">Account</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/contact" class="nav-link hhh-nav-link">Contact us</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>


    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.brand-text { letter-spacing: 0.2px; }


.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  color: var(--bs-primary);
  font-weight: 600;
}
</style>
