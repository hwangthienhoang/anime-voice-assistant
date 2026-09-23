<script setup>
import { onMounted, ref, useId, watch } from 'vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import BaseNotice from '@/shared/ui/BaseNotice.vue';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
import ChatBubble from './ChatBubble.vue';
import ConversationItem from './ConversationItem.vue';
const props = defineProps({ title: { type: String, default: 'Trò chuyện với Hana' }, conversations: { type: Array, default: () => [] }, messages: { type: Array, default: () => [] }, currentId: String, loading: Boolean, error: String });
const emit = defineEmits(['select', 'play', 'back', 'retry']);
const thread = ref(null);
function scrollToLatest() { if (thread.value) thread.value.scrollTop = thread.value.scrollHeight; }
onMounted(scrollToLatest);
watch(() => [props.messages.length, props.loading], scrollToLatest, { flush: 'post' });
const sidebarOpen = ref(false);
const sidebarId = useId();
function select(id) { sidebarOpen.value = false; emit('select', id); }
</script>

<template>
  <section class="wl-page" aria-label="Trang chat chi tiết">
    <aside :id="sidebarId" class="wl-side" :class="{ 'wl-side-open': sidebarOpen }" aria-label="Danh sách cuộc trò chuyện">
      <h3 class="wl-text-title">Nhật ký</h3>
      <ConversationItem v-for="item in conversations" :key="item.id" :title="item.title" :snippet="item.snippet" :time="item.time" :disabled="item.disabled" :current="item.id === currentId" @select="select(item.id)" />
      <p v-if="!conversations.length" class="wl-muted">Chưa có cuộc trò chuyện.</p>
    </aside>
    <div class="wl-main">
      <header class="wl-main-head">
        <button type="button" class="wl-icon-button wl-sidebar-toggle" aria-label="Danh sách hội thoại" :aria-expanded="sidebarOpen" :aria-controls="sidebarId" @click="sidebarOpen = !sidebarOpen"><WishlightIcon :name="sidebarOpen ? 'close' : 'menu'" /></button>
        <h3 class="wl-text-title">{{ title }}</h3>
        <BaseButton variant="ghost" icon="back" @click="emit('back')">Về sân khấu</BaseButton>
      </header>
      <div ref="thread" class="wl-thread" aria-label="Tin nhắn">
        <BaseNotice v-if="error" tone="error" title="Chưa gửi được tin nhắn" :description="error"><template #action><BaseButton variant="secondary" icon="refresh" @click="emit('retry')">Thử lại</BaseButton></template></BaseNotice>
        <p v-if="!messages.length && !loading && !error" class="wl-empty">Câu chuyện của bạn bắt đầu từ một lời chào.</p>
        <ChatBubble v-for="message in messages" :key="message.id" v-bind="message" @play="emit('play', message.id)" />
        <ChatBubble v-if="loading" typing />
      </div>
      <footer v-if="$slots.composer" class="wl-main-foot"><slot name="composer" /></footer>
    </div>
  </section>
</template>
