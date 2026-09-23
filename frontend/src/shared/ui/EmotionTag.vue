<script setup>
import { computed } from 'vue';
import { EMOTION_LABELS } from '@/shared/constants/emotions.js';
const props = defineProps({ emotion: { type: String, default: 'neutral' }, onNight: Boolean });
const safeEmotion = computed(() => Object.hasOwn(EMOTION_LABELS, props.emotion) ? props.emotion : 'neutral');
</script>

<template>
  <span class="wl-emo" :class="{ 'wl-emo-onnight': onNight }">
    <span class="wl-emo-dot" :style="{ background: `var(--emo-${safeEmotion})` }" aria-hidden="true" />
    <slot>{{ EMOTION_LABELS[safeEmotion] }}</slot>
  </span>
</template>
