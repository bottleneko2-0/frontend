<script setup>
import Base from '@/components/svg/Base.vue'
</script>

<template>
  <Base v-bind="$attrs">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </Base>
</template>
