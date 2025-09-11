<template>
  <div class="stars" @mouseleave="hover = 0" role="radiogroup" aria-label="Rate">
    <button
      v-for="n in 5" :key="n" type="button" class="star"
      :class="{ filled: n <= (hover || modelValue) }"
      @mouseenter="hover = n"
      @click="$emit('update:modelValue', n)"
      :aria-checked="modelValue === n" role="radio" :aria-label="`${n} stars`"
    >★</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ modelValue: { type: Number, default: 0 } })
defineEmits(['update:modelValue'])
const hover = ref(0)
</script>

<style scoped>
.stars { display: inline-flex; gap: 6px; }
.star {
  font-size: 28px; line-height: 1; border: 0; background: none; cursor: pointer;
  color: #d0d5dc; transition: transform .1s ease;
}
.star.filled { color: #f5a623; }
.star:hover { transform: scale(1.1); }
</style>
