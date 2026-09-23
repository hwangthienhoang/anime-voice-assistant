<script setup>
import { computed, ref } from 'vue';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
const props = defineProps({ modelValue: { type: String, default: '' }, placeholder: { type: String, default: 'Nhắn gì đó cho bạn đồng hành…' }, label: { type: String, default: 'Tin nhắn' }, disabled: Boolean });
const emit = defineEmits(['update:modelValue', 'send', 'mic']);
const composing = ref(false);
const canSend = computed(() => Boolean(props.modelValue.trim()) && !props.disabled);
function send() { if (canSend.value && !composing.value) emit('send', props.modelValue.trim()); }
function onKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !composing.value && event.keyCode !== 229) { event.preventDefault(); send(); }
}
</script>

<template>
  <form class="wl-composer" aria-label="Soạn tin nhắn" @submit.prevent="send">
    <textarea :value="modelValue" rows="2" :placeholder="placeholder" :aria-label="label" :disabled="disabled"
      @input="emit('update:modelValue', $event.target.value)" @keydown="onKeydown"
      @compositionstart="composing = true" @compositionend="composing = false" />
    <slot name="mic"><button type="button" class="wl-mic wl-mic-idle" aria-label="Nhấn để nói" :disabled="disabled" @click="emit('mic')"><WishlightIcon name="mic" /></button></slot>
    <button type="submit" class="wl-btn wl-btn-primary wl-btn-noicon wl-send" :disabled="!canSend" aria-label="Gửi tin nhắn"><WishlightIcon name="send" /></button>
  </form>
</template>
