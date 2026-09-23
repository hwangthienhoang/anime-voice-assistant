<script setup>
import { computed } from 'vue';
import { ICON_PATHS, FILLED_ICONS } from '@/shared/constants/icons.js';
const props = defineProps({ name: { type: String, default: 'star' }, label: { type: String, default: '' } });
const icon = computed(() => Object.hasOwn(ICON_PATHS, props.name) ? props.name : 'star');
const filled = computed(() => FILLED_ICONS.includes(icon.value));
</script>

<template>
  <svg class="wl-icon" viewBox="0 0 24 24" :role="label ? 'img' : undefined"
    :aria-label="label || undefined" :aria-hidden="label ? undefined : true" focusable="false"
    :fill="filled ? 'currentColor' : 'none'" :stroke="filled ? 'none' : 'currentColor'"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path :d="ICON_PATHS[icon]" />
  </svg>
</template>
