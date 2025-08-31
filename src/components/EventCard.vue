<template>
  <div class="card event-card">
    <div class="row g-0">
      <div class="col-md-3">
        <img
          :src="getImageUrl(event.image)"
          :alt="event.title"
          class="img-fluid rounded-start"
          @error="onImgErr"
        />
      </div>
      <div class="col-md-9 p-3">
        <h3 class="h5 mb-2">{{ event.title }}</h3>
        <p class="mb-2 text-muted">{{ event.summary }}</p>
        <div class="small mb-3">
          <strong>Date:</strong> {{ event.date }} &nbsp;|&nbsp;
          <strong>Location:</strong> {{ event.location }}
        </div>
        <router-link
          class="btn btn-success"
          :to="{ name: 'event-detail', params: { slug: event.slug }}"
        >Read More</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ event: { type: Object, required: true }})

//  ../assets/events
function getImageUrl(fileName) {
  return new URL(`../assets/events/${fileName}`, import.meta.url).href
}

function onImgErr(e) {
  e.target.src = new URL(`../assets/events/placeholder.png`, import.meta.url).href
}
</script>

<style scoped>
.event-card { cursor: default; }
</style>
