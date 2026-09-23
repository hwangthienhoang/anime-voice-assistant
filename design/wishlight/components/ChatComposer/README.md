# ChatComposer

Ô soạn tin ở cuối trang chat: textarea, MicButton và nút gửi.

**Vue contract (F1B, đã implement):** `ChatComposer.vue` tại `src/features/conversation/components/`. Props: `modelValue`, `placeholder`, `disabled`. Emits: `update:modelValue`, `send`, `mic`. Slot `mic` để view ghép MicButton từ voice feature; không import runtime hoặc component nội bộ feature khác.

- Enter phát `send`, Shift+Enter xuống dòng; không gửi khi IME đang composition. Owner nhận event và thực hiện gửi.
- Khi mic đang `listening`, chữ chép lời tạm hiện trong ô để người dùng thấy máy đang nghe gì.
