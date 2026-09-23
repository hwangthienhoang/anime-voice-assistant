<script setup>
import { computed, useSlots } from 'vue';
import WishlightIcon from './WishlightIcon.vue';
const props = defineProps({
  variant: { type: String, default: 'primary' },
  icon: { type: String, default: null },
  disabled: Boolean,
  loading: Boolean,
  type: { type: String, default: 'button' },
});
const emit = defineEmits(['click']);
const slots = useSlots();
const variantClass = computed(() => ['primary', 'secondary', 'ghost', 'danger'].includes(props.variant) ? props.variant : 'primary');
const hasIcon = computed(() => props.loading || props.icon || slots.icon);
</script>

<template>
  <button :type="type" class="wl-btn" :class="[`wl-btn-${variantClass}`, { 'wl-btn-noicon': !hasIcon }]"
    :disabled="disabled || loading" :aria-busy="loading || undefined" @click="emit('click', $event)">
    <span v-if="hasIcon" class="wl-btn-ico">
      <WishlightIcon v-if="loading" name="loader" class="wl-spin" />
      <slot v-else name="icon"><WishlightIcon :name="icon" /></slot>
    </span>
    <slot />
  </button>
</template>
