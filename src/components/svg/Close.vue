<script setup>
import Base from '@/components/svg/Base.vue'
</script>

<template>
  <Base v-bind="$attrs">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </Base>
</template>
