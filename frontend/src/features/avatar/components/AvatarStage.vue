<script setup>
import { computed } from 'vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
const props = defineProps({ status: { type: String, default: 'empty' }, message: String, controls: Boolean });
const emit = defineEmits(['select-model', 'retry', 'zoom-in', 'zoom-out']);
const safeStatus = computed(() => ['empty', 'loading', 'error', 'ready'].includes(props.status) ? props.status : 'empty');
const labels = { empty: 'Chưa có nhân vật', loading: 'Đang tải nhân vật…', error: 'Không tải được nhân vật' };
</script>

<template>
  <section class="wl-stage" aria-label="Khu vực nhân vật">
    <div class="wl-stage-scene"><slot v-if="safeStatus === 'ready'" name="avatar" />
      <div v-else class="wl-stage-status" :role="safeStatus === 'error' ? 'alert' : 'status'">
        <WishlightIcon :name="safeStatus === 'loading' ? 'loader' : safeStatus === 'error' ? 'warning' : 'star'" :class="{ 'wl-spin': safeStatus === 'loading' }" />
        <h3 class="wl-text-title">{{ labels[safeStatus] }}</h3>
        <p>{{ message || 'Nhân vật sẽ xuất hiện tại đây.' }}</p>
        <BaseButton v-if="controls && safeStatus === 'empty'" variant="secondary" icon="plus" @click="emit('select-model')">Chọn file .vrm</BaseButton>
        <BaseButton v-if="controls && safeStatus === 'error'" variant="secondary" icon="refresh" @click="emit('retry')">Thử lại</BaseButton>
      </div>
    </div>
    <div v-if="controls && safeStatus === 'ready'" class="wl-stage-zoom"><button type="button" class="wl-icon-button" aria-label="Phóng to" @click="emit('zoom-in')"><WishlightIcon name="plus" /></button><button type="button" class="wl-icon-button" aria-label="Thu nhỏ" @click="emit('zoom-out')"><WishlightIcon name="minus" /></button></div>
    <div v-if="$slots.dialogue" class="wl-stage-dialogue"><slot name="dialogue" /></div>
    <div v-if="$slots.controls" class="wl-stage-controls"><slot name="controls" /></div>
  </section>
</template>
