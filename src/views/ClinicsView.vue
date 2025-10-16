<template>
  <DataTable
    title="Clinics"
    :columns="cols"
    :rows="clinics"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'

const clinics = ref([])

const cols = [
  { field:'name', headerName:'Clinic', minWidth:220 },
  { field:'suburb', headerName:'Suburb' },
  { field:'services', headerName:'Services' },   // e.g., "Physio; OB; Mental Health"
  { field:'phone', headerName:'Phone' },
  { field:'rating', headerName:'Rating', filter:'agNumberColumnFilter' },
]

onMounted(() => {
  clinics.value = [
    { name:'Women Care Centre', suburb:'Clayton', services:'OB; Physio', phone:'03 9000 0000', rating:4.5 },
    { name:'Health First Clinic', suburb:'Springvale', services:'Mental Health; OB', phone:'03 9000 1111', rating:4.0 },
    { name:'Family Health Hub', suburb:'Glen Waverley', services:'Physio; Mental Health', phone:'03 9000 2222', rating:4.8 },
    { name:'Wellness Point', suburb:'Dandenong', services:'OB; Physio; Mental Health', phone:'03 9000 3333', rating:4.2 },
    { name:'Care & Cure Clinic', suburb:'Mulgrave', services:'OB; Physio', phone:'03 9000 4444', rating:4.6 },
    { name:'Healthy Living Centre', suburb:'Noble Park', services:'Mental Health; OB', phone:'03 9000 5555', rating:4.1 },
    { name:'Active Life Clinic', suburb:'Rowville', services:'Physio; Mental Health', phone:'03 9000 6666', rating:4.7 },
    { name:'Harmony Health Hub', suburb:'Cranbourne', services:'OB; Physio; Mental Health', phone:'03 9000 7777', rating:4.3 },
    { name:'Bright Future Clinic', suburb:'Frankston', services:'OB; Physio', phone:'03 9000 8888', rating:4.4 },
    { name:'Total Care Centre', suburb:'Pakenham', services:'Mental Health; OB', phone:'03 9000 9999', rating:4.9 },
  ]
})
</script>