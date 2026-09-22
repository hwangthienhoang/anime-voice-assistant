import './styles/tokens.css';
import './styles/components.css';
import './style.css';
import { VRMAvatar } from './avatar/VRMAvatar.js';
import { AudioPlayer } from './audio/AudioPlayer.js';
import { SpeechInput } from './audio/SpeechInput.js';
import { chat, speak } from './api.js';
import { DemoSequence } from './avatar/DemoSequence.js';

const DEFAULT_MODEL_URL = '/models/avatar.vrm';
const SPEECH_LANG = 'vi-VN';
const SPEAKER_NAME = 'Hana';
const CONVERSATION_TITLE = 'Trò chuyện với Hana';
const DIALOGUE_HIDE_MS = 6000;
const CHAT_PAGE_WIDE_QUERY = '(min-width: 1200px)';
const SIDEBAR_DRAWER_QUERY = '(max-width: 720px)';
const EMOTION_LABEL = {
  neutral: 'Bình thường',
  happy: 'Vui',
  relaxed: 'Thư thái',
  sad: 'Buồn',
  surprised: 'Ngạc nhiên',
  angry: 'Dỗi',
};
const MIC_LABEL = { idle: 'Nhấn để nói', listening: 'Đang nghe…', thinking: 'Đang nghĩ…', speaking: 'Đang nói' };
const MIC_PATH = 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3';
const WAVE_PATH = 'M4 12h1M8 8v8M12 5v14M16 8v8M20 12h0';
const STAR_PATH =
  'M12 2 C12.6 8 16 11.4 22 12 C16 12.6 12.6 16 12 22 C11.4 16 8 12.6 2 12 C8 11.4 11.4 8 12 2 Z';
const PLAY_PATH = 'M8 5v14l11-7L8 5Z';

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const canvas = $('avatar');
const zoomInBtn = $('zoom-in');
const zoomOutBtn = $('zoom-out');
const input = $('input');
const sendBtn = $('send-btn');
const notice = $('model-notice');

const chatpageEl = $('chatpage');
const chatCloseBtn = $('chatpage-close');
const sidebarToggleBtn = $('sidebar-toggle');
const convListEl = $('conversation-list');
const threadEl = $('thread');
const composerMicBtn = $('composer-mic');

const dlgBox = $('dialogue-box');
const dlgNameEl = $('dlg-name');
const dlgTextEl = $('dlg-text');
const dlgEmotionEl = $('dlg-emotion');
const dlgEmotionDotEl = dlgEmotionEl.querySelector('.wl-emo-dot');
const dlgEmotionLabelEl = $('dlg-emotion-label');
const dlgAutoBtn = $('dlg-auto');
const dlgLogBtn = $('dlg-log');
const dlgSkipBtn = $('dlg-skip');
dlgNameEl.textContent = SPEAKER_NAME;

const micBtn = $('mic');
const micLabelEl = $('mic-label');
const micButtons = [micBtn, composerMicBtn];

// ---------- Khởi tạo các khối ----------
const avatar = new VRMAvatar(canvas);
if (import.meta.env.DEV) window.__avatar = avatar; // chỉ để debug khi dev
const player = new AudioPlayer();
const replayPlayer = new AudioPlayer(); // phát lại giọng TTS đã lưu, tách khỏi player điều khiển khẩu hình
const history = []; // [{role, content}]
let busy = false;
let resetEmotionTimer = null;
let interimBubbleEl = null;
let typingBubbleEl = null;

const speech = new SpeechInput({
  lang: SPEECH_LANG,
  onFinal: (text) => handleUserText(text),
  onInterim: (text) => showInterim(text),
  onStateChange: (active) => {
    dlgAutoBtn.setAttribute('aria-pressed', String(active));
    if (!busy) setMicState(active ? 'listening' : 'idle');
  },
  onError: (message) => appendError(message),
});

// ---------- Helpers ----------
function formatTime(date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(sec) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function svgIcon(path, { fill = true } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  if (fill) {
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('stroke', 'none');
  } else {
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
  }
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', path);
  svg.appendChild(p);
  return svg;
}

function buildEmotionTagEl(emotion) {
  const span = document.createElement('span');
  span.className = 'wl-emo';
  const dot = document.createElement('span');
  dot.className = 'wl-emo-dot';
  dot.style.background = `var(--emo-${emotion})`;
  span.appendChild(dot);
  span.appendChild(document.createTextNode(EMOTION_LABEL[emotion] ?? emotion));
  return span;
}

// ---------- MicButton ----------
let micState = 'idle';

function setMicState(state) {
  micState = state;
  for (const btn of micButtons) {
    btn.className = `wl-mic wl-mic-${state}`;
    btn.setAttribute('aria-pressed', String(state === 'listening'));
    btn.setAttribute('aria-label', MIC_LABEL[state]);
    btn.querySelector('path').setAttribute('d', state === 'speaking' ? WAVE_PATH : MIC_PATH);
  }
  micLabelEl.textContent = MIC_LABEL[state];
}

/** Chữ trạng thái chung, không thuộc bốn trạng thái mic (tải model, demo…). */
function setStatus(text) {
  micLabelEl.textContent = text;
}

function handleMicClick() {
  if (micState === 'speaking') {
    // Ngắt lời: dừng audio đang phát rồi bắt đầu nghe ngay
    player.stop();
    speech.start();
    return;
  }
  if (speech.enabled) speech.stop();
  else speech.start();
}

micBtn.addEventListener('click', handleMicClick);
composerMicBtn.addEventListener('click', handleMicClick);

if (!SpeechInput.supported) {
  micBtn.disabled = true;
  micBtn.title = 'Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge.';
  composerMicBtn.disabled = true;
  composerMicBtn.title = micBtn.title;
}

// ---------- DialogueBox ----------
let dlgTypeTimer = null;
let dlgHideTimer = null;
let dlgFullText = '';
let dlgCaretEl = null;

function setDialogueEmotion(emotion) {
  if (!emotion || emotion === 'neutral') {
    dlgEmotionEl.hidden = true;
    return;
  }
  dlgEmotionEl.hidden = false;
  dlgEmotionDotEl.style.background = `var(--emo-${emotion})`;
  dlgEmotionLabelEl.textContent = EMOTION_LABEL[emotion] ?? emotion;
}

function setDialogueDone(done) {
  if (!done) {
    dlgCaretEl?.remove();
    return;
  }
  if (!dlgCaretEl) {
    dlgCaretEl = svgIcon(STAR_PATH);
    dlgCaretEl.classList.add('wl-dlg-caret');
  }
  dlgTextEl.appendChild(dlgCaretEl);
}

/** Hiện lời thoại, chữ chạy từng ký tự trong khoảng `durationSec` (thời lượng audio TTS). */
function showDialogue(text, emotion, durationSec) {
  clearTimeout(dlgTypeTimer);
  clearTimeout(dlgHideTimer);
  dlgBox.hidden = false;
  dlgFullText = text;
  setDialogueEmotion(emotion);
  setDialogueDone(false);

  const chars = Array.from(text);
  dlgTextEl.textContent = '';
  const totalMs = Math.max(400, (durationSec || chars.length * 0.05) * 1000);
  const stepMs = totalMs / Math.max(1, chars.length);
  let i = 0;
  const tick = () => {
    i += 1;
    dlgTextEl.textContent = chars.slice(0, i).join('');
    if (i >= chars.length) {
      setDialogueDone(true);
      return;
    }
    dlgTypeTimer = setTimeout(tick, stepMs);
  };
  tick();
}

function revealDialogueNow() {
  clearTimeout(dlgTypeTimer);
  if (!dlgFullText) return;
  dlgTextEl.textContent = dlgFullText;
  setDialogueDone(true);
}

function scheduleDialogueHide() {
  clearTimeout(dlgHideTimer);
  dlgHideTimer = setTimeout(() => {
    dlgBox.hidden = true;
  }, DIALOGUE_HIDE_MS);
}

dlgBox.querySelector('.wl-dlg-ctrls').addEventListener('click', (e) => e.stopPropagation());
dlgBox.addEventListener('click', () => revealDialogueNow());
dlgSkipBtn.addEventListener('click', () => player.stop());
dlgAutoBtn.addEventListener('click', () => handleMicClick());
dlgLogBtn.addEventListener('click', () => openChatPage());

// ---------- ChatPage ----------
const chatWideMql = window.matchMedia(CHAT_PAGE_WIDE_QUERY);
const sidebarDrawerMql = window.matchMedia(SIDEBAR_DRAWER_QUERY);

function openChatPage() {
  chatpageEl.classList.add('chatpage-open');
  input.focus();
}

function closeChatPage() {
  chatpageEl.classList.remove('chatpage-open');
  chatpageEl.classList.remove('sidebar-open');
  sidebarToggleBtn.setAttribute('aria-expanded', 'false');
}

function toggleChatPage() {
  if (chatpageEl.classList.contains('chatpage-open')) closeChatPage();
  else openChatPage();
}

chatCloseBtn.addEventListener('click', () => closeChatPage());

sidebarToggleBtn.addEventListener('click', () => {
  const open = chatpageEl.classList.toggle('sidebar-open');
  sidebarToggleBtn.setAttribute('aria-expanded', String(open));
});

document.querySelector('.stage').addEventListener('click', () => {
  if (!chatWideMql.matches && chatpageEl.classList.contains('chatpage-open')) closeChatPage();
});

// ---------- Sidebar: một cuộc trò chuyện duy nhất ----------
const convItemEl = document.createElement('button');
convItemEl.type = 'button';
convItemEl.className = 'wl-conv';
convItemEl.setAttribute('aria-current', 'true');
convItemEl.appendChild(svgIcon(STAR_PATH)).classList.add('wl-conv-star');
const convMainEl = document.createElement('span');
convMainEl.className = 'wl-conv-main';
const convTitleEl = document.createElement('span');
convTitleEl.className = 'wl-conv-title';
const convTitleTextEl = document.createElement('span');
convTitleTextEl.textContent = CONVERSATION_TITLE;
const convTimeEl = document.createElement('span');
convTimeEl.className = 'wl-conv-time';
convTitleEl.append(convTitleTextEl, convTimeEl);
const convSnipEl = document.createElement('span');
convSnipEl.className = 'wl-conv-snip';
convSnipEl.style.display = 'block';
convSnipEl.textContent = 'Chưa có tin nhắn nào';
convMainEl.append(convTitleEl, convSnipEl);
convItemEl.appendChild(convMainEl);
convItemEl.addEventListener('click', () => {
  if (sidebarDrawerMql.matches) {
    chatpageEl.classList.remove('sidebar-open');
    sidebarToggleBtn.setAttribute('aria-expanded', 'false');
  }
  input.focus();
});
convListEl.appendChild(convItemEl);

function updateConversationPreview(text) {
  convSnipEl.textContent = text;
  convTimeEl.textContent = formatTime(new Date());
}

// ---------- ChatBubble / luồng tin ----------
function appendBubble({ from, text, emotion, typing = false }) {
  const el = document.createElement('div');
  el.className = `wl-msg wl-msg-${from}`;

  const meta = document.createElement('div');
  meta.className = 'wl-msg-meta';
  if (from === 'ai') {
    const nameEl = document.createElement('span');
    nameEl.className = 'wl-msg-name';
    nameEl.textContent = SPEAKER_NAME;
    meta.appendChild(nameEl);
  }
  if (emotion && emotion !== 'neutral') meta.appendChild(buildEmotionTagEl(emotion));
  if (!typing) {
    const timeEl = document.createElement('span');
    timeEl.textContent = formatTime(new Date());
    meta.appendChild(timeEl);
  }
  if (meta.childNodes.length) el.appendChild(meta);

  if (typing) {
    const body = document.createElement('div');
    body.className = 'wl-msg-body';
    body.setAttribute('aria-label', 'Đang soạn');
    const typingEl = document.createElement('span');
    typingEl.className = 'wl-typing';
    typingEl.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
    body.appendChild(typingEl);
    el.appendChild(body);
  } else {
    const body = document.createElement('p');
    body.className = 'wl-msg-body';
    body.textContent = text;
    el.appendChild(body);
  }

  threadEl.appendChild(el);
  threadEl.scrollTop = threadEl.scrollHeight;
  return el;
}

function attachVoiceReplay(bubbleEl, arrayBuffer, durationSec) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'wl-voice';
  btn.appendChild(svgIcon(PLAY_PATH));
  btn.appendChild(document.createTextNode(`Phát lại · ${formatDuration(durationSec)}`));
  btn.addEventListener('click', () => replayPlayer.play(arrayBuffer.slice(0)));
  bubbleEl.appendChild(btn);
}

function showInterim(text) {
  if (!interimBubbleEl) {
    interimBubbleEl = document.createElement('div');
    interimBubbleEl.className = 'wl-msg wl-msg-user wl-msg-interim';
    const body = document.createElement('p');
    body.className = 'wl-msg-body';
    interimBubbleEl.appendChild(body);
    threadEl.appendChild(interimBubbleEl);
  }
  interimBubbleEl.querySelector('.wl-msg-body').textContent = text;
  threadEl.scrollTop = threadEl.scrollHeight;
}

function clearInterim() {
  interimBubbleEl?.remove();
  interimBubbleEl = null;
}

function appendError(text) {
  const p = document.createElement('p');
  p.className = 'chat-error';
  p.textContent = `Lỗi: ${text}`;
  threadEl.appendChild(p);
  threadEl.scrollTop = threadEl.scrollHeight;
}

// ---------- Luồng hội thoại ----------
async function handleUserText(rawText) {
  const text = rawText.trim();
  if (!text || busy) return;

  busy = true;
  clearTimeout(resetEmotionTimer);
  clearTimeout(dlgHideTimer);
  player.stop();
  speech.pause(); // tránh micro thu lại giọng của avatar
  clearInterim();

  appendBubble({ from: 'user', text });
  updateConversationPreview(text);
  history.push({ role: 'user', content: text });
  typingBubbleEl = appendBubble({ from: 'ai', typing: true });

  try {
    setMicState('thinking');
    avatar.playGesture('think');
    const { reply, emotion } = await chat(history);
    history.push({ role: 'assistant', content: reply });

    typingBubbleEl?.remove();
    typingBubbleEl = null;
    const bubbleEl = appendBubble({ from: 'ai', text: reply, emotion });
    updateConversationPreview(reply);
    avatar.setEmotion(emotion);

    setMicState('speaking');
    try {
      const audio = await speak(reply);
      const audioForReplay = audio.slice(0);
      await player.play(audio, {
        onDecoded: (duration) => {
          showDialogue(reply, emotion, duration);
          attachVoiceReplay(bubbleEl, audioForReplay, duration);
        },
      });
    } catch (err) {
      showDialogue(reply, emotion);
      appendError(`Không phát được giọng nói: ${err.message}`);
    }
    revealDialogueNow();
    scheduleDialogueHide();
  } catch (err) {
    typingBubbleEl?.remove();
    typingBubbleEl = null;
    history.pop(); // bỏ tin nhắn vừa gửi để lịch sử không bị lệch lượt
    appendError(err.message);
  } finally {
    busy = false;
    resetEmotionTimer = setTimeout(() => avatar.setEmotion('neutral'), 1200);
    setMicState(speech.enabled ? 'listening' : 'idle');
    speech.resume();
  }
}

function submitComposer() {
  const text = input.value;
  input.value = '';
  handleUserText(text);
}

sendBtn.addEventListener('click', submitComposer);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitComposer();
  }
});

zoomInBtn.addEventListener('click', () => avatar.zoomStep(1));
zoomOutBtn.addEventListener('click', () => avatar.zoomStep(-1));

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (player.playing) {
      player.stop();
      return;
    }
    if (chatpageEl.classList.contains('chatpage-open')) closeChatPage();
    return;
  }
  const target = e.target;
  const isTypingTarget = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';
  if (!isTypingTarget && e.key.toLowerCase() === 'l') toggleChatPage();
});

// ---------- Avatar ----------
// Menu demo chuyển động (không cần backend): nút "Xem demo" mở/ẩn bảng bên dưới, gồm
// một nút "Auto" chạy trọn chuỗi DEMO_STEPS (~21s) và các nút hành động riêng lẻ (cảm
// xúc/cử chỉ/giả lập nói) để bấm thử từng cái một, thêm ?demo vào URL để tự chạy Auto.
const demoToggle = $('demo-toggle');
const demoPanel = $('demo-panel');
const demoAutoBtn = $('demo-auto');
const demoTalkBtn = $('demo-talk');
const demoIdleBtn = $('demo-idle');

let fakeTalking = false;
let fakeTalkT0 = 0;

const demo = new DemoSequence(avatar, {
  onStep: (label) => {
    setStatus(`Demo: ${label}`);
    appendBubble({ from: 'ai', text: label });
    updateConversationPreview(label);
  },
  onEnd: () => {
    demoAutoBtn.textContent = '▶ Auto (chuỗi ~21s)';
    setMicState(speech.enabled ? 'listening' : 'idle');
  },
});

function setFakeTalking(on) {
  fakeTalking = on;
  fakeTalkT0 = performance.now() / 1000;
  demoTalkBtn.textContent = on ? '■ Dừng giả lập nói' : 'Giả lập đang nói';
  demoTalkBtn.setAttribute('aria-pressed', String(on));
}

/** Mô phỏng biên độ "ba-ba" giống lúc nói thật, dùng khi bấm "Giả lập đang nói". */
function fakeTalkLevel() {
  const local = performance.now() / 1000 - fakeTalkT0;
  const syllable = Math.abs(Math.sin(local * Math.PI * 3.4));
  const phrase = 0.65 + 0.35 * Math.sin(local * 1.9);
  const pause = Math.sin(local * 0.9 + 1) > -0.85 ? 1 : 0.15;
  return Math.min(1, 0.12 + 0.75 * syllable * phrase) * pause;
}

/** Dừng auto-demo/giả lập nói trước khi chạy một hành động riêng lẻ, để nút vừa bấm có hiệu lực ngay. */
function resetDemoState() {
  if (demo.running) demo.stop();
  if (fakeTalking) setFakeTalking(false);
}

demoToggle.addEventListener('click', () => {
  const show = demoPanel.hidden;
  demoPanel.hidden = !show;
  demoToggle.setAttribute('aria-expanded', String(show));
  demoToggle.textContent = show ? 'Ẩn demo' : 'Xem demo';
});

demoAutoBtn.addEventListener('click', () => {
  if (demo.running) return demo.stop();
  if (fakeTalking) setFakeTalking(false);
  demo.start();
  demoAutoBtn.textContent = '■ Dừng demo';
});

demoTalkBtn.addEventListener('click', () => {
  if (demo.running) demo.stop();
  setFakeTalking(!fakeTalking);
});

demoIdleBtn.addEventListener('click', () => {
  resetDemoState();
  avatar.setEmotion('neutral', { gesture: false });
  avatar.animations.stopGesture();
});

demoPanel.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-emotion], button[data-gesture]');
  if (!btn) return;
  resetDemoState();
  if (btn.dataset.emotion) avatar.setEmotion(btn.dataset.emotion);
  if (btn.dataset.gesture) avatar.playGesture(btn.dataset.gesture);
});

if (new URLSearchParams(location.search).has('demo')) {
  demoPanel.hidden = false;
  demoToggle.setAttribute('aria-expanded', 'true');
  demoToggle.textContent = 'Ẩn demo';
  setTimeout(() => demoAutoBtn.click(), 1500);
}

avatar.onBeforeUpdate = () => {
  const demoMouth = demo.tick();
  const level = demoMouth ?? (fakeTalking ? fakeTalkLevel() : player.level);
  avatar.setMouth(level * 1.1);
  document.documentElement.style.setProperty('--level', level.toFixed(3));
};
avatar.start();

async function loadModel(url, { quiet = false } = {}) {
  try {
    setStatus('Đang tải nhân vật…');
    await avatar.load(url);
    notice.hidden = true;
    setMicState(speech.enabled ? 'listening' : 'idle');
    return true;
  } catch (err) {
    console.warn('Không tải được model VRM:', err);
    if (!quiet) appendError(`Không tải được nhân vật: ${err.message}`);
    setStatus('Chưa có nhân vật');
    return false;
  }
}

async function loadFromFile(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const ok = await loadModel(url);
  URL.revokeObjectURL(url);
  if (ok) notice.hidden = true;
}

for (const id of ['vrm-file', 'vrm-file-2']) {
  $(id).addEventListener('change', (e) => loadFromFile(e.target.files[0]));
}

// Thử tải model mặc định; nếu chưa có thì hiện hướng dẫn chọn file
loadModel(DEFAULT_MODEL_URL, { quiet: true }).then((ok) => {
  notice.hidden = ok;
});
