<script setup>
import BaseToggle from '@/shared/ui/BaseToggle.vue';
import BaseSelect from '@/shared/ui/BaseSelect.vue';
import BaseRange from '@/shared/ui/BaseRange.vue';
const props = defineProps({ modelValue: { type: Object, required: true }, voices: { type: Array, default: () => [] }, disabled: Boolean });
const emit = defineEmits(['update:modelValue']);
const themes = [{ value: 'light', label: 'Parchment · Sáng' }, { value: 'dark', label: 'Night · Tối' }];
function update(key, value) { emit('update:modelValue', { ...props.modelValue, [key]: value }); }
</script>

<template>
  <section class="wl-settings" aria-label="Tùy chọn giao diện và giọng nói">
    <fieldset :disabled="disabled"><legend>Giao diện</legend>
      <BaseSelect label="Theme" :model-value="modelValue.theme || 'light'" :options="themes" :disabled="disabled" @update:model-value="update('theme', $event)" />
      <BaseToggle label="Hiện phụ đề song ngữ" :model-value="Boolean(modelValue.subtitles)" :disabled="disabled" @update:model-value="update('subtitles', $event)" />
      <BaseToggle label="Giảm chuyển động" :model-value="Boolean(modelValue.reducedMotion)" :disabled="disabled" @update:model-value="update('reducedMotion', $event)" />
    </fieldset>
    <fieldset :disabled="disabled"><legend>Giọng nói</legend>
      <BaseSelect v-if="voices.length" label="Giọng nhân vật" :model-value="modelValue.voice || ''" :options="voices" :disabled="disabled" @update:model-value="update('voice', $event)" />
      <BaseRange label="Tốc độ đọc" :model-value="modelValue.rate ?? 1" :disabled="disabled" @update:model-value="update('rate', $event)" />
      <BaseToggle label="Tự động phát giọng nói" :model-value="Boolean(modelValue.autoPlay)" :disabled="disabled" @update:model-value="update('autoPlay', $event)" />
    </fieldset>
  </section>
</template>
