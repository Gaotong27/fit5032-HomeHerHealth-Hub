<template>
  <section class="container my-5">
    <h1 class="text-3xl font-bold mb-4">General Women's Health</h1>

    <!-- Search box -->
    <div class="search-bar mb-6">
      <input v-model.trim="q" class="form-control" placeholder="Search events..." />
    </div>

    <EventCard
      v-for="e in paged"
      :key="e.id"
      :event="e"
      class="mb-4"

    />

    <!-- Paging -->
    <div class="d-flex align-items-center gap-2 mt-4">
      <button class="btn btn-light" :disabled="page===1" @click="page--">Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button class="btn btn-light" :disabled="page===totalPages" @click="page++">Next</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllEvents } from '@/services/events'
import EventCard from '@/components/EventCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const raw = ref([])
const q = ref('')
const page = ref(1)
const pageSize = 3

onMounted(async () => {
  raw.value = await getAllEvents()           
})

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return raw.value.filter(e =>
    [e.title, e.summary, e.location].some(t => String(t).toLowerCase().includes(term))
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})
</script>
