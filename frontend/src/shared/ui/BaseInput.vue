<script setup>
import { useId } from 'vue';
defineOptions({ inheritAttrs: false });
const props = defineProps({ modelValue: { type: String, default: '' }, label: { type: String, required: true }, hint: String, error: String, disabled: Boolean, id: String });
const emit = defineEmits(['update:modelValue']);
const inputId = props.id || useId();
</script>

<template>
  <div class="wl-field">
    <label :for="inputId" class="wl-field-label">{{ label }}</label>
    <input v-bind="$attrs" :id="inputId" class="wl-input" :value="modelValue" :disabled="disabled"
      :aria-invalid="Boolean(error)" :aria-describedby="hint || error ? `${inputId}-help` : undefined"
      @input="emit('update:modelValue', $event.target.value)" />
    <span v-if="hint || error" :id="`${inputId}-help`" class="wl-field-help" :class="{ 'wl-error-text': error }">{{ error || hint }}</span>
  </div>
</template>
