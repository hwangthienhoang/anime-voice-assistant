Nút mic tròn hiển thị bốn trạng thái của vòng hội thoại giọng nói: `idle`, `listening`, `thinking`, `speaking`.

**Consumer cung cấp:** `state`, `onClick`, `showLabel` (hiện nhãn trạng thái bên dưới), `label` (ghi đè nhãn).

- Vòng ngoài mang màu trạng thái: `state-listening` (sóng lan), `state-thinking` (vòng xoay), `state-speaking` (vòng tĩnh). Icon đổi sang sóng âm khi nhân vật đang nói.
- Nhãn chữ luôn có (hoặc `aria-label`) vì màu không đủ để phân biệt trạng thái.
- Nhấn khi `speaking` = ngắt lời (barge-in) và chuyển sang `listening`.
- Tôn trọng `prefers-reduced-motion`: tắt animation, giữ màu vòng.
