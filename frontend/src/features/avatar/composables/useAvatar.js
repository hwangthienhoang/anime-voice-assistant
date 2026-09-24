import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { VRMAvatar } from '../runtime/VRMAvatar.js';
import { useStageTypewriter } from './useStageTypewriter.js';

export function useAvatar() {
  const container = ref(null);
  const status = ref('loading');
  const message = ref('Đang mở cánh cửa tới sân khấu…');
  const { text: cue, visibleText: visibleCue, typing, show: showCue, reveal: revealCue } = useStageTypewriter();
  const sequence = ref(null);
  const progress = ref(0);
  const availableClips = ref([]);
  const name = ref('Nhân vật');
  const avatar = shallowRef(null);
  let generation = 0;
  let media;

  async function load() {
    const current = ++generation;
    avatar.value?.dispose();
    avatar.value = null;
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
    showCue(kind === 'demo' ? 'Chuỗi chuyển động bắt đầu…' : `${name.value} đang đến…`);
    sequence.value = kind;
    progress.value = 0;
  }

  function playClip(clip, emotion = 'neutral') {
    if (!avatar.value) return;
    avatar.value.stopSequence();
    avatar.value.play(clip, emotion);
    showCue(`Đang diễn: ${clip}`);
  }

  function stopSequence() {
    avatar.value?.stopSequence();
    showCue('Nhân vật đang nghỉ.');
  }

  function zoomStep(direction) { avatar.value?.zoomStep(direction); }

  onMounted(() => {
    media = window.matchMedia('(prefers-reduced-motion: reduce)');
    load();
  });
  onBeforeUnmount(() => {
    generation++;
    avatar.value?.dispose();
    avatar.value = null;
  });

  return { container, status, message, cue, visibleCue, typing, sequence, progress, availableClips, name, load, playSequence, playClip, stopSequence, zoomStep };
}
