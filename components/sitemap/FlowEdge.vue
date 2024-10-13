<script setup lang="ts">
import { BaseEdge, getBezierPath } from '@vue-flow/core'
import { computed } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
})

// WARN: Edge source or target is missing
const path = computed(() => getBezierPath(props))
</script>

<template>
  <BaseEdge
    :id="id"
    :path="path[0]"
  />
</template>
