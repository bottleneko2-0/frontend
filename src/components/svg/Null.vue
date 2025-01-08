<script setup>
import Base from '@/components/svg/Base.vue'
</script>

<template>
  <Base v-bind="$attrs">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 18L18 6M6 6l12 12"
    ></path>
  </Base>
</template>
