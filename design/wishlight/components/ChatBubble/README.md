# ChatBubble

Bong bóng tin nhắn cho trang chat chi tiết, phân biệt nhân vật (`ai`) và người dùng (`user`).

**Vue contract (F1B, đã implement):** `ChatBubble.vue` tại `src/features/conversation/components/`. Props: `from` (`ai` | `user`), `text`, `name`, `time`, `emotion`, `voice` (metadata thời lượng, không chứa player), `typing`. Emit: `play`; owner thực hiện playback. Render text bằng interpolation.

- Nhân vật: nền `parchment-raised`, bên trái, góc trên trái vuông. Người dùng: nền `action`, bên phải.
- Tin nhắn gửi bằng giọng nói vẫn hiện bản chép lời; nút phát lại nằm dưới bong bóng.
- Gộp các tin liền nhau cùng người gửi, cách `space-2`; giữa các nhóm cách `space-4`.
