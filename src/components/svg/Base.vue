<script setup>
const props = defineProps({
  width: {
    type: [Number, String],
    default: 24,
  },
  height: {
    type: [Number, String],
    default: 24,
  },
  viewBox: {
    type: String,
    default: '0 0 24 24',
  },
  fill: {
    type: String,
    default: 'none',
  },
  stroke: {
    type: String,
    default: 'currentColor',
  },
  className: {
    type: String,
    default: '',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="props.width"
    :height="props.height"
    :viewBox="props.viewBox"
    :fill="props.fill"
    :stroke="props.stroke"
    :class="props.className"
    :style="props.style"
  >
    <slot></slot>
  </svg>
</template>
