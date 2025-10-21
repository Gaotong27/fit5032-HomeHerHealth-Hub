<template>
  <footer class="hhh-footer hhh-bleed text-white py-5 mt-5">
    <div class="container-fluid px-3 px-md-5">
      <div class="row g-4">
        <!-- Left column -->
        <div class="col-12 col-md-6 col-lg-4">
          <h6 class="fw-semibold">About HomeHerHealth Hub</h6>
          <p class="small opacity-90 mb-0">
            We are committed to empowering women through knowledge, resources, and community support.
            From preventative care to specialized guidance, we aim to help women live healthy, confident lives.
          </p>
        </div>

        <!-- Middle column -->
        <div class="col-6 col-lg-4">
          <h6 class="fw-semibold">Useful Links</h6>
          <ul class="list-unstyled small">
            <li>
              <router-link to="/" class="link-light text-decoration-none">HOME</router-link>
            </li>
            <li>
              <router-link to="/resources" class="link-light text-decoration-none">RESOURCES</router-link>
            </li>
            <li>
              <router-link to="/events" class="link-light text-decoration-none">EVENTS</router-link>
            </li>
            <li>
              <router-link to="/clinics" class="link-light text-decoration-none">CLINICS MAP</router-link>
            </li>
          </ul>
        </div>

        <!-- Right column -->
        <div class="col-6 col-lg-4">
          <h6 class="fw-semibold">GET IN TOUCH</h6>
          <p class="small mb-1">Head Office<br />Monash Campus (Clayton), Melbourne, Australia</p>
          <p class="small mb-1">Email<br />tgao0019@student.monash.edu</p>
          <p class="small mb-0">Phone<br />+61 1234 567 89</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 不需要逻辑，但必须保留 <script setup> 才能用 router-link
</script>

<style scoped>
.hhh-footer {
  background: #212529;
  font-family: 'Poppins', Arial, sans-serif;
}

.hhh-footer h6 {
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #ffffff;
  margin-bottom: 1rem;
}

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

.container-fluid {
  max-width: 1600px;
}
</style>