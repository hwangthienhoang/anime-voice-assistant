import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { VRMAvatar } from '../runtime/VRMAvatar.js';
import { useStageTypewriter } from './useStageTypewriter.js';

export function useAvatar() {
  const container = ref(null);
  const presentation = ref(null);
  const status = ref('loading');
  const message = ref('Đang mở cánh cửa tới sân khấu…');
  const { text: cue, visibleText: visibleCue, typing, show: showCue, reveal: revealCue } = useStageTypewriter();
  const sequence = ref(null);
  const progress = ref(0);
  const availableClips = ref([]);
  const catalogue = ref([]);
  const mixes = ref([]);
  const selectedClip = ref(null);
  const selectedMix = ref(null);
  const clipLoading = ref(null);
  const name = ref('Nhân vật');
  const avatar = shallowRef(null);
  let generation = 0;
  let previewRequest = 0;
  let media;

  async function load() {
    const current = ++generation;
    previewRequest++;
    avatar.value?.dispose();
    avatar.value = null;
    availableClips.value = [];
    catalogue.value = [];
    mixes.value = [];
    selectedClip.value = null;
    selectedMix.value = null;
    clipLoading.value = null;
    status.value = 'loading';
    name.value = 'Nhân vật';
    message.value = 'Đang tải nhân vật và chuyển động…';
    try {
      const instance = new VRMAvatar(container.value, {
        onCue: (step, kind, index, total) => {
          showCue(step.label.replaceAll('{name}', name.value), { animate: kind === 'intro', reducedMotion: media?.matches });
          sequence.value = kind;
          progress.value = index / total;
        },
        onSequenceEnd: () => {
          revealCue();
          instance.setMouthPreview('intro', false);
          sequence.value = null;
          progress.value = 0;
          instance.emotion = 'neutral';
          instance.animations.idle();
        },
      });
      avatar.value = instance;
      const loaded = await instance.load(`${import.meta.env.BASE_URL}models/avatar.vrm`);
      if (current !== generation || !loaded) return;
      availableClips.value = instance.animations.available;
      catalogue.value = instance.animations.catalogue;
      mixes.value = instance.animations.mixes;
      name.value = instance.vrm?.meta?.name || instance.vrm?.meta?.title || 'Nhân vật';
      status.value = 'ready';
      message.value = instance.animationError ? 'Model đã tải; một số chuyển động chưa sẵn sàng.' : '';
      showCue('Chào mừng bạn đến với Wishlight.');
      if (!media?.matches && !instance.animationError) playSequence('intro');
    } catch (error) {
      if (current !== generation) return;
      console.error('[stage] Không tải được avatar:', error);
      avatar.value?.dispose();
      avatar.value = null;
      status.value = 'error';
      message.value = error.message || 'Không tải được model.';
    }
  }

  function playSequence(kind = 'demo') {
    if (!avatar.value?.startSequence(kind)) return;
    previewRequest++;
    selectedClip.value = null;
    selectedMix.value = null;
    clipLoading.value = null;
    showCue(kind === 'demo' ? 'Chuỗi chuyển động bắt đầu…' : `${name.value} đang đến…`);
    sequence.value = kind;
    progress.value = 0;
  }

  async function playClip(clip, emotion = 'neutral', { loop = false, speaking = false } = {}) {
    const instance = avatar.value;
    if (!instance || status.value !== 'ready') return;
    const request = ++previewRequest;
    instance.stopSequence();
    selectedClip.value = null;
    selectedMix.value = null;
    clipLoading.value = clip;
    showCue(`Đang tải ${clip}.vrma…`);
    try {
      const loaded = await instance.prepareClip(clip);
      if (!loaded || request !== previewRequest || instance !== avatar.value) return;
      instance.play(clip, emotion, { loop, speaking });
      availableClips.value = instance.animations.available;
      selectedClip.value = clip;
      message.value = '';
      showCue(loop ? `Đang phát lặp: ${clip}.vrma` : `Đã phát: ${clip}.vrma`);
      presentation.value?.scrollIntoView({ behavior: media?.matches ? 'auto' : 'smooth', block: 'start' });
    } catch (error) {
      if (request !== previewRequest || instance !== avatar.value) return;
      message.value = `Không tải được ${clip}.vrma: ${error.message}`;
      showCue(`Không phát được ${clip}.vrma`);
    } finally {
      if (request === previewRequest) clipLoading.value = null;
    }
  }

  async function playMix(mix) {
    const instance = avatar.value;
    if (!instance || status.value !== 'ready') return;
    const request = ++previewRequest;
    instance.stopSequence();
    selectedClip.value = null;
    selectedMix.value = null;
    clipLoading.value = mix.id;
    showCue(`Đang chuẩn bị ${mix.label}…`);
    try {
      const loaded = await Promise.all([instance.prepareClip(mix.base), instance.prepareClip(mix.gesture)]);
      if (loaded.some((value) => !value) || request !== previewRequest || instance !== avatar.value) return;
      if (!instance.playMix(mix.base, mix.gesture, mix.emotion || 'neutral')) throw new Error('Clip cử chỉ không có chuyển động thân trên.');
      availableClips.value = instance.animations.available;
      selectedMix.value = mix.id;
      message.value = '';
      showCue(`Đang xem: ${mix.label}`);
      presentation.value?.scrollIntoView({ behavior: media?.matches ? 'auto' : 'smooth', block: 'start' });
    } catch (error) {
      if (request !== previewRequest || instance !== avatar.value) return;
      message.value = `Không phát được ${mix.label}: ${error.message}`;
      showCue(`Không phát được ${mix.label}`);
    } finally {
      if (request === previewRequest) clipLoading.value = null;
    }
  }

  function stopSequence() {
    previewRequest++;
    selectedClip.value = null;
    selectedMix.value = null;
    clipLoading.value = null;
    avatar.value?.stopSequence();
    sequence.value = null;
    progress.value = 0;
    showCue('Nhân vật đang nghỉ.');
  }

  function zoomStep(direction) { avatar.value?.zoomStep(direction); }

  watch([typing, sequence], ([isTyping, kind]) => {
    avatar.value?.setMouthPreview('intro', isTyping && kind === 'intro');
  });

  onMounted(() => {
    media = window.matchMedia('(prefers-reduced-motion: reduce)');
    load();
  });
  onBeforeUnmount(() => {
    generation++;
    previewRequest++;
    avatar.value?.dispose();
    avatar.value = null;
  });

  return { container, presentation, status, message, cue, visibleCue, typing, sequence, progress, availableClips, catalogue, mixes, selectedClip, selectedMix, clipLoading, name, load, playSequence, playClip, playMix, stopSequence, zoomStep };
}
