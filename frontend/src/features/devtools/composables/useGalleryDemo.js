import { computed, onScopeDispose, ref } from 'vue';

// Chỉ fixture cho gallery. Không import API, mic, audio hoặc renderer.
export function useGalleryDemo() {
  const preferences = ref({ theme: 'light', subtitles: true, reducedMotion: false, autoPlay: true, voice: 'hana', rate: 1 });
  const theme = computed(() => preferences.value.theme);
  const events = ref(['Gallery sẵn sàng. Mọi tương tác bên dưới dùng dữ liệu mẫu.']);
  function log(message) { events.value = [message, ...events.value].slice(0, 4); }
  const composerText = ref('');
  const messages = ref([
    { id: 'welcome', from: 'ai', name: 'Hana', text: 'Về rồi đó hả! Hôm nay mình đi đâu chơi nhỉ?', emotion: 'happy', time: '21:04', voice: { duration: 4 } },
    { id: 'reply', from: 'user', text: 'Hay là ngồi lại và kể cho nhau nghe chuyện hôm nay?', time: '21:05' },
  ]);
  const conversations = ref([
    { id: 'today', title: 'Một buổi tối dịu dàng', snippet: 'Hôm nay mình đi đâu chơi nhỉ?', time: '21:05' },
    { id: 'weekend', title: 'Kế hoạch cuối tuần', snippet: 'Một chuyến đi nhỏ, một câu chuyện mới.', time: 'Hôm qua' },
    { id: 'first', title: 'Lần đầu gặp gỡ', snippet: 'Chào bạn, mình là Hana.', time: '20/09' },
  ]);
  const currentId = ref('today');
  const chatState = ref('ready');
  const micState = ref('idle');
  const avatarStatus = ref('ready');
  const zoom = ref(1);
  const dialogue = 'Mỗi hành trình đều bắt đầu từ một lời chào. Hôm nay, mình rất vui vì có bạn ở đây.';
  const dialogueText = ref(dialogue);
  const dialogueDone = ref(true);
  const auto = ref(false);
  let typeTimer = null;
  let messageId = 0;
  function stopTyping() { clearInterval(typeTimer); typeTimer = null; }
  function reveal() { stopTyping(); dialogueText.value = dialogue; dialogueDone.value = true; }
  function typeDialogue() {
    stopTyping();
    if (preferences.value.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { reveal(); log('Hiện lời thoại ngay vì giảm chuyển động đang bật.'); return; }
    dialogueText.value = '';
    dialogueDone.value = false;
    let count = 0;
    typeTimer = setInterval(() => {
      dialogueText.value = dialogue.slice(0, ++count);
      if (count >= dialogue.length) reveal();
    }, 35);
    log('Đang chạy typewriter mẫu; click vào lời thoại để hiện hết.');
  }
  function send(text) {
    if (!text.trim()) return;
    if (chatState.value === 'empty') messages.value = [];
    chatState.value = 'ready';
    messages.value.push({ id: `sample-${++messageId}`, from: 'user', text, time: 'Vừa xong' });
    composerText.value = '';
    log('Đã thêm tin nhắn mẫu vào preview, không gửi lên server.');
  }
  function selectConversation(id) {
    currentId.value = id;
    composerText.value = '';
    chatState.value = 'ready';
    messages.value = [{ id: `thread-${id}`, from: 'ai', name: 'Hana', text: id === 'today' ? dialogue : id === 'weekend' ? 'Cuối tuần này, cùng lên kế hoạch cho một chuyến đi nhé.' : 'Chào bạn, mình là Hana. Rất vui được gặp bạn!', emotion: 'relaxed', time: '21:04' }];
    log(`Đã chọn conversation mẫu: ${conversations.value.find(item => item.id === id)?.title}.`);
  }
  function cycleMic() {
    const states = ['idle', 'listening', 'thinking', 'speaking'];
    micState.value = states[(states.indexOf(micState.value) + 1) % states.length];
    log(`Mic preview: ${micState.value}. Không truy cập microphone.`);
  }
  onScopeDispose(stopTyping);
  return { preferences, theme, events, log, composerText, messages, conversations, currentId, chatState, micState, avatarStatus, zoom, dialogueText, dialogueDone, auto, reveal, typeDialogue, send, selectConversation, cycleMic };
}
