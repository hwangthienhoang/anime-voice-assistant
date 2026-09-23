# Backlog tính năng

Dùng cùng [roadmap](ROADMAP.md), [architecture](ARCHITECTURE.md) và [migration guide](FRONTEND_MIGRATION.md). **Trạng thái ở bảng này là của frontend Vue mới**. Prototype được ghi riêng trong cột MVP 0, không kế thừa dấu hoàn tất từ source cũ.

- `[x]`: đã hoạt động và kiểm tra trong frontend mới; `[~]`: một phần; `[ ]`: chưa implement.
- `Draft`: chỉ có file/folder/TODO; chưa được tính là hoàn tất.
- **P0**: cần cho MVP frontend; **P1**: tiếp theo; **P2**: để sau. Mốc F1A/B/C/D được định nghĩa trong roadmap; **Sau MVP** chưa có lịch.
- Backend/provider/persona là reference hiện có, ngoài đợt tái cấu trúc frontend. Không đánh dấu backend đã sẵn sàng chỉ vì prototype có source.

## Quyết định đã chốt

- Vue 3 + Vue Router 4 + Vite + JavaScript ESM; giữ Three.js và thư viện VRM.
- Wishlight là design source: giấy da kem, xanh navy, viền vàng, ngôi sao bốn cánh; không dùng tài sản của game thương mại.
- Sân khấu có DialogueBox cho câu hiện tại; `/chat` dành cho lịch sử chi tiết; `/settings` có navigation chia nhóm và theme hoạt động. Sân khấu/Chat còn placeholder; dev gallery có bộ components tương tác bằng fixture.
- Emotions: `neutral`, `happy`, `relaxed`, `sad`, `surprised`, `angry`.
- Voice states: `idle`, `listening`, `thinking`, `speaking`. UI state không được giả lập là mic/LLM đang chạy thật.

## Foundation

| Trạng thái | Hạng mục | Mốc | Ghi chú |
| --- | --- | --- | --- |
| [x] | Tài liệu và hướng dẫn AI thống nhất | F1A | AGENTS, architecture, migration |
| [x] | Vue app shell, routes và 404 | F1A | Placeholder, chưa có nghiệp vụ |
| [x] | Folder theo feature, snapshot legacy | F1A | Runtime có draft; components đã implement ở F1B |
| [x] | Wishlight CSS/JSON đồng bộ, production build | F1A/F1B | Không đồng nghĩa UI sản phẩm hoàn chỉnh |
| [x] | Component library và dev gallery | F1B | Tokens, components, states, light/dark; xem `DESIGN_SYSTEM.md` |

## Nhân vật

| Trạng thái | Tính năng | Ưu tiên | Mốc | MVP 0 / đích mới |
| --- | --- | --- | --- | --- |
| [ ] | Nạp/đổi VRM, camera và zoom | P0 | F1C | Có source cũ; AvatarStage hiện placeholder |
| [ ] | Biểu cảm theo emotion | P0 | F1C | Có `setEmotion`; runtime mới draft |
| [ ] | Blink, thở, idle | P0 | F1C | Tham khảo IdleMotion và VRMAvatar |
| [ ] | Nhìn theo chuột | P0 | F1C | Có source cũ; cần cleanup listener |
| [ ] | Lip-sync theo biên độ | P0 | F1C | Có source cũ; viseme để sau MVP |
| [ ] | Gesture theo ngữ cảnh | P1 | F1C / Sau MVP | Có VRMA nod/shake/think/raise-hand; cần đánh giá trước khi port |
| [ ] | Phản ứng khi chạm đầu/tay | P1 | Sau MVP | Chưa có; cần design tương tác |
| [ ] | Saccade, nhìn camera khi nói | P1 | Sau MVP | Có thử nghiệm gaze trong source cũ, chưa nghiệm thu |
| [ ] | Wardrobe, background | P2 | Sau MVP | Cần design |
| [ ] | Desktop mascot | P2 | Sau MVP | Phụ thuộc plan đóng gói |

## Hội thoại và voice

| Trạng thái | Tính năng | Ưu tiên | Mốc | MVP 0 / UI |
| --- | --- | --- | --- | --- |
| [ ] | Text chat | P0 | F1B → F1D | Có prototype; ChatBubble/Composer đã có UI; chưa nối API |
| [ ] | STT bằng Web Speech API | P0 | F1C | SpeechInput mới draft |
| [~] | MicButton bốn trạng thái | P0 | F1B → F1C | Có UI thử nghiệm cũ; component Vue có đủ states; chưa có mic runtime |
| [~] | DialogueBox, AUTO / LOG / SKIP | P0 | F1B → F1D | UI/events đã có, gallery có typewriter fixture; app integration để sau |
| [~] | Chat chi tiết và sidebar | P0 | F1B | ChatPanel chạy trong gallery; `/chat` vẫn placeholder |
| [ ] | Dừng playback bằng control/phím tắt | P0 | F1C | Có stop/Escape cũ; cần cancel đúng lifecycle |
| [ ] | Phát lại giọng từng tin nhắn | P1 | F1C → F1D | Có source replay cũ; chưa port |
| [ ] | Streaming reply và TTS theo câu | P1 | Sau MVP | Chờ plan backend và đo latency |
| [ ] | Rảnh tay/VAD, ngắt lời bằng giọng | P1 | Sau MVP | Chưa có VAD; AUTO cũ chỉ bật/tắt SpeechInput |
| [ ] | Phụ đề song ngữ | P1 | Sau MVP | DialogueBox subtitle; chờ contract |
| [ ] | Chọn giọng, tốc độ, cao độ | P1 | Sau MVP | Cần design và khả năng TTS đã chốt |
| [ ] | Call mode toàn màn hình | P2 | Sau MVP | Cần design |

## Tính cách và trí nhớ

| Trạng thái | Tính năng | Ưu tiên | Mốc | Ghi chú |
| --- | --- | --- | --- | --- |
| [ ] | Hiển thị persona trong frontend | P0 | F1D | `backend/prompts/persona.md` tồn tại; chưa nối Vue |
| [ ] | Persona editor | P1 | Sau MVP | Cần design và plan lưu trữ |
| [ ] | Lưu nhiều cuộc trò chuyện | P1 | Sau MVP | ConversationItem đã có UI; chưa chốt persistence |
| [ ] | Memory có xem/xóa | P1 | Sau MVP | Chờ plan backend |
| [ ] | Chỉ số thân thiết/mở khóa lời thoại | P2 | Sau MVP | Chưa có |
| [ ] | Mood theo ngày | P2 | Sau MVP | Chưa có |
| [ ] | Nhiều nhân vật | P2 | Sau MVP | Persona + VRM + giọng; chưa có |

## Chủ động và tiện ích

| Trạng thái | Tính năng | Ưu tiên | Mốc | Ghi chú |
| --- | --- | --- | --- | --- |
| [ ] | Chào theo thời gian/lần quay lại | P1 | Sau MVP | DialogueBox |
| [ ] | Nhắc việc, hẹn giờ, Pomodoro | P1 | Sau MVP | Chờ plan tool use |
| [ ] | Thời tiết, tra cứu, tóm tắt | P2 | Sau MVP | Cần design result card |
| [ ] | Nhật ký/tóm tắt hội thoại | P2 | Sau MVP | ChatView |

## Hệ thống và cài đặt

| Trạng thái | Tính năng | Ưu tiên | Mốc | Ghi chú |
| --- | --- | --- | --- | --- |
| [~] | UI Wishlight hoàn chỉnh, theme light/dark | P0 | F1B | Workspace có theme switch và lưu lựa chọn; nội dung các màn sản phẩm chưa hoàn tất |
| [ ] | Tích hợp LLM provider | P0 | F1D | Backend cũ có Claude/OpenAI; chờ plan riêng |
| [ ] | Onboarding: VRM, tên, quyền mic | P1 | Sau MVP | Cần design |
| [ ] | Cài đặt giọng/model/phụ đề/rảnh tay/memory | P1 | F1B / Sau MVP | `/settings` đã có navigation nhóm và theme; các mục runtime vẫn placeholder, chưa có persistence nghiệp vụ |
| [ ] | Xóa dữ liệu/tắt memory | P1 | Sau MVP | Cần storage contract |
| [ ] | Bộ phím tắt | P2 | Sau MVP | Escape/L có trong prototype |
| [ ] | Desktop / PWA | P2 | Sau MVP | Chưa chốt cách đóng gói |

## Design còn thiếu

Bố cục sân khấu hoàn chỉnh, Settings, Persona editor, Onboarding, Memory, Call mode và Wardrobe. Không suy ra design hoàn chỉnh từ placeholder. Khi triển khai, cập nhật `design/wishlight/` và component spec tương ứng.
