<script setup>
import Base from '@/components/svg/Base.vue'
</script>

<template>
  <Base v-bind="$attrs">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
    />
  </Base>
</template>
