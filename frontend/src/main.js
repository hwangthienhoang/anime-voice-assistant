import './style.css';
import { VRMAvatar } from './avatar/VRMAvatar.js';
import { AudioPlayer } from './audio/AudioPlayer.js';
import { SpeechInput } from './audio/SpeechInput.js';
import { chat, speak } from './api.js';
import { DemoSequence } from './avatar/DemoSequence.js';

const DEFAULT_MODEL_URL = '/models/avatar.vrm';
const SPEECH_LANG = 'vi-VN';

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const canvas = $('avatar');
const logEl = $('log');
const statusEl = $('status');
const micBtn = $('mic');
const zoomInBtn = $('zoom-in');
const zoomOutBtn = $('zoom-out');
const form = $('form');
const input = $('input');
const notice = $('model-notice');

// ---------- Khởi tạo các khối ----------
const avatar = new VRMAvatar(canvas);
if (import.meta.env.DEV) window.__avatar = avatar; // chỉ để debug khi dev
const player = new AudioPlayer();
const history = []; // [{role, content}]
let busy = false;
let resetEmotionTimer = null;
let interimEl = null;

const speech = new SpeechInput({
  lang: SPEECH_LANG,
  onFinal: (text) => handleUserText(text),
  onInterim: (text) => showInterim(text),
  onStateChange: (active) => {
    micBtn.setAttribute('aria-pressed', String(active));
    micBtn.setAttribute('aria-label', active ? 'Tắt micro' : 'Bật micro');
    if (!busy) setStatus(active ? 'Đang nghe…' : 'Sẵn sàng');
  },
  onError: (message) => addMessage('error', message),
});

// ---------- Giao diện ----------
function setStatus(text) {
  statusEl.textContent = text;
}

function addMessage(kind, text) {
  const li = document.createElement('li');
  li.className = `msg ${kind}`;
  li.textContent = text;
  logEl.appendChild(li);
  logEl.scrollTop = logEl.scrollHeight;
  return li;
}

function showInterim(text) {
  if (!interimEl) interimEl = addMessage('user interim', text);
  interimEl.textContent = text;
  logEl.scrollTop = logEl.scrollHeight;
}

function clearInterim() {
  interimEl?.remove();
  interimEl = null;
}

// ---------- Luồng hội thoại ----------
async function handleUserText(rawText) {
  const text = rawText.trim();
  if (!text || busy) return;

  busy = true;
  clearTimeout(resetEmotionTimer);
  player.stop();
  speech.pause(); // tránh micro thu lại giọng của avatar
  clearInterim();

  addMessage('user', text);
  history.push({ role: 'user', content: text });

  try {
    setStatus('Đang suy nghĩ…');
    avatar.playGesture('think');
    const { reply, emotion } = await chat(history);
    history.push({ role: 'assistant', content: reply });
    addMessage('assistant', reply);
    avatar.setEmotion(emotion);

    setStatus('Đang nói… (nhấn Esc để dừng)');
    try {
      const audio = await speak(reply);
      await player.play(audio);
    } catch (err) {
      addMessage('error', `Không phát được giọng nói: ${err.message}`);
    }
  } catch (err) {
    history.pop(); // bỏ tin nhắn vừa gửi để lịch sử không bị lệch lượt
    addMessage('error', err.message);
  } finally {
    busy = false;
    resetEmotionTimer = setTimeout(() => avatar.setEmotion('neutral'), 1200);
    setStatus(speech.enabled ? 'Đang nghe…' : 'Sẵn sàng');
    speech.resume();
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value;
  input.value = '';
  handleUserText(text);
});

micBtn.addEventListener('click', () => {
  if (speech.enabled) speech.stop();
  else speech.start();
});

zoomInBtn.addEventListener('click', () => avatar.zoomStep(1));
zoomOutBtn.addEventListener('click', () => avatar.zoomStep(-1));

if (!SpeechInput.supported) {
  micBtn.disabled = true;
  micBtn.title = 'Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge.';
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && player.playing) player.stop();
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
    addMessage('assistant', label);
  },
  onEnd: () => {
    demoAutoBtn.textContent = '▶ Auto (chuỗi ~21s)';
    setStatus('Sẵn sàng');
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
  demoToggle.textContent = show ? 'Ẩn demo ▴' : 'Xem demo ▾';
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
  demoToggle.textContent = 'Ẩn demo ▴';
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
    setStatus(speech.enabled ? 'Đang nghe…' : 'Sẵn sàng');
    return true;
  } catch (err) {
    console.warn('Không tải được model VRM:', err);
    if (!quiet) addMessage('error', `Không tải được nhân vật: ${err.message}`);
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
