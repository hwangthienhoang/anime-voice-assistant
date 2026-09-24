# Kế hoạch migration frontend

## Phạm vi và nguyên tắc

Foundation F1A đã xong; hiện có **presentational components + dev gallery** của F1B. Không yêu cầu tái hiện toàn bộ MVP 0 trong một lần. Source cũ được giữ để đọc lại thuật toán và hành vi, không phải dependency của app mới.

`frontend/legacy/mvp-0/` lưu nguyên `src/`, `index.html`, `package.json`, `vite.config.js` trước migration. Assets lớn giữ một bản tại `frontend/public/`. Archive không phải một route demo của Vue app.

## Mapping source

Các path cũ dưới đây tương đối với `frontend/legacy/mvp-0/`; đích tương đối với `frontend/`.

| Source MVP 0 | Đích / trách nhiệm mới | Trạng thái |
| --- | --- | --- |
| `index.html` | `index.html` chỉ mount; UI vào app/layouts, views và feature components | Shell mới; components đã port có chọn lọc, views sản phẩm chưa ghép |
| `src/main.js` | `src/main.js` bootstrap; orchestration vào `src/app/composables/useAssistantSession.js` | Bootstrap xong; coordinator draft |
| `src/main.js` — history/bubble/dialogue | `src/features/conversation/{components,composables}/` | Components đã có; state/API còn draft |
| `src/main.js` — mic/playback/state | `src/features/voice/` và app coordinator | Draft |
| `src/api.js` — `chat()` | `src/features/conversation/services/chatApi.js` + shared HTTP client | Draft, chờ F1D |
| `src/api.js` — `speak()` | `src/features/voice/services/ttsApi.js` + shared HTTP client | Draft, chờ F1D |
| `src/avatar/VRMAvatar.js` | `src/features/avatar/runtime/VRMAvatar.js` + `composables/useAvatar.js` | Port có chọn lọc cho Sân khấu; cleanup khi rời route |
| `src/avatar/IdleMotion.js` | `src/features/avatar/runtime/IdleMotion.js` | Draft; stage dùng VRMA idle |
| `src/avatar/AnimationController.js` | `src/features/avatar/runtime/AnimationController.js` | Port crossfade, retarget và clip cục bộ cho stage |
| `src/avatar/DemoSequence.js` | `src/features/avatar/runtime/DemoSequence.js` | Màn chào và demo trên Sân khấu |
| `src/audio/AudioPlayer.js` | `src/features/voice/runtime/AudioPlayer.js` | Draft |
| `src/audio/SpeechInput.js` | `src/features/voice/runtime/SpeechInput.js` | Draft |
| `src/style.css` | `src/assets/styles/base.css` + scoped styles của layout/component | Foundation và component CSS chuẩn; gallery có scoped styles |
| `src/styles/{tokens,components}.css` | `src/assets/styles/`, đồng bộ từ `design/wishlight/` | Đã chuyển |
| `public/models/`, `public/animations/` trước migration | Giữ nguyên vị trí | Giữ assets/credits; chưa load trong app |

## Thứ tự triển khai

### F1A — foundation

- [x] Chụp snapshot legacy trước khi thay entry/source.
- [x] Cập nhật tài liệu và loại bỏ hướng dẫn JavaScript thuần không còn phù hợp.
- [x] Tạo folder, file draft và dependency boundaries rõ ràng.
- [x] Cài Vue/plugin/router, alias, routes và skeleton views.
- [x] Đồng bộ Wishlight CSS; khóa dependencies bằng package-lock.
- [x] Kiểm tra install/build, routes/navigation/refresh, không có backend request hoặc legacy import.

### F1B — UI trước, dữ liệu thử sau

Đã có components, ChatPanel/SettingsPanel/AvatarStage presentational và gallery tại `/dev/design-system`. Xem [catalogue](DESIGN_SYSTEM.md). StageView đã ghép runtime avatar cục bộ; ChatView/API vẫn chưa nối.

1. Port shared UI và specs từ Wishlight sang Vue props/emits/slots.
2. Port conversation components và MicButton chỉ với props/events, không gọi API.
3. Ghép views, xử lý responsive/theme/accessibility với fixture được đánh dấu rõ.
4. Nghiệm thu UI và cập nhật backlog; không coi UI fixture là integration đã xong.

### F1C — runtime từng khối

1. Bắt đầu AvatarStage/useAvatar và load một model local; thêm dispose trước khi mở rộng animation.
2. Port IdleMotion/AnimationController; bảo toàn các ghi chú về crossfade, retarget, camera và fallback trong snapshot.
3. Port AudioPlayer/SpeechInput; sửa quyền sở hữu AudioContext, timer restart và abort khi unmount.
4. Viết app coordinator để nối các feature, chỉ một owner cho một session.
5. Kiểm tra rời/quay lại route nhiều lần; không nhân đôi RAF, observer, listener, playback hoặc mic.

### F1D — chờ backend plan

Chỉ nối services vào backend sau khi chủ project xác định plan và contract. Không tự triển khai streaming, persistence, provider mới hoặc đổi persona trong các bước frontend trên.

## Những điểm không được copy nguyên sang Vue

- `main.js` cũ query DOM toàn trang, giữ nhiều biến/timer toàn cục; cần chia state owner theo lifecycle.
- `VRMAvatar` tạo listener/ResizeObserver/render loop; phải bổ sung cơ chế dừng và dispose đầy đủ trước khi route mount/unmount.
- `SpeechInput` có timer mở mic lại; cần hủy timer và bỏ callbacks khi kết thúc session.
- Audio playback cần hủy giải mã/phát tiếp sau khi đã stop hoặc component đã bị hủy; không chỉ copy UI controls.
- Không dùng `window.__avatar` hoặc `?demo` làm API công khai của app mới. Nếu cần debug, tạo entry chỉ ở dev trong milestone sau.

## Kiểm tra F1A

Từ `frontend/`:

```bash
npm ci
npm run check:design
npm run build
npm run dev
```

- Mở `/`, `/chat`, `/settings`; navigation và nút back/forward đổi đúng view.
- Refresh `/chat` và `/settings`; không lỗi module hoặc blank page.
- URL không khớp hiện NotFoundView và link về sân khấu.
- Mở app không xin quyền mic, load VRM/VRMA hoặc request `/api/*`; không cần `.env`.
- `git diff -- backend .env.example` rỗng; archive khớp source trước migration.
- Draft chỉ có comment/TODO và template rỗng, không trả về dữ liệu giả khiến người đọc tưởng feature đã xong.

Build chỉ xác nhận skeleton compile. Luồng avatar, voice, TTS/LLM và full Wishlight UI phải được kiểm tra riêng sau khi port; không nằm trong nghiệm thu F1A.

## Kết quả kiểm tra foundation — 2026-09-23

- Node.js 24.14.0, npm 11.9.0: install tạo lockfile và `npm ci` từ cache thành công.
- `npm run check:design`, `npm run build` thành công; kiểm tra thêm cả 18 Vue SFC, gồm các draft chưa import, đều parse/compile được.
- Smoke-check trong in-app browser: ba route chính, reload `/chat` và `/settings`, back/forward, 404 và link về stage hoạt động; không ghi nhận console warning/error.
- Production JS không chứa legacy runtime, SpeechRecognition hoặc endpoint chat/TTS; skeleton không khởi tạo các tích hợp này.
- 14 file source/config trong archive khớp byte-for-byte với bản trước migration. Relative Markdown links hợp lệ; `git diff --check` sạch.
- `backend/` và `.env.example` không thay đổi. Chưa kiểm tra lại model/animation, STT, LLM/TTS thật, full responsive UI hoặc accessibility của các component draft.

## Component gallery F1B — 2026-09-23

- Shared/feature UI components có props/events/slots và fixture tương tác trong gallery.
- Bổ sung border/motion tokens, icon registry; sửa selector/body CSS của ChatBubble tại design source.
- CSS/JSON sync, component tests và production build; gallery được loại khỏi production.
- Route sản phẩm, avatar/audio runtime, API services và backend vẫn giữ phạm vi cũ.
