<script setup>
import { computed } from 'vue';
import WishlightIcon from './WishlightIcon.vue';
const props = defineProps({ title: { type: String, required: true }, description: { type: String, default: '' }, tone: { type: String, default: 'info' } });
const safeTone = computed(() => ['info', 'success', 'error', 'loading'].includes(props.tone) ? props.tone : 'info');
const icon = computed(() => ({ info: 'info', success: 'check', error: 'warning', loading: 'loader' })[safeTone.value]);
</script>

<template>
  <div class="wl-notice" :class="`wl-notice-${safeTone}`" :role="safeTone === 'error' ? 'alert' : 'status'">
    <WishlightIcon :name="icon" :class="{ 'wl-spin': safeTone === 'loading' }" />
    <div class="wl-notice-body"><strong>{{ title }}</strong><p v-if="description">{{ description }}</p><slot /></div>
    <div v-if="$slots.action" class="wl-notice-action"><slot name="action" /></div>
  </div>
</template>
