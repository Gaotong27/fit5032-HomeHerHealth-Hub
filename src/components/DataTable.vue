<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <!-- global search -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">{{ title }}</h5>
        <input v-model="quickFilter" class="form-control w-auto" placeholder="Search all…" />
      </div>

      <!-- Each list header comes with its own filters (such as text, values, dates, etc.) -->
      <ag-grid-vue
        class="ag-theme-quartz"
        style="width: 100%; height: 560px"
        :rowData="rows"
        :columnDefs="computedCols"
        :defaultColDef="defaultColDef"
        :quickFilterText="quickFilter"
        :pagination="true"
        :paginationPageSize="10"
        :animateRows="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

const props = defineProps({
  title: { type: String, default: 'Table' },
  // [{ field:'title', headerName:'Title', filter:'agTextColumnFilter', ... }]
  columns: { type: Array, required: true },
  rows: { type: Array, required: true }
})

const quickFilter = ref('')

// default column properties
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  floatingFilter: true
}

// for each column, if no filter specified, use text filter by default
const computedCols = computed(() =>
  props.columns.map(c => ({
    filter: 'agTextColumnFilter',
    ...c
  }))
)
</script>