<script setup>
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
defineProps({ title: { type: String, required: true }, snippet: { type: String, default: '' }, time: String, current: Boolean, disabled: Boolean });
const emit = defineEmits(['select']);
</script>

<template>
  <button type="button" class="wl-conv" :aria-current="current ? 'true' : undefined" :disabled="disabled" @click="emit('select')">
    <WishlightIcon name="star" class="wl-conv-star" />
    <span class="wl-conv-main"><span class="wl-conv-title"><span>{{ title }}</span><span v-if="time" class="wl-conv-time">{{ time }}</span></span><span class="wl-conv-snip">{{ snippet }}</span></span>
  </button>
</template>
