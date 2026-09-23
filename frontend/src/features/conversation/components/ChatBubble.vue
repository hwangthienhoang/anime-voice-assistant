<script setup>
import { computed } from 'vue';
import EmotionTag from '@/shared/ui/EmotionTag.vue';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
const props = defineProps({ from: { type: String, default: 'ai' }, text: { type: String, default: '' }, name: { type: String, default: 'Hana' }, time: String, emotion: { type: String, default: 'neutral' }, voice: { type: Object, default: null }, typing: Boolean, interim: Boolean });
const emit = defineEmits(['play']);
const sender = computed(() => props.from === 'user' ? 'user' : 'ai');
const duration = computed(() => {
  const seconds = Math.max(0, Math.round(Number(props.voice?.duration) || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
});
</script>

<template>
  <article class="wl-msg" :class="[`wl-msg-${sender}`, { 'wl-msg-interim': interim }]" :aria-label="sender === 'user' ? 'Tin nhắn của bạn' : `Tin nhắn của ${name}`">
    <div class="wl-msg-meta"><span v-if="sender === 'ai'" class="wl-msg-name">{{ name }}</span><EmotionTag v-if="sender === 'ai' && emotion !== 'neutral'" :emotion="emotion" /><span v-if="time">{{ time }}</span><span v-if="interim">Đang nhận dạng…</span></div>
    <div v-if="typing" class="wl-msg-body" role="status" aria-label="Đang soạn tin"><span class="wl-typing" aria-hidden="true"><i /><i /><i /></span></div>
    <p v-else class="wl-msg-body">{{ text }}</p>
    <button v-if="voice && !typing" type="button" class="wl-voice" :disabled="voice.disabled" :aria-label="`Phát lại tin nhắn của ${sender === 'user' ? 'bạn' : name}`" @click="emit('play')"><WishlightIcon name="play" />Phát lại · {{ duration }}</button>
  </article>
</template>
