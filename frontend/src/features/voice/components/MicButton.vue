<script setup>
import { computed } from 'vue';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
import { VOICE_STATE_LABELS } from '@/shared/constants/voiceStates.js';
defineOptions({ inheritAttrs: false });
const props = defineProps({ state: { type: String, default: 'idle' }, label: { type: String, default: '' }, showLabel: { type: Boolean, default: true }, disabled: Boolean });
const emit = defineEmits(['toggle']);
const safeState = computed(() => Object.hasOwn(VOICE_STATE_LABELS, props.state) ? props.state : 'idle');
const stateLabel = computed(() => props.label || VOICE_STATE_LABELS[safeState.value]);
</script>

<template>
  <span class="wl-mic-wrap">
    <button v-bind="$attrs" type="button" class="wl-mic" :class="`wl-mic-${safeState}`" :disabled="disabled"
      :aria-label="stateLabel" :aria-pressed="safeState === 'listening'" @click="emit('toggle')">
      <WishlightIcon :name="safeState === 'speaking' ? 'wave' : 'mic'" />
    </button>
    <span v-if="showLabel" aria-live="polite">{{ stateLabel }}</span>
  </span>
</template>
