# MicButton

Nút mic tròn hiển thị bốn trạng thái của vòng hội thoại giọng nói: `idle`, `listening`, `thinking`, `speaking`.

**Vue contract (F1B, đã implement):** `MicButton.vue` tại `src/features/voice/components/`. Props: `state`, `showLabel`, `label`, `disabled`. Emit: `toggle`; parent/coordinator quyết định nghe, dừng hoặc ngắt lời. Component không xin quyền mic.

- Vòng ngoài mang màu trạng thái: `state-listening` (sóng lan), `state-thinking` (vòng xoay), `state-speaking` (vòng tĩnh). Icon đổi sang sóng âm khi nhân vật đang nói.
- Nhãn chữ luôn có (hoặc `aria-label`) vì màu không đủ để phân biệt trạng thái.
- Nhấn khi `speaking` phát `toggle`; mục tiêu F1C là owner dừng playback và chuyển sang nghe. Đây là ngắt bằng control, chưa phải VAD/barge-in bằng giọng.
- Tôn trọng `prefers-reduced-motion`: tắt animation, giữ màu vòng.
