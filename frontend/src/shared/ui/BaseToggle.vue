<script setup>
defineProps({ modelValue: Boolean, label: { type: String, required: true }, disabled: Boolean });
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <button type="button" role="switch" class="wl-toggle" :aria-checked="modelValue" :disabled="disabled"
    @click="emit('update:modelValue', !modelValue)">
    <span class="wl-toggle-track" aria-hidden="true"><span class="wl-toggle-thumb" /></span>
    <span>{{ label }}</span>
  </button>
</template>
