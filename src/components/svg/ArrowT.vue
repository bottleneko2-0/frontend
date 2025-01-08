<script setup>
import Base from '@/components/svg/Base.vue'
</script>

<template>
  <Base v-bind="$attrs">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12 4 4m-4-4L8 8"
    ></path>
  </Base>
</template>
