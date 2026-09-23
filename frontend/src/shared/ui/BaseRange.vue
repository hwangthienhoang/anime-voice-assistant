<script setup>
import { useId } from 'vue';
defineOptions({ inheritAttrs: false });
const props = defineProps({ modelValue: { type: Number, default: 1 }, label: { type: String, required: true }, min: { type: Number, default: 0.5 }, max: { type: Number, default: 2 }, step: { type: Number, default: 0.1 }, unit: { type: String, default: '×' }, disabled: Boolean, id: String });
const emit = defineEmits(['update:modelValue']);
const inputId = props.id || useId();
</script>

<template>
  <div class="wl-field">
    <div class="wl-range-label"><label :for="inputId" class="wl-field-label">{{ label }}</label><output :for="inputId">{{ modelValue }}{{ unit }}</output></div>
    <input v-bind="$attrs" :id="inputId" class="wl-range" type="range" :value="modelValue" :min="min" :max="max" :step="step" :disabled="disabled" :aria-valuetext="`${modelValue}${unit}`" @input="emit('update:modelValue', Number($event.target.value))" />
  </div>
</template>
