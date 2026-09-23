<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import ShowcaseSection from '@/features/devtools/components/ShowcaseSection.vue';
import TokenCatalogue from '@/features/devtools/components/TokenCatalogue.vue';
import { useGalleryDemo } from '@/features/devtools/composables/useGalleryDemo.js';
import BaseButton from '@/shared/ui/BaseButton.vue';
import BaseToggle from '@/shared/ui/BaseToggle.vue';
import BaseInput from '@/shared/ui/BaseInput.vue';
import BaseSelect from '@/shared/ui/BaseSelect.vue';
import BaseRange from '@/shared/ui/BaseRange.vue';
import BaseNotice from '@/shared/ui/BaseNotice.vue';
import EmotionTag from '@/shared/ui/EmotionTag.vue';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
import PagePlaceholder from '@/shared/ui/PagePlaceholder.vue';
import MicButton from '@/features/voice/components/MicButton.vue';
import DialogueBox from '@/features/conversation/components/DialogueBox.vue';
import ChatBubble from '@/features/conversation/components/ChatBubble.vue';
import ChatComposer from '@/features/conversation/components/ChatComposer.vue';
import ConversationItem from '@/features/conversation/components/ConversationItem.vue';
import ChatPanel from '@/features/conversation/components/ChatPanel.vue';
import SettingsPanel from '@/features/settings/components/SettingsPanel.vue';
import AvatarStage from '@/features/avatar/components/AvatarStage.vue';
import { EMOTIONS } from '@/shared/constants/emotions.js';
import { VOICE_STATES } from '@/shared/constants/voiceStates.js';

const {
  preferences, theme, events, log, composerText, messages, conversations, currentId,
  chatState, micState, avatarStatus, zoom, dialogueText, dialogueDone, auto,
  reveal, typeDialogue, send, selectConversation, cycleMic,
} = useGalleryDemo();
const navigation = [
  ['palette', 'Màu sắc'], ['typography', 'Typography'], ['geometry', 'Spacing & surfaces'],
  ['icons', 'Iconography'], ['controls', 'Buttons & fields'], ['voice', 'Voice & emotions'],
  ['conversation', 'Conversation'], ['patterns', 'Patterns & states'],
];
const buttonVariants = ['primary', 'secondary', 'ghost', 'danger'];
const sampleName = ref('Hana');
const invalidName = ref('');
const sampleToggle = ref(true);
const sampleRange = ref(1);
const sampleEmotion = ref('happy');
const composerSample = ref('');
const voices = [{ value: 'hana', label: 'Hana · giọng mẫu 01' }, { value: 'aki', label: 'Aki · giọng mẫu 02' }];
const selectedVoice = ref('hana');
const emotionOptions = EMOTIONS.map(value => ({ value, label: value }));
const chatOptions = ['ready', 'empty', 'loading', 'error'].map(value => ({ value, label: value }));
const avatarOptions = ['ready', 'empty', 'loading', 'error'].map(value => ({ value, label: value }));
const shownMessages = computed(() => chatState.value === 'empty' ? [] : messages.value);
const previewTitle = computed(() => conversations.value.find(item => item.id === currentId.value)?.title || 'Trò chuyện với Hana');
watch(() => preferences.value.reducedMotion, value => { if (value) reveal(); });
function changeZoom(delta) { zoom.value = Math.max(0.7, Math.min(1.3, zoom.value + delta)); log(`Zoom mẫu: ${zoom.value.toFixed(1)}×.`); }
</script>

<template>
  <div class="design-gallery" :data-theme="theme" :data-reduced-motion="preferences.reducedMotion">
    <aside class="gallery-sidebar" aria-label="Mục lục design system">
      <RouterLink class="gallery-back" :to="{ name: 'stage' }"><WishlightIcon name="back" />Về ứng dụng</RouterLink>
      <a class="gallery-brand" href="#overview"><WishlightIcon name="star" /><span>Wishlight<small>INTERFACE LIBRARY</small></span></a>
      <p class="sidebar-caption">FOUNDATIONS & COMPONENTS</p>
      <nav><a v-for="([id, label], index) in navigation" :key="id" :href="`#${id}`"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ label }}</a></nav>
      <div class="sidebar-footer"><span class="dev-dot" /> Dev gallery <span>Vue 3 · F1B</span></div>
    </aside>
    <main class="gallery-main" id="gallery-content">
      <header id="overview" class="gallery-hero">
        <div class="hero-top"><span class="eyebrow">DESIGN SYSTEM / 01</span><BaseButton variant="secondary" :icon="theme === 'light' ? 'moon' : 'sun'" @click="preferences.theme = theme === 'light' ? 'dark' : 'light'">{{ theme === 'light' ? 'Chuyển sang Night' : 'Chuyển sang Parchment' }}</BaseButton></div>
        <h1>Một thế giới nhỏ.<br /><em>Từng chi tiết có chủ ý.</em></h1>
        <p class="hero-description">Thư viện giao diện Wishlight cho người bạn đồng hành anime. Khám phá từ một sắc màu đến một cuộc trò chuyện.</p>
        <div class="hero-meta"><span><WishlightIcon name="star" /> Parchment & Night</span><span>Philosopher + Nunito</span><span>Interactive specimens</span></div>
        <div class="gallery-note"><span>PLAYGROUND</span><p>Dữ liệu mẫu chỉ nằm trong trang này. Các nút mic, phát lại và avatar dùng để thử UI; không thu âm, gọi API hoặc tải model.</p></div>
        <BaseToggle v-model="preferences.reducedMotion" label="Giảm chuyển động trong gallery" />
      </header>

      <TokenCatalogue :theme="theme" />

      <ShowcaseSection id="controls" number="05" title="Buttons & fields" description="Control thật, states thật. Dùng Tab để kiểm tra focus; thử Enter, Space và bàn phím trong ô nhập.">
        <div class="specimen-label"><h3>BaseButton</h3><code>variant · icon / slot · disabled · loading</code></div>
        <div class="button-table"><div class="button-table-head"><span>Variant</span><span>Có icon</span><span>Text only</span><span>Disabled</span></div>
          <div v-for="variant in buttonVariants" :key="variant" class="button-row"><code>{{ variant }}</code><BaseButton :variant="variant" :icon="variant === 'danger' ? 'trash' : 'star'" @click="log(`Button ${variant}: click đã được nhận.`)">{{ variant === 'danger' ? 'Thử nút xóa' : 'Bắt đầu hành trình' }}</BaseButton><BaseButton :variant="variant" @click="log(`Button ${variant} không icon: click.`)">Tiếp tục</BaseButton><BaseButton :variant="variant" icon="star" disabled>Chưa sẵn sàng</BaseButton></div>
        </div>
        <div class="inline-specimens"><BaseButton loading>Đang lưu…</BaseButton><BaseButton variant="secondary" @click="log('Custom icon slot: click.')"><template #icon><WishlightIcon name="check" /></template>Icon slot</BaseButton><BaseButton variant="ghost" @click="log('Hover / active / focus được kiểm tra bằng tương tác native.')">Hover / active / focus</BaseButton></div>
        <div class="specimen-label"><h3>BaseToggle</h3><code>v-model · label · disabled</code></div>
        <div class="inline-specimens"><BaseToggle v-model="sampleToggle" label="Cho phép thông báo mẫu" /><BaseToggle :model-value="false" disabled label="Disabled / off" /><BaseToggle :model-value="true" disabled label="Disabled / on" /></div>
        <div class="specimen-label"><h3>Form controls</h3><code>BaseInput · BaseSelect · BaseRange</code></div>
        <div class="field-grid"><BaseInput v-model="sampleName" label="Tên nhân vật mẫu" hint="Nhãn và hint luôn được nối với input." placeholder="Nhập tên nhân vật" /><BaseInput v-model="invalidName" label="Tên bắt buộc" :error="invalidName.trim() ? '' : 'Vui lòng nhập tên nhân vật.'" placeholder="Thử nhập để xóa lỗi" /><BaseInput model-value="Chưa mở khóa" label="Input disabled" disabled /><BaseSelect v-model="selectedVoice" label="Giọng đọc mẫu" :options="voices" /><BaseRange v-model="sampleRange" label="Tốc độ mẫu" /><BaseRange :model-value="1" label="Range disabled" disabled /></div>
      </ShowcaseSection>

      <ShowcaseSection id="voice" number="06" title="Voice & emotions" description="Các trạng thái luôn có nhãn đi cùng màu. Click mic tương tác để đổi vòng state mẫu.">
        <div class="specimen-label"><h3>MicButton</h3><code>idle → listening → thinking → speaking</code></div>
        <div class="mic-specimens"><MicButton v-for="state in VOICE_STATES" :key="state" :state="state" @toggle="log(`Đã click specimen ${state}.`)" /><MicButton disabled label="Không hỗ trợ mic" /></div>
        <div class="interactive-mic"><MicButton :state="micState" :label="`Mic tương tác: ${micState}`" @toggle="cycleMic" /><p>Click để đi qua bốn trạng thái.<br />Không xin quyền microphone.</p></div>
        <div class="specimen-label"><h3>EmotionTag</h3><code>6 emotions · neutral fallback · onNight</code></div>
        <div class="inline-specimens"><EmotionTag v-for="emotion in EMOTIONS" :key="emotion" :emotion="emotion" /><EmotionTag emotion="unknown">Fallback neutral</EmotionTag></div>
        <div class="night-specimens"><EmotionTag v-for="emotion in EMOTIONS" :key="emotion" :emotion="emotion" on-night /></div>
      </ShowcaseSection>

      <ShowcaseSection id="conversation" number="07" title="Conversation" description="Các thành phần hội thoại được compose bằng props, events và slots. Nội dung nhập vào chỉ tồn tại trong preview.">
        <div class="specimen-label"><h3>DialogueBox</h3><code>typewriter · subtitle · AUTO / LOG / SKIP</code></div>
        <div class="preview-toolbar"><BaseSelect v-model="sampleEmotion" label="Emotion của lời thoại" :options="emotionOptions" /><BaseButton variant="secondary" icon="play" @click="typeDialogue">Chạy typewriter mẫu</BaseButton></div>
        <div class="dialogue-preview"><DialogueBox :speaker="sampleName || 'Hana'" :text="dialogueText" :done="dialogueDone" :emotion="sampleEmotion" :auto="auto" :subtitle="preferences.subtitles ? 'Every journey begins with a hello.' : ''" @toggle-auto="auto = !auto; log(`AUTO mẫu: ${auto ? 'bật' : 'tắt'}.`)" @log="log('LOG đã phát event. Trong ứng dụng, owner sẽ điều hướng tới /chat.')" @skip="reveal(); log('SKIP: kết thúc lời thoại mẫu.')" @reveal="reveal" /></div>
        <div class="specimen-label"><h3>ChatBubble</h3><code>assistant · user · typing · interim · voice</code></div>
        <div class="bubble-preview"><ChatBubble text="Một tách trà ấm, một câu chuyện nhỏ. Bạn có muốn kể mình nghe không?" emotion="relaxed" time="21:04" :voice="{ duration: 4 }" @play="log('Phát lại: nhận event, không phát audio thật.')" /><ChatBubble from="user" text="Được chứ. Hôm nay mình đã có một ngày thật dài." time="21:05" /><ChatBubble from="user" text="Và mình đang nghĩ là…" interim /><ChatBubble typing /><ChatBubble text="Bản audio này chưa sẵn sàng." :voice="{ duration: 3, disabled: true }" /></div>
        <div class="specimen-label"><h3>ChatComposer</h3><code>Enter gửi · Shift+Enter xuống dòng · IME-safe</code></div>
        <ChatComposer v-model="composerSample" label="Soạn tin mẫu riêng" @send="log(`Composer gửi mẫu: ${$event}`); composerSample = ''" @mic="log('Composer mic: nhận event.')" />
        <div class="disabled-composer"><ChatComposer model-value="Đang chờ phản hồi…" label="Composer disabled" disabled /></div>
        <div class="specimen-label"><h3>ConversationItem</h3><code>default · selected · disabled</code></div>
        <div class="conversation-specimens"><ConversationItem v-for="item in conversations" :key="item.id" :title="item.title" :snippet="item.snippet" :time="item.time" :disabled="item.disabled" :current="item.id === currentId" @select="selectConversation(item.id)" /><ConversationItem title="Cuộc trò chuyện bị khóa" snippet="Mẫu disabled" disabled /></div>
      </ShowcaseSection>

      <ShowcaseSection id="patterns" number="08" title="Patterns & states" description="Những tổ hợp lớn hơn: chat chi tiết, cài đặt, sân khấu và phản hồi hệ thống.">
        <div class="specimen-label"><h3>ChatPanel</h3><code>sidebar + thread + composer slot</code></div>
        <div class="preview-toolbar"><BaseSelect v-model="chatState" label="Trạng thái chat preview" :options="chatOptions" /></div>
        <ChatPanel :title="previewTitle" :conversations="conversations" :current-id="currentId" :messages="shownMessages" :loading="chatState === 'loading'" :error="chatState === 'error' ? 'Đây là lỗi giả lập để xem UI. Bạn có thể thử lại.' : ''" @select="selectConversation" @play="log('ChatPanel nhận event phát lại mẫu.')" @back="log('ChatPanel nhận event về sân khấu.')" @retry="chatState = 'ready'; log('Đã xóa error state mẫu.')">
          <template #composer><ChatComposer v-model="composerText" label="Nhắn trong chat preview" :disabled="chatState === 'loading'" @send="send"><template #mic><MicButton :state="micState" :show-label="false" :disabled="chatState === 'loading'" @toggle="cycleMic" /></template></ChatComposer></template>
        </ChatPanel>
        <div class="specimen-label"><h3>SettingsPanel</h3><code>controlled v-model · không persistence</code></div>
        <p class="specimen-note">Theme, phụ đề và giảm chuyển động áp dụng ngay trong gallery. Giọng và tốc độ chỉ là giá trị mẫu.</p>
        <SettingsPanel v-model="preferences" :voices="voices" />
        <div class="specimen-label"><h3>AvatarStage</h3><code>empty · loading · error · ready + slots</code></div>
        <div class="preview-toolbar"><BaseSelect v-model="avatarStatus" label="Trạng thái sân khấu mẫu" :options="avatarOptions" /></div>
        <AvatarStage :status="avatarStatus" controls message="Preview bố cục. Runtime VRM sẽ được tích hợp ở F1C." @select-model="avatarStatus = 'ready'; log('Đã chọn nhân vật mẫu, không đọc file.')" @retry="avatarStatus = 'ready'; log('Đã khôi phục sân khấu mẫu.')" @zoom-in="changeZoom(0.1)" @zoom-out="changeZoom(-0.1)">
          <template #avatar><div class="avatar-placeholder" :style="{ transform: `scale(${zoom})` }"><div class="avatar-orbit"><WishlightIcon name="star" /></div><span>AVATAR CANVAS</span><small>Vị trí dành cho nhân vật 3D</small></div></template>
          <template v-if="avatarStatus === 'ready'" #dialogue><DialogueBox speaker="Hana" text="Chào mừng trở lại, nhà lữ hành." emotion="happy" :auto="auto" @toggle-auto="auto = !auto" @log="log('Stage LOG: event mẫu.')" @skip="log('Stage SKIP: event mẫu.')" /></template>
          <template #controls><MicButton :state="micState" @toggle="cycleMic" /></template>
        </AvatarStage>
        <div class="specimen-label"><h3>BaseNotice & PagePlaceholder</h3><code>info · success · error · loading · empty</code></div>
        <div class="notice-specimens"><BaseNotice title="Một hành trình mới" description="Bạn có thể bắt đầu từ bất kỳ lời chào nào." /><BaseNotice tone="success" title="Đã lưu tùy chọn mẫu" description="Màu sắc luôn có nhãn giải thích đi cùng." /><BaseNotice tone="error" title="Kết nối đang gián đoạn" description="Đây là trạng thái lỗi mẫu."><template #action><BaseButton variant="secondary" icon="refresh" @click="log('Notice: thử lại mẫu.')">Thử lại</BaseButton></template></BaseNotice><BaseNotice tone="loading" title="Đang chuẩn bị giọng nói…" description="Mẫu trạng thái chờ, không gọi dịch vụ TTS." /><PagePlaceholder title="Chưa có cuộc trò chuyện" description="Bắt đầu một câu chuyện mới cùng người bạn đồng hành." :heading-level="3"><BaseButton icon="plus" @click="log('Placeholder: tạo cuộc trò chuyện mẫu.')">Cuộc trò chuyện mới</BaseButton></PagePlaceholder></div>
      </ShowcaseSection>
      <footer class="gallery-footer"><WishlightIcon name="star" /><p>Wishlight · Một ngôn ngữ thiết kế, nhiều câu chuyện.</p><a href="#overview">Về đầu trang ↑</a></footer>
    </main>
    <aside class="event-log" aria-label="Event log"><details><summary>Event log <span>{{ events[0] }}</span></summary><ol><li v-for="(event, index) in events" :key="index">{{ event }}</li></ol></details><span class="wl-sr-only" role="status">{{ events[0] }}</span></aside>
  </div>
</template>

<style scoped>
.design-gallery { min-height: 100dvh; background: var(--parchment); color: var(--ink); display: grid; grid-template-columns: 240px minmax(0, 1fr); }
.gallery-sidebar { position: sticky; top: 0; height: 100dvh; padding: var(--space-6); border-right: var(--border-thin) solid var(--line); display: flex; flex-direction: column; gap: var(--space-6); background: var(--parchment-raised); overflow-y: auto; }
.gallery-back { display: flex; align-items: center; gap: var(--space-2); color: var(--ink-muted); text-decoration: none; font-size: 12px; }
.gallery-back svg { width: 16px; height: 16px; }
.gallery-brand { display: flex; gap: var(--space-3); align-items: center; text-decoration: none; color: var(--ink); font: 700 28px/32px var(--font-display); padding-block: var(--space-4); }
.gallery-brand > svg { width: 30px; height: 30px; color: var(--gold-strong); }
.gallery-brand small { display: block; font: 700 9px/16px var(--font-sans); letter-spacing: .14em; color: var(--ink-muted); margin-top: var(--space-1); }
.sidebar-caption { font-size: 9px; font-weight: 800; letter-spacing: .08em; color: var(--ink-muted); margin: 0; }
.gallery-sidebar nav { display: grid; gap: var(--space-1); }
.gallery-sidebar nav a { display: flex; gap: var(--space-3); padding: var(--space-2); color: var(--ink); text-decoration: none; font-size: 13px; border-radius: var(--radius-sm); }
.gallery-sidebar nav a:hover { background: var(--parchment-sunk); }
.gallery-sidebar nav span { font-size: 10px; color: var(--gold-strong); font-variant-numeric: tabular-nums; align-self: center; }
.sidebar-footer { margin-top: auto; font-size: 11px; color: var(--ink-muted); display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
.sidebar-footer > span:last-child { width: 100%; padding-left: var(--space-4); }
.dev-dot { width: 6px; height: 6px; background: var(--state-listening); border-radius: 50%; }
.gallery-main { width: 100%; max-width: 1280px; margin-inline: auto; padding: var(--space-8) clamp(16px, 4vw, 64px) 96px; min-width: 0; }
.gallery-hero { padding-bottom: var(--space-8); }
.hero-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-8); }
.eyebrow { color: var(--gold-strong); font: 800 11px/18px var(--font-sans); letter-spacing: .16em; }
h1 { font: 700 clamp(34px, 4.5vw, 58px)/1.12 var(--font-display); letter-spacing: -.035em; margin: 0 0 var(--space-6); }
h1 em { color: var(--gold-strong); font-weight: 400; }
.hero-description { max-width: 57ch; color: var(--ink-muted); font-size: 17px; line-height: 27px; margin: 0; }
.hero-meta { display: flex; flex-wrap: wrap; gap: var(--space-4) var(--space-6); padding-block: var(--space-6); color: var(--ink-muted); font-size: 12px; }
.hero-meta > span { display: flex; align-items: center; gap: var(--space-2); }
.hero-meta svg { width: 14px; height: 14px; color: var(--gold-strong); }
.gallery-note { border-left: 2px solid var(--gold-strong); padding-left: var(--space-4); margin-bottom: var(--space-4); }
.gallery-note > span { font-size: 10px; font-weight: 800; letter-spacing: .1em; color: var(--gold-strong); }
.gallery-note p { color: var(--ink-muted); font-size: 13px; line-height: 20px; max-width: 70ch; margin: var(--space-1) 0 0; }
.specimen-label { display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--space-2) var(--space-4); margin: var(--space-8) 0 var(--space-4); }
.specimen-label h3 { font: 700 18px/24px var(--font-display); margin: 0; }
.specimen-label code { color: var(--ink-muted); font-size: 11px; }
.specimen-note { color: var(--ink-muted); font-size: 13px; }
.button-table { border-top: var(--border-thin) solid var(--line); }
.button-row, .button-table-head { display: grid; grid-template-columns: 80px 1.4fr 1fr 1.2fr; align-items: center; gap: var(--space-4); padding: var(--space-4) 0; border-bottom: var(--border-thin) solid var(--line); }
.button-table-head { color: var(--ink-muted); font-size: 12px; }
.button-row > .wl-btn { justify-self: start; }
.button-row > code { font-size: 12px; }
.inline-specimens { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); padding-block: var(--space-4); }
.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); }
.mic-specimens { display: flex; flex-wrap: wrap; gap: var(--space-8); padding: var(--space-6) var(--space-3); }
.interactive-mic { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-8); border: var(--border-thin) solid var(--line); border-radius: var(--radius-lg); padding: var(--space-6); margin-block: var(--space-4); }
.interactive-mic p { color: var(--ink-muted); font-size: 13px; }
.night-specimens { display: flex; flex-wrap: wrap; gap: var(--space-3); background: var(--night); border-radius: var(--radius-md); padding: var(--space-6); }
.preview-toolbar { display: flex; align-items: flex-end; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-4); }
.preview-toolbar > .wl-field { min-width: 200px; }
.dialogue-preview { background: var(--night); padding: var(--space-6); border-radius: var(--radius-lg); }
.bubble-preview { display: flex; flex-direction: column; gap: var(--space-4); padding: var(--space-6); background: var(--parchment-sunk); border-radius: var(--radius-lg); }
.disabled-composer { margin-top: var(--space-4); }
.conversation-specimens { background: var(--parchment-sunk); padding: var(--space-4); border-radius: var(--radius-lg); max-width: 440px; display: grid; gap: var(--space-2); }
.avatar-placeholder { text-align: center; display: grid; gap: var(--space-2); justify-items: center; transition: transform var(--duration-normal) var(--ease-standard); }
.avatar-orbit { display: grid; place-items: center; width: 130px; height: 130px; border: 1px solid var(--gold); border-radius: 50%; margin-bottom: var(--space-3); }
.avatar-orbit svg { width: 52px; height: 52px; color: var(--gold); }
.avatar-placeholder > span { font-size: 10px; letter-spacing: .2em; color: var(--gold); }
.avatar-placeholder small { color: var(--on-night-muted); }
.notice-specimens { display: grid; gap: var(--space-4); }
.gallery-footer { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); padding-top: var(--space-8); border-top: 1px solid var(--line); color: var(--ink-muted); font-size: 12px; }
.gallery-footer svg { color: var(--gold-strong); width: 16px; height: 16px; }
.gallery-footer a { margin-left: auto; color: var(--gold-strong); }
.event-log { position: fixed; bottom: 0; left: 240px; right: 0; z-index: 10; background: var(--parchment-raised); border-top: var(--border-thin) solid var(--line); padding: var(--space-3) var(--space-6); box-shadow: var(--shadow-card); font-size: 12px; }
.event-log summary { cursor: pointer; font-weight: 800; }
.event-log summary span { font-weight: 500; color: var(--ink-muted); display: inline-block; max-width: min(60vw, 760px); vertical-align: bottom; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-left: var(--space-4); }
.event-log ol { padding-left: var(--space-6); display: grid; gap: var(--space-2); max-height: 160px; overflow: auto; }
@media (max-width: 1100px) {
  .design-gallery { grid-template-columns: 200px minmax(0, 1fr); }
  .gallery-sidebar { padding: var(--space-4); }
  .event-log { left: 200px; }
  .button-row, .button-table-head { grid-template-columns: 64px 1fr 1fr; }
  .button-row > :last-child { grid-column: 2 / -1; }
  .button-table-head > :last-child { display: none; }
}
@media (max-width: 760px) {
  .design-gallery { display: block; }
  .gallery-sidebar { position: static; height: auto; border-right: 0; border-bottom: var(--border-thin) solid var(--line); gap: var(--space-3); }
  .gallery-brand { padding-block: 0; }
  .gallery-sidebar nav { display: flex; overflow-x: auto; padding-bottom: var(--space-2); }
  .gallery-sidebar nav a { white-space: nowrap; }
  .sidebar-caption, .sidebar-footer { display: none; }
  .gallery-main { padding: var(--space-6) var(--space-4) 100px; }
  .event-log { left: 0; padding: var(--space-3) var(--space-4); }
  .field-grid { grid-template-columns: 1fr; }
  .button-table-head { display: none; }
  .button-row { grid-template-columns: 1fr 1fr; gap: var(--space-3); }
  .button-row > code { grid-column: 1 / -1; }
  .button-row > :last-child { grid-column: auto; }
  .dialogue-preview { padding: var(--space-3); }
}
@media (max-width: 390px) { .button-row { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .avatar-placeholder { transition: none; } }
[data-reduced-motion='true'] .avatar-placeholder { transition: none; }
</style>
