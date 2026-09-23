# DialogueBox

Khung thoại kiểu visual novel đặt ở cạnh dưới sân khấu 3D, hiện lời nhân vật đang nói.

**Vue contract (F1B, đã implement):** `DialogueBox.vue` tại `src/features/conversation/components/`. Props: `speaker`, `text` (phần chữ đang hiện), `done`, `emotion`, `subtitle`, `auto`. Emits: `toggle-auto`, `log`, `skip`, `reveal`. Typewriter và playback thuộc owner/composable; component không tự điều khiển audio hoặc router.

- Nền `night-glass` trên cảnh 3D, tên người nói kiểu `speaker` màu `gold`, lời thoại kiểu `dialogue` màu `on-night`.
- Chiều rộng tối đa 880px, căn giữa, cách đáy màn hình `space-6`.
- Nút LOG luôn mở ChatPage: khung thoại chỉ hiện câu hiện tại, lịch sử đầy đủ nằm ở trang chat.
- Chữ chạy đồng bộ với audio TTS; khi người dùng click trước khi xong thì hiện hết câu ngay.
