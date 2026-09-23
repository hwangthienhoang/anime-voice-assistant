# ChatPage

Trang chat chi tiết (mở từ nút LOG của khung thoại): sidebar lịch sử bên trái, luồng tin nhắn và ô soạn bên phải.

Ghép từ ConversationItem, ChatBubble, ChatComposer và Button. Sidebar rộng 240px trên nền `parchment-sunk`; luồng tin trên `parchment`, lề `space-6`. Nút "Về sân khấu" quay lại màn hình nhân vật 3D. Dưới 900px viewport, sidebar thu gọn và mở bằng nút danh sách.

**Vue mapping (F1B):** `frontend/src/views/ChatView.vue`, named route `chat` (`/chat`). Hiện `/chat` chỉ là placeholder. Bố cục được tách thành `features/conversation/components/ChatPanel.vue` đã hoạt động trong dev gallery. Ghép conversation components và MicButton ở cấp view; LOG dùng router, không đổi màn hình bằng DOM class toggle. Conversation state dùng chung với StageView sẽ do app coordinator sở hữu.
