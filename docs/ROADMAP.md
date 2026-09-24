# Lộ trình phát triển

## Đánh giá lại baseline

Giai đoạn từng được gọi là “MVP đã có” được xác định lại thành **MVP 0**: prototype để test model, chuyển động nhân vật, luồng text/voice thử nghiệm và một phần CSS theo Wishlight. Chưa có cấu trúc frontend và mức hoàn thiện đủ để coi là MVP sản phẩm.

Trạng thái hiện tại: **F1B components/gallery đã có, F1C avatar đang triển khai**; F1A đã hoàn tất. Sân khấu có demo cục bộ, Chat vẫn là skeleton; backend chờ plan riêng. `[x]` = hoàn tất trong phạm vi mô tả, `[~]` = một phần, `[ ]` = chưa thực hiện. File draft không được tính là feature đã xong.

## M0 — MVP 0 / prototype tham khảo

- [x] Có source thử nghiệm load/đổi VRM, biểu cảm, blink, idle, gaze, gesture VRMA và lip-sync theo biên độ.
- [x] Có source thử nghiệm chat, Web Speech API, TTS và một phần Wishlight UI.
- [x] Lưu source cũ tại `frontend/legacy/mvp-0/`; giữ model/animation assets ở `frontend/public/`.

Các dấu hoàn tất ở M0 mô tả **sự tồn tại của prototype**, không xác nhận tính năng đã migrate, ổn định hoặc được nghiệm thu. Prototype chưa có cleanup phù hợp cho route lifecycle; các tích hợp bên ngoài chưa được kiểm chứng lại trong đợt này.

## F1A — Tái cấu trúc frontend (đã hoàn tất)

- [x] Viết lại README, roadmap, backlog; bổ sung AGENTS, architecture, migration guide.
- [x] Chốt Vue 3 + Vue Router 4 + Vite + JavaScript; giữ Three.js và thư viện VRM.
- [x] Chia `app`, `views`, `features`, `shared`, `assets`; có file draft cho các trách nhiệm chính.
- [x] App shell và routes `/`, `/chat`, `/settings`, 404 chạy không cần backend.
- [x] Có một nguồn Wishlight CSS chuẩn và script đồng bộ sang frontend.
- [x] Có dependency lockfile và production build cho skeleton.

**Tiêu chí hoàn tất:** tài liệu và folder thực tế khớp nhau; `npm ci`, `check:design`, `build` chạy được; navigation/deep links hoạt động; app mới không import legacy, khởi tạo avatar/audio hoặc gửi request backend. Hoàn tất F1A chỉ xác nhận foundation.

## F1B — Vue UI theo Wishlight

- [x] Workspace shell tối giản: top bar một dòng, navigation theo feature hoặc nhóm cài đặt, avatar menu inline, utility icon rail, status bar và nút đóng/mở sidebar theo trạng thái. Xem `WORKSPACE_LAYOUT.md`.
- [x] Theme switch Sáng/Tối ở top bar và mục Giao diện, lưu trên thiết bị.
- [x] Implement shared UI: BaseButton, BaseToggle, WishlightIcon, EmotionTag; bổ sung Input/Select/Range/Notice.
- [x] Implement DialogueBox, MicButton, ChatBubble, ChatComposer, ConversationItem và presentational ChatPanel/SettingsPanel/AvatarStage.
- [x] Dev gallery `/dev/design-system`: toàn bộ tokens, light/dark, component states và tương tác fixture. Xem `DESIGN_SYSTEM.md`.
- [~] Sân khấu đã có nội dung, model và demo responsive; ChatView và một số mục Settings vẫn chưa hoàn thiện.
- [x] Dùng fixture rõ ràng trong gallery để kiểm tra empty/loading/error states trước khi nối API.
- [~] Component tests và browser smoke-check keyboard/theme/tiếng Việt/reduced motion; chưa nghiệm thu full app accessibility/contrast.

**Tiêu chí hoàn tất:** UI components có props/emits/slots rõ ràng, đúng design và hoạt động với fixture; không cần backend để kiểm tra UI. Presentational components đã có; các luồng nghiệp vụ vẫn chưa tích hợp.

## F1C — Port avatar và browser audio

- [~] Port VRM runtime và animation cho Sân khấu; mount/unmount có cleanup. Chưa port toàn bộ hành vi MVP 0.
- [~] Nạp model cục bộ, camera/zoom, biểu cảm, blink, idle, gesture và demo cô lập; chưa có đổi model, gaze hoặc lip-sync.
- [ ] Port AudioPlayer, SpeechInput qua composables, có hủy tác vụ và xử lý browser không hỗ trợ.
- [ ] Kết nối state `idle → listening → thinking → speaking` ở app coordinator; UI chỉ hiển thị/phát event.
- [~] Đã smoke-check rời/quay lại Sân khấu không báo lỗi renderer; mic session và playback chưa có để kiểm tra.

**Tiêu chí hoàn tất:** kiểm tra được avatar và audio với local fixtures/demo; cleanup đúng khi rời màn hình. Chưa yêu cầu gọi LLM/TTS thật.

## F1D — MVP frontend tích hợp (chờ plan backend)

- [ ] Chủ project xác định plan backend và contract tích hợp.
- [ ] Kết nối text/voice → reply/emotion → playback/lip-sync qua API adapters.
- [ ] Hoàn thiện retry/cancel/error states và đồng bộ sân khấu với lịch sử chat.
- [ ] Nghiệm thu luồng hoàn chỉnh trước khi gọi là MVP sản phẩm.

Không tự triển khai hoặc thay đổi backend để hoàn thành các mốc F1A–F1C. Contract prototype chỉ là reference; mọi mục dưới đây là hướng nghiên cứu, không phải cam kết kiến trúc.

## Hướng phát triển sau MVP — chưa lên lịch

| Chủ đề | Backlog / câu hỏi cần chốt |
| --- | --- |
| Độ trễ | Streaming reply, TTS theo câu, cảm xúc giữa câu; đo baseline trước khi đặt mục tiêu latency |
| Hội thoại tự nhiên | VAD, barge-in bằng giọng nói, echo cancellation, STT thay thế; đánh giá sau plan backend |
| Nhân vật | Viseme, saccade, phản ứng khi chạm, bối cảnh, wardrobe |
| Trí nhớ và tiện ích | Nhiều cuộc trò chuyện, persona editor, memory có xem/xóa, tool use, nhắc việc |
| Đóng gói | PWA, desktop bằng Tauri/Electron, mobile nếu có nhu cầu |

Chi tiết tính năng và bằng chứng từ MVP 0 nằm tại [`FEATURES.md`](FEATURES.md). Thứ tự port nằm tại [`FRONTEND_MIGRATION.md`](FRONTEND_MIGRATION.md).
