<script setup>
import EmotionTag from '@/shared/ui/EmotionTag.vue';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
defineProps({ speaker: { type: String, default: 'Hana' }, text: { type: String, default: '' }, done: { type: Boolean, default: true }, emotion: { type: String, default: 'neutral' }, subtitle: String, auto: Boolean, disabled: Boolean });
const emit = defineEmits(['toggle-auto', 'log', 'skip', 'reveal']);
</script>

<template>
  <section class="wl-dlg" aria-label="Lời thoại">
    <div class="wl-dlg-ctrls">
      <button type="button" class="wl-dlg-ctrl" :aria-pressed="auto" :disabled="disabled" @click="emit('toggle-auto')">AUTO</button>
      <button type="button" class="wl-dlg-ctrl" :disabled="disabled" @click="emit('log')">LOG</button>
      <button type="button" class="wl-dlg-ctrl" :disabled="disabled" @click="emit('skip')">SKIP</button>
    </div>
    <div class="wl-dlg-head"><span class="wl-dlg-name">{{ speaker }}</span><EmotionTag v-if="emotion !== 'neutral'" :emotion="emotion" on-night /><span class="wl-dlg-rule" aria-hidden="true" /></div>
    <button v-if="!done" type="button" class="wl-dlg-reveal wl-dlg-text" :disabled="disabled" aria-label="Hiện toàn bộ lời thoại" @click="emit('reveal')">{{ text }}</button>
    <p v-else class="wl-dlg-text">{{ text }}<WishlightIcon name="star" class="wl-dlg-caret" /></p>
    <p v-if="subtitle" class="wl-dlg-sub">{{ subtitle }}</p>
  </section>
</template>
