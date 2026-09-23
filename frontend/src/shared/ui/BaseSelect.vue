<script setup>
import { useId } from 'vue';
import WishlightIcon from './WishlightIcon.vue';
defineOptions({ inheritAttrs: false });
const props = defineProps({ modelValue: { type: String, default: '' }, label: { type: String, required: true }, options: { type: Array, required: true }, disabled: Boolean, id: String });
const emit = defineEmits(['update:modelValue']);
const inputId = props.id || useId();
</script>

<template>
  <div class="wl-field">
    <label :for="inputId" class="wl-field-label">{{ label }}</label>
    <span class="wl-select-wrap">
      <select v-bind="$attrs" :id="inputId" class="wl-input wl-select" :value="modelValue" :disabled="disabled" @change="emit('update:modelValue', $event.target.value)">
        <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">{{ option.label }}</option>
      </select>
      <WishlightIcon name="chevron" />
    </span>
  </div>
</template>
