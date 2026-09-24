<script setup>
import { computed, inject, ref } from 'vue';
import AvatarStage from '@/features/avatar/components/AvatarStage.vue';
import { STAGE_SEQUENCE } from '@/features/avatar/runtime/DemoSequence.js';
import BaseButton from '@/shared/ui/BaseButton.vue';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
import { useAvatar } from '@/features/avatar/composables/useAvatar.js';
import { workspacePanelKey } from '@/shared/constants/workspacePanel.js';

const { container, presentation, status, message, cue, visibleCue, typing, sequence, progress, availableClips, catalogue, mixes, selectedClip, selectedMix, clipLoading, name, load, playSequence, playClip: runClip, playMix: runMix, stopSequence, zoomStep } = useAvatar();
const workspacePanel = inject(workspacePanelKey, null);
const showOpenLibrary = computed(() => workspacePanel && !workspacePanel.rightVisible.value);
function playClip(name, emotion, options) {
  runClip(name, emotion, options);
  workspacePanel?.closeRightOnNarrow();
}
function playMix(mix) {
  runMix(mix);
  workspacePanel?.closeRightOnNarrow();
}
const canPlay = (kind) => status.value === 'ready' && STAGE_SEQUENCE[kind].every((step) => availableClips.value.includes(step.clip));
const canDemo = computed(() => canPlay('demo'));
const canIntro = computed(() => canPlay('intro'));
const categoryId = ref('gestures');
const activeCategory = computed(() => catalogue.value.find((group) => group.id === categoryId.value) || catalogue.value[0]);
const clipCount = computed(() => catalogue.value.reduce((total, group) => total + group.clips.length, 0));
</script>

<template>
  <div class="stage-page">
    <header class="stage-page-header">
      <div>
        <h1>Sân khấu ánh sao</h1>
        <p>Một khoảnh khắc ra mắt dành riêng cho nhân vật của bạn.</p>
      </div>
      <BaseButton v-if="showOpenLibrary" variant="secondary" icon="play" class="stage-open-controls" @click="workspacePanel.openTool('animations')">Thư viện VRMA</BaseButton>
      <span class="stage-local"><span class="stage-local-dot" /> Demo trên thiết bị</span>
    </header>

    <div ref="presentation" class="stage-presentation">
      <AvatarStage :status="status" :message="message" controls @retry="load" @zoom-in="zoomStep(1)" @zoom-out="zoomStep(-1)">
        <template #avatar>
          <div class="stage-sky" aria-hidden="true">
            <div class="stage-halo" />
            <div class="stage-arch stage-arch-one" />
            <div class="stage-arch stage-arch-two" />
            <div class="stage-star stage-star-one">✦</div>
            <div class="stage-star stage-star-two">✧</div>
            <div class="stage-star stage-star-three">✦</div>
            <div class="stage-star stage-star-four">✧</div>
            <div class="stage-ground" />
          </div>
          <div ref="container" class="stage-canvas" aria-label="Nhân vật 3D" />
        </template>
      </AvatarStage>

      <div class="stage-intro">
        <span class="stage-kicker"><WishlightIcon name="star" /> Gặp gỡ nhân vật</span>
        <h2>Một lời chào<br /><em>từ thế giới nhỏ.</em></h2>
        <p>Hãy để ánh sao dẫn lối. Nhân vật sẽ chào sân, rồi bạn có thể thử từng nét mặt và cử chỉ.</p>
      </div>
      <div v-if="status === 'ready'" class="stage-caption">
        <span class="stage-caption-icon">✦</span>
        <div><span class="stage-caption-name">{{ name.toLocaleUpperCase('vi') }} · {{ sequence === 'intro' ? 'RA MẮT' : sequence === 'demo' ? 'DEMO' : 'SÂN KHẤU' }}</span><strong :class="{ 'is-typing': typing }" aria-hidden="true">{{ visibleCue }}</strong><span class="wl-sr-only" role="status" aria-live="polite">{{ cue }}</span></div>
      </div>
    </div>

    <section class="stage-console" aria-label="Điều khiển animation">
      <div class="console-title">
        <span class="console-symbol">✦</span>
        <div><h2>Khoảnh khắc chuyển động</h2><p>Phát chuỗi demo hoặc chọn một animation để xem riêng.</p></div>
      </div>
      <div class="console-actions">
        <BaseButton v-if="!sequence" icon="star" :disabled="!canDemo" @click="playSequence('demo')">Xem chuỗi demo</BaseButton>
        <BaseButton v-else variant="secondary" icon="close" @click="stopSequence">Dừng chuỗi</BaseButton>
        <BaseButton variant="secondary" icon="refresh" :disabled="!canIntro" @click="playSequence('intro')">Xem lại màn chào</BaseButton>
      </div>
      <div v-if="sequence" class="console-progress" :aria-label="`Tiến độ ${Math.round(progress * 100)}%`"><span :style="{ width: `${progress * 100}%` }" /></div>
    </section>

    <Teleport defer to="#stage-animation-panel">
      <div v-if="catalogue.length" class="console-catalog">
        <div class="catalog-heading">
          <div><h3>Thư viện VRMA</h3><p>Chọn một clip để xem trực tiếp trên sân khấu.</p></div>
          <span>{{ clipCount }} clip</span>
        </div>
        <div class="catalog-categories" role="group" aria-label="Danh mục animation">
          <button v-for="group in catalogue" :key="group.id" type="button" :aria-pressed="activeCategory.id === group.id" @click="categoryId = group.id">{{ group.label }} <span>{{ group.clips.length }}</span></button>
        </div>
        <p class="catalog-description">{{ activeCategory.description }}</p>
        <div class="catalog-grid" role="group" :aria-label="`Clip ${activeCategory.label}`">
          <button v-for="clip in activeCategory.clips" :key="clip.name" type="button" :disabled="status !== 'ready' || clipLoading === clip.name" :aria-pressed="selectedClip === clip.name" @click="playClip(clip.name, clip.emotion || 'neutral', { loop: activeCategory.loop, speaking: activeCategory.speaking })">
            <span>{{ clip.label }}</span>
            <small>{{ clip.name }}.vrma</small>
          </button>
        </div>
        <div v-if="mixes.length" class="catalog-mixes">
          <div class="catalog-heading"><div><h3>Mix cho hội thoại</h3><p>Phối chuyển động thân trên với animation nói và preview khẩu hình.</p></div><span>{{ mixes.length }} mix</span></div>
          <div class="catalog-grid mix-grid" role="group" aria-label="Mix animation cho hội thoại">
            <button v-for="mix in mixes" :key="mix.id" type="button" :disabled="status !== 'ready' || clipLoading === mix.id" :aria-pressed="selectedMix === mix.id" @click="playMix(mix)">
              <span>{{ mix.label }}</span><small>{{ mix.description }}</small>
            </button>
          </div>
          <p class="catalog-description">Khẩu hình là mô phỏng để xem trước; chưa đồng bộ với audio hoặc TTS.</p>
        </div>
        <div v-if="clipLoading || selectedClip || selectedMix" class="catalog-status" role="status">
          <span>{{ clipLoading ? `Đang tải ${clipLoading}…` : selectedMix ? `Đang xem mix: ${mixes.find((mix) => mix.id === selectedMix)?.label}` : `Đã chọn ${selectedClip}.vrma` }}</span>
          <button v-if="selectedClip || selectedMix" type="button" @click="stopSequence">Về idle</button>
        </div>
      </div>
    </Teleport>
    <p class="stage-footnote">{{ message || 'Model và chuyển động chạy cục bộ trong trình duyệt. Chưa kết nối hội thoại hoặc micro.' }}</p>
  </div>
</template>

<style scoped>
.stage-page { width: min(100%, 1440px); margin: 0 auto; }
.stage-page-header { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 12px 20px; margin-bottom: 20px; }
.stage-open-controls { margin-left: auto; }
.stage-eyebrow { margin: 0 0 4px; color: var(--gold-strong); font-size: 10px; font-weight: 800; letter-spacing: .18em; }
.stage-page-header h1 { margin: 0; color: var(--ink); font: 700 clamp(24px, 3vw, 34px)/1.15 var(--font-display); }
.stage-page-header p:last-child { margin: 7px 0 0; color: var(--ink-muted); font-size: 13px; }
.stage-local { display: inline-flex; align-items: center; gap: 8px; padding: 7px 10px; border: 1px solid var(--line); border-radius: 99px; color: var(--ink-muted); background: var(--parchment-raised); font-size: 11px; white-space: nowrap; }
.stage-local-dot { width: 7px; height: 7px; border-radius: 50%; background: #9abb9d; }
.stage-presentation { position: relative; min-height: 460px; height: min(57vh, 650px); overflow: hidden; scroll-margin-top: 55px; border-radius: 18px; box-shadow: var(--shadow-stage); isolation: isolate; }
.stage-presentation :deep(.wl-stage) { height: 100%; border-radius: 18px; background: #15213b; }
.stage-presentation :deep(.wl-stage-scene) { position: relative; min-height: 0; display: block; padding: 0; overflow: hidden; }
.stage-presentation :deep(.wl-stage-status) { position: absolute; z-index: 6; top: 50%; left: 50%; width: min(90%, 360px); padding: 26px; border: 1px solid #ddc99b65; border-radius: 16px; background: #15213bea; transform: translate(-50%, -50%); }
.stage-presentation :deep(.wl-stage-zoom) { z-index: 5; top: 18px; right: 18px; }
.stage-presentation :deep(.wl-stage-zoom .wl-icon-button) { background: #15213bcf; color: #f5e9d2; border-color: #d5bd8a70; }
.stage-sky { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(ellipse 45% 55% at 57% 51%, #657aa2 0%, #31466d 52%, transparent 100%), radial-gradient(circle at 70% 12%, #43557d 0%, transparent 45%), linear-gradient(130deg, #101c34, #243960 52%, #111a30); }
.stage-sky::before { content: ''; position: absolute; inset: 0; opacity: .45; background-image: radial-gradient(#fff5d6 1px, transparent 1.5px), radial-gradient(#fff 1px, transparent 1.5px); background-size: 113px 113px, 173px 173px; background-position: 18px 7px, 62px 47px; mask-image: linear-gradient(to bottom, #000, transparent 90%); }
.stage-sky::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, #101a32a8 0%, transparent 55%), linear-gradient(0deg, #101a32b8, transparent 33%); }
.stage-halo { position: absolute; width: min(45vw, 430px); aspect-ratio: 1; top: 48%; left: 60%; border: 1px solid #ead4a563; border-radius: 50%; box-shadow: 0 0 0 30px #f6dda20c, 0 0 0 88px #f6dda209, 0 0 75px #e4ca8a34; transform: translate(-50%, -50%); }
.stage-halo::after { content: ''; position: absolute; inset: 12%; border: 1px dashed #f1dba74a; border-radius: 50%; }
.stage-arch { position: absolute; left: 60%; bottom: -66%; width: 130%; aspect-ratio: 1; border: 1px solid #e3c89038; border-radius: 50%; transform: translateX(-50%); }
.stage-arch-two { bottom: -82%; width: 160%; opacity: .5; }
.stage-ground { position: absolute; z-index: 1; left: 60%; bottom: 4%; width: min(52%, 560px); height: 13%; border: 1px solid #ecd5a37a; border-radius: 50%; background: radial-gradient(ellipse, #d3bd9445 0%, #9faac423 45%, transparent 70%); box-shadow: 0 0 55px #d3bd9451, inset 0 0 26px #f5dfaa38; transform: translateX(-50%); }
.stage-star { position: absolute; z-index: 2; color: #f4dfaa; text-shadow: 0 0 24px #fff1b6; }
.stage-star-one { top: 18%; left: 32%; font-size: 18px; }.stage-star-two { top: 14%; right: 16%; font-size: 30px; }.stage-star-three { bottom: 28%; right: 9%; font-size: 12px; }.stage-star-four { bottom: 19%; left: 42%; font-size: 15px; }
.stage-canvas { position: absolute; z-index: 2; inset: 0; }
.stage-intro { position: absolute; z-index: 3; top: 12%; left: 5%; width: min(34%, 345px); pointer-events: none; }
.stage-kicker { display: inline-flex; align-items: center; gap: 8px; color: #e6d3a8; font-size: 10px; font-weight: 800; letter-spacing: .19em; text-transform: uppercase; }
.stage-kicker :deep(svg) { width: 14px; height: 14px; }
.stage-intro h2 { margin: 23px 0 15px; color: #fff9ec; font: 600 clamp(28px, 3.6vw, 54px)/1.08 var(--font-display); letter-spacing: -.035em; }
.stage-intro h2 em { color: #e6ce9a; font-weight: 500; }
.stage-intro p { max-width: 29ch; margin: 0; color: #e4e8f1d6; font-size: 13px; line-height: 1.7; }
.stage-caption { position: absolute; z-index: 4; left: 5%; bottom: 2%; display: flex; align-items: center; gap: 13px; width: min(400px, 70%); min-height: 62px; padding: 11px 17px; border: 1px solid #e0c99b66; border-radius: 12px; color: #fff8e9; background: #111c32c9; backdrop-filter: blur(12px); }
.stage-caption-icon { color: #eacb91; font-size: 24px; }.stage-caption-name { display: block; color: #e2c999; font-size: 10px; font-weight: 800; letter-spacing: .12em; }.stage-caption strong { display: block; margin-top: 3px; font-size: 14px; font-weight: 600; }
.stage-caption strong.is-typing::after { content: '▍'; margin-left: 2px; color: #e2c999; animation: stage-caret 1s steps(1) infinite; }
@keyframes stage-caret { 50% { opacity: 0; } }
.stage-console { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 20px; margin-top: 16px; padding: 18px 20px; border: 1px solid var(--line); border-radius: 14px; background: var(--parchment-raised); box-shadow: var(--shadow-card); }
.console-title { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 210px; }.console-symbol { display: grid; place-items: center; width: 40px; height: 40px; flex: none; border-radius: 11px; color: #ead1a0; background: #233353; font-size: 22px; }.console-title h2 { margin: 0; font-size: 14px; }.console-title p { margin: 3px 0 0; color: var(--ink-muted); font-size: 11px; }
.console-actions { display: flex; flex-wrap: wrap; gap: 8px; }.console-actions :deep(.wl-btn) { min-height: 38px; }
.console-progress { width: 100%; height: 3px; overflow: hidden; border-radius: 4px; background: var(--parchment-sunk); }.console-progress span { display: block; height: 100%; background: var(--gold-strong); transition: width .3s ease; }
.console-catalog { width: 100%; min-width: 0; }
.catalog-heading { display: flex; align-items: start; justify-content: space-between; gap: 14px; }.catalog-heading h3 { margin: 0; color: var(--ink); font-size: 13px; }.catalog-heading p, .catalog-description { margin: 4px 0 0; color: var(--ink-muted); font-size: 11px; }.catalog-heading > span { padding: 4px 8px; border-radius: 99px; color: var(--gold-strong); background: var(--parchment-sunk); font-size: 10px; font-weight: 800; white-space: nowrap; }
.catalog-categories { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 13px; }.catalog-categories button { min-height: 34px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 99px; color: var(--ink-muted); background: var(--parchment); font: 700 11px var(--font-sans); cursor: pointer; }.catalog-categories button span { margin-left: 4px; opacity: .7; }.catalog-categories button[aria-pressed="true"] { border-color: var(--gold-strong); color: var(--ink); background: var(--parchment-sunk); }
.catalog-description { margin-top: 12px; }
.catalog-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }.catalog-grid button { min-width: 0; min-height: 60px; display: flex; flex-direction: column; justify-content: center; align-items: start; gap: 3px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 10px; color: var(--ink); background: var(--parchment); text-align: left; cursor: pointer; }.catalog-grid button span { font-size: 12px; font-weight: 800; }.catalog-grid button small { max-width: 100%; overflow-wrap: anywhere; color: var(--ink-muted); font-size: 10px; }.catalog-grid button:hover:not(:disabled), .catalog-grid button[aria-pressed="true"] { border-color: var(--gold-strong); background: var(--parchment-sunk); }.catalog-grid button:disabled { opacity: .55; cursor: wait; }
.catalog-status { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; color: var(--ink-muted); font-size: 11px; }.catalog-status button { padding: 4px 0; border: 0; color: var(--gold-strong); background: none; font: 800 11px var(--font-sans); cursor: pointer; }
.catalog-mixes { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line); }.mix-grid { grid-template-columns: 1fr; }.mix-grid button { min-height: 68px; }
.stage-footnote { margin: 10px 2px 0; color: var(--ink-muted); font-size: 11px; }
@media (max-width: 760px) { .stage-page-header { align-items: start; }.stage-local { display: none; }.stage-presentation { height: 510px; }.stage-intro { top: 7%; width: 58%; }.stage-intro h2 { margin: 12px 0 8px; font-size: 30px; }.stage-intro p { font-size: 11px; }.stage-halo, .stage-ground, .stage-arch { left: 64%; }.stage-caption { left: 4%; width: min(390px, 90%); }.console-actions { width: 100%; } }
@media (max-width: 480px) { .stage-presentation { height: 530px; min-height: 0; }.stage-intro { top: 5%; left: 5%; width: 75%; }.stage-intro h2 { font-size: 26px; }.stage-intro p { display: none; }.stage-halo, .stage-ground, .stage-arch { left: 57%; }.stage-caption { bottom: 2%; }.stage-console { padding: 15px; }.console-actions :deep(.wl-btn) { flex: 1; } }
@media (prefers-reduced-motion: reduce) { .console-progress span { transition: none; }.stage-caption strong.is-typing::after { animation: none; } }
</style>
