# ConversationItem

Một dòng trong danh sách cuộc trò chuyện ở sidebar trang chat.

**Vue contract (F1B, đã implement):** `ConversationItem.vue` tại `src/features/conversation/components/`. Props: `title`, `snippet`, `time`, `current`. Emit: `select`; owner chọn conversation.

- Dòng đang mở: nền `parchment-raised` và `shadow-card`.
- Tiêu đề tự sinh từ nội dung (LLM tóm tắt) và cho phép đổi tên.
