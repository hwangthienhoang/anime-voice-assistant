# Danh sách tính năng

Backlog tính năng của anime-voice-assistant, chốt trong buổi brainstorm thiết kế (09/2026). Dùng cùng:

- `docs/ROADMAP.md`: lộ trình kỹ thuật theo giai đoạn (cột **Giai đoạn** bên dưới trỏ về đó).
- `design/wishlight/`: design system Wishlight. Cột **UI** là tên component trong đó; bắt đầu từ `design/wishlight/IMPLEMENTATION.md`.

**Cách dùng:** mỗi lần làm, chọn một dòng `[ ]`, implement, rồi đổi thành `[x]` và ghi chú ngắn nếu cần. Trạng thái: `[x]` xong, `[~]` đang làm / làm một phần, `[ ]` chưa làm.
Ưu tiên: **P0** bản MVP có giao diện Wishlight · **P1** bản tiếp theo · **P2** để sau.

## Quyết định đã chốt

- Phong cách UI: Wishlight, kiểu phiêu lưu kỳ ảo (giấy da kem, xanh navy đêm, viền vàng, ngôi sao 4 cánh). Lấy cảm hứng thể loại game, không dùng logo, font, icon hay giao diện gốc của game thương mại nào.
- Có **khung thoại** kiểu visual novel trên sân khấu cho câu đang nói, VÀ một **trang chat chi tiết** riêng cho toàn bộ lịch sử (mở bằng nút LOG).
- Bộ cảm xúc thống nhất: `neutral`, `happy`, `relaxed`, `sad`, `surprised`, `angry`, dùng chung cho thẻ LLM, preset VRM và EmotionTag.
- Trạng thái giọng nói luôn hiển thị: `idle → listening → thinking → speaking`.
- Frontend giữ Vite + JS thuần; component Wishlight được port thành DOM helper, không thêm React.

## 1. Nhân vật (VRM)

| | Tính năng | Ưu tiên | Giai đoạn | UI | Ghi chú |
|---|---|---|---|---|---|
| [x] | Biểu cảm theo thẻ cảm xúc | P0 | 1 | EmotionTag | `avatar.setEmotion()` |
| [x] | Chớp mắt, thở, idle | P0 | 1 | | `IdleMotion.js` |
| [x] | Nhìn theo chuột | P0 | 1 | | |
| [~] | Lip-sync | P0 | 1 → 4 | | Đang theo biên độ âm lượng; nâng lên viseme ở giai đoạn 4 |
| [~] | Cử chỉ theo ngữ cảnh (gật, lắc, suy nghĩ, vẫy tay) | P1 | 4 | | Có nod/shake/think qua VRMA; thiếu vẫy tay chào, nghiêng đầu |
| [x] | Nạp / đổi file VRM | P0 | 1 | Button | Cần restyle theo Wishlight |
| [ ] | Tương tác chạm: click đầu/tay thì nhân vật phản ứng | P1 | 4 | | Raycast lên xương đầu/tay |
| [ ] | Ánh mắt: saccade, nhìn camera khi nói | P1 | 4 | | |
| [ ] | Wardrobe: đổi trang phục, background | P2 | 4 | cần design | |
| [ ] | Desktop mascot: cửa sổ trong suốt | P2 | 6 | cần design | Tauri/Electron |

## 2. Hội thoại (text + voice)

| | Tính năng | Ưu tiên | Giai đoạn | UI | Ghi chú |
|---|---|---|---|---|---|
| [x] | Chat text | P0 | 1 | ChatBubble, ChatComposer | Cần chuyển sang giao diện Wishlight |
| [x] | Voice qua Web Speech API | P0 | 1 | MicButton | |
| [ ] | MicButton 4 trạng thái | P0 | 1 | MicButton | Map trạng thái trong `IMPLEMENTATION.md` bước 2 |
| [ ] | Khung thoại trên sân khấu (AUTO / LOG / SKIP) | P0 | 1 | DialogueBox | Chữ chạy theo thời lượng TTS |
| [ ] | Trang chat chi tiết | P0 | 1 | ChatPage | Panel hiện tại chuyển thành view riêng |
| [~] | Dừng nhân vật đang nói | P0 | 1 → 3 | MicButton, DialogueBox | Đang có phím Esc; thêm SKIP và nhấn mic khi đang nói |
| [ ] | Phát lại giọng từng tin nhắn | P1 | 1 | ChatBubble (`voice`) | Lưu blob audio TTS |
| [ ] | Streaming câu trả lời + TTS theo câu | P1 | 2 | DialogueBox | Mục tiêu độ trễ dưới 1,5 giây |
| [ ] | Chế độ rảnh tay (VAD) + ngắt lời bằng giọng | P1 | 3 | Toggle, MicButton | `@ricky0123/vad-web` |
| [ ] | Phụ đề song ngữ | P1 | 2 | DialogueBox (`subtitle`), Toggle | |
| [ ] | Chọn giọng TTS, tốc độ, cao độ | P1 | 2 | Toggle, cần design Slider/Select | |
| [ ] | Call mode toàn màn hình | P2 | 3 | cần design | |

## 3. Tính cách & trí nhớ

| | Tính năng | Ưu tiên | Giai đoạn | UI | Ghi chú |
|---|---|---|---|---|---|
| [~] | Persona (tính cách, xưng hô, câu cửa miệng) | P0 | 1 | | Đang ở `backend/prompts/persona.md` |
| [ ] | Persona editor trên giao diện | P1 | 5 | cần design | Tên, xưng hô, tính cách, giọng |
| [ ] | Lưu lịch sử nhiều cuộc trò chuyện | P1 | 5 | ConversationItem | localStorage trước, backend sau |
| [ ] | Trí nhớ dài hạn (tên, sở thích, chuyện đã kể) | P1 | 5 | cần design | Trang "Điều mình nhớ về bạn", cho xem/xóa |
| [ ] | Chỉ số thân thiết, mở khóa lời thoại | P2 | 5 | cần design | |
| [ ] | Mood của nhân vật trong ngày | P2 | 5 | EmotionTag | |
| [ ] | Nhiều nhân vật | P2 | 5 | cần design | Mỗi nhân vật: persona + VRM + giọng |

## 4. Chủ động & tiện ích

| | Tính năng | Ưu tiên | Giai đoạn | UI | Ghi chú |
|---|---|---|---|---|---|
| [ ] | Chào theo thời gian (sáng, tối, lâu không gặp) | P1 | 5 | DialogueBox | |
| [ ] | Nhắc việc, hẹn giờ, Pomodoro | P1 | 5 | cần design | Tool use |
| [ ] | Thời tiết, tra cứu, tóm tắt | P2 | 5 | cần design (card kết quả) | Tool use |
| [ ] | Nhật ký / tóm tắt cuộc trò chuyện mỗi ngày | P2 | 5 | ChatPage | |

## 5. Hệ thống & cài đặt

| | Tính năng | Ưu tiên | Giai đoạn | UI | Ghi chú |
|---|---|---|---|---|---|
| [x] | Nhiều nhà cung cấp LLM | P0 | 1 | | `backend/providers/` (claude, openai) |
| [ ] | Giao diện Wishlight + theme sáng/tối | P0 | 1 | tất cả | `IMPLEMENTATION.md` bước 1 |
| [ ] | Onboarding (chọn VRM, đặt tên, cấp quyền mic) | P1 | 1 | cần design | |
| [ ] | Màn hình cài đặt (giọng, model, phụ đề, rảnh tay, trí nhớ) | P1 | 2 | Toggle, Button | |
| [ ] | Quyền riêng tư: xóa dữ liệu, tắt trí nhớ | P1 | 5 | Button `danger` | |
| [ ] | Phím tắt | P2 | 1 | | |
| [ ] | Đóng gói desktop / PWA | P2 | 6 | | |

## Màn hình còn cần design trong Wishlight

Sân khấu chính (bố cục đầy đủ), Persona editor, Cài đặt, Onboarding, Trí nhớ, Call mode, Wardrobe. Khi design xong, cập nhật `design/wishlight/` và cột UI ở trên.
