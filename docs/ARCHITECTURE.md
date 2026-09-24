# Kiến trúc frontend

## Quyết định hiện tại

- Vue 3 SFC + Composition API (`<script setup>`), JavaScript ESM.
- Vite giữ major 5 của prototype; thêm `@vitejs/plugin-vue` major 5 tương thích. Không gộp việc nâng major tooling vào đợt tổ chức lại source.
- Vue Router 4 với history routing, lazy-loaded views, named routes và 404.
- Giữ Three.js, `@pixiv/three-vrm`, `@pixiv/three-vrm-animation`; route Sân khấu lazy-load runtime 3D.
- Wishlight là design source; chưa thêm UI framework, CSS framework, Pinia hoặc TypeScript. Khi có nhu cầu state dùng chung thực tế, ghi quyết định mới trước khi thêm dependency.
- Backend giữ nguyên và không nằm trong dependency graph của skeleton.

## Folder và trách nhiệm

```text
frontend/
├── index.html                         # #app và module entry, không chứa UI nghiệp vụ
├── vite.config.js                     # Vue plugin, alias @, proxy /api
├── jsconfig.json                      # alias cho editor
├── package.json / package-lock.json
├── tests/components.test.js            # integration contracts cho UI/gallery
├── vitest.config.js
├── scripts/sync-design.mjs
├── public/
│   ├── models/                        # model do người dùng cung cấp
│   └── animations/                    # .vrma, manifest, NOTICE
├── legacy/mvp-0/                       # snapshot ngoài active source
└── src/
    ├── main.js                        # createApp + router + styles
    ├── app/
    │   ├── App.vue                    # layout + RouterView
    │   ├── router/index.js            # route table, title, scroll
    │   ├── layouts/AppLayout.vue      # navigation sidebar, compact top bar, utility rail, status bar
    │   └── composables/useAssistantSession.js  # draft coordinator
    ├── views/
    │   ├── StageView.vue
    │   ├── ChatView.vue
    │   ├── SettingsView.vue
    │   ├── NotFoundView.vue
    │   └── DesignSystemView.vue            # dev-only gallery
    ├── features/
    │   ├── avatar/
    │   │   ├── components/AvatarStage.vue     # presentational stage + slots
    │   │   ├── composables/                  # useAvatar lifecycle bridge, useStageTypewriter cho lời chào
    │   │   └── runtime/                      # VRMAvatar, AnimationController, EntranceMotion, DemoSequence chạy;
    │   │                                     # IdleMotion còn draft
    │   ├── conversation/
    │   │   ├── components/                   # DialogueBox, ChatBubble, ChatPanel,
    │   │   │                                 # ChatComposer, ConversationItem
    │   │   ├── composables/useConversation.js # draft conversation state
    │   │   └── services/chatApi.js            # draft API adapter
    │   ├── voice/
    │   │   ├── components/MicButton.vue      # presentational
    │   │   ├── composables/useVoiceSession.js # draft lifecycle bridge
    │   │   ├── runtime/                      # draft AudioPlayer, SpeechInput
    │   │   └── services/ttsApi.js             # draft API adapter
    │   ├── devtools/                     # gallery layout helpers + fixture composable
    │   └── settings/
    │       ├── components/SettingsPanel.vue  # controlled UI
    │       ├── sections.js                    # nhóm và mục cài đặt
    │       └── composables/                   # usePreferences draft; useWorkspaceTheme hoạt động
    ├── shared/
    │   ├── ui/                              # PagePlaceholder (đang dùng),
    │   │                                    # Button/Toggle/Icon/EmotionTag/Input/Select/Range/Notice
    │   ├── constants/                       # emotions.js, voiceStates.js
    │   └── services/httpClient.js            # draft transport, không biết feature
    └── assets/styles/
        ├── index.css                        # import order
        ├── tokens.css / components.css / tokens.json # copy từ design source
        └── base.css                         # reset và global foundations
```

Đây là tree hiện tại: UI components và runtime avatar dành riêng cho Sân khấu đã implement; conversation, voice và API services còn draft. Chi tiết contract tại `DESIGN_SYSTEM.md`. File có `TODO(F1B/F1C/F1D)` là vị trí dành cho implementation sau, không phải module đang hoạt động. Không tạo thêm một tầng folder chỉ để chứa một file nếu chưa có trách nhiệm riêng.

## Dependency boundaries

```text
main → app → views → features → shared
         └────────────────────→ shared
```

- `app` được compose views/features/shared. Coordinator trong `app/composables` là nơi nối conversation, voice và avatar sau này.
- `views` chỉ ghép component và nối event ở cấp màn hình; không viết renderer, HTTP client hoặc xử lý STT tại đây.
- Mỗi feature sở hữu components, composables, runtime/services của mình. Không import trực tiếp nội bộ feature khác; truyền props, emits hoặc orchestration từ app/view.
- Ví dụ ChatComposer phát `mic` event; view ghép với MicButton của voice qua slot. Conversation không sở hữu SpeechInput.
- `shared/ui` chỉ trình bày; không gọi API, biết route hay nắm global session. `shared/services` chỉ xử lý transport; endpoint `/chat`/`tts` thuộc service của feature tương ứng.
- Runtime 3D/audio là JavaScript độc lập với Vue và router. Composable là cầu nối lifecycle, không phải nơi copy toàn bộ engine.
- Không import `legacy/`, React prototype hoặc `backend/` từ `src/`. Port source có chọn lọc, không re-export từ archive.

Alias `@/` trỏ tới `frontend/src/`. Dùng relative import trong cùng folder khi dễ đọc. Component/view PascalCase, composable `useX.js`, services/constants camelCase, feature folder lowercase.

## Routes

Các route sản phẩm chia sẻ workspace shell. Sidebar trái chọn route và nội dung giữa chiếm toàn bộ vùng còn lại; shell không có tab bar cố định. Sidebar phải là icon rail với panel mở theo công cụ. StageView render thư viện VRMA và mix vào sidebar bằng Vue Teleport, giữ nút demo và phát lại màn chào trong vùng giữa; state và runtime vẫn thuộc avatar feature. Theme state nằm trong feature settings; trạng thái đóng/mở sidebar nằm trong AppLayout. Chi tiết tại [WORKSPACE_LAYOUT.md](WORKSPACE_LAYOUT.md).

| Path | Name | View | Trạng thái |
| --- | --- | --- | --- |
| `/` | `stage` | StageView | Model VRM cục bộ, màn chào, demo VRMA, zoom; chưa nối hội thoại |
| `/chat` | `chat` | ChatView | Placeholder hội thoại |
| `/settings` (query `section`) | `settings` | SettingsView | Navigation chia nhóm; Giao diện/Thông tin chạy, mục khác ghi rõ chưa sẵn sàng |
| `/dev/design-system` (DEV only) | `design-system` | DesignSystemView | Gallery toàn bộ tokens/components/fixtures |
| `/:pathMatch(.*)*` | `not-found` | NotFoundView | Trang 404 + link về sân khấu |

Dùng RouterLink/RouterView, không dùng class toggle để thay route. LOG sẽ điều hướng tới `chat`; nút trở về dùng route `stage`. Chưa tạo route onboarding/persona/memory vì chưa có design/scope triển khai.

History mode cần host production fallback các URL UI về `index.html`; `/api/*` phải được xử lý riêng trước fallback. Vite dev/preview hỗ trợ kiểm tra refresh deep link. Chưa cấu hình deployment trong đợt này.

## Dev gallery

Route gallery dùng layout riêng (`meta.layout = dev`), được đăng ký khi `import.meta.env.DEV`. AppLayout có link chỉ ở dev. `DesignSystemView` compose các feature; `features/devtools` chỉ giữ specimen layout/token catalogue/fixture composable và không import nội bộ feature khác. Gallery theme scope trên wrapper, state giữ trong memory, typewriter timer cleanup khi unmount. Production không bundle gallery hoặc fixtures.

## State và lifecycle khi port

- UI state nhỏ giữ bằng `ref`/`computed` trong component/composable. State hội thoại chia sẻ giữa StageView/ChatView sẽ do app-level coordinator sở hữu; component không tự tạo session thứ hai.
- Resource nặng giữ ngoài deep reactivity (local variable hoặc `shallowRef`/`markRaw` khi cần). Render loop không cập nhật reactive tree mỗi frame chỉ để thay pose.
- Mặc định route bị unmount sẽ giải phóng resource do route sở hữu. Rời sân khấu phải dừng RAF/renderer; rời session phải dừng mic/playback/pending requests. Metadata hội thoại có thể tồn tại ở app scope. Chính sách background voice phải được quyết định rõ trước khi implement; không dùng KeepAlive như cách tránh cleanup.
- `onMounted` tạo resource sau khi có canvas/DOM ref; `onBeforeUnmount`/`onScopeDispose` dừng RAF, hủy timer, bỏ listener, disconnect ResizeObserver, stop/dispose mixer/VRM/renderer, revoke object URL, abort request và đóng audio khi hết owner.
- AudioContext và mic chỉ bắt đầu sau thao tác người dùng. Thiếu model, permission denied, STT không hỗ trợ, request lỗi/hủy là state hiển thị được, không chỉ `console.warn`.
- Domain constants: `neutral`, `happy`, `relaxed`, `sad`, `surprised`, `angry`; voice state `idle`, `listening`, `thinking`, `speaking`. Boundary kiểm tra giá trị lạ và có fallback.

## Design source và CSS

`design/wishlight/tokens.json` mô tả tokens; `design/wishlight/tokens.css` và `components.css` là CSS chuẩn. Nếu thay tokens, cập nhật cả JSON và CSS tương ứng; repo chưa có generator JSON → CSS.

`npm run sync:design` copy tokens.css, components.css và tokens.json sang `src/assets/styles/`; `npm run check:design` so sánh cả ba file, không sinh tokens từ JSON. Gallery dùng JSON được copy để liệt kê tokens. Import theo thứ tự tokens → components → base; scoped style cho từng component/layout. Không import lại `legacy/src/style.css`.

## API boundary — chỉ ghi nhận prototype

| Endpoint hiện có | Request | Response |
| --- | --- | --- |
| `POST /api/chat` | `{ messages: [{ role: 'user' \| 'assistant', content: string }] }` | `{ reply: string, emotion: string }` |
| `POST /api/tts` | `{ text: string, voice?: string }` | `audio/mpeg` |
| `GET /api/health` | Không có body | Provider/model/voice metadata; có thể cần cấu hình provider |

Đây là ghi nhận từ `backend/main.py`, không phải contract tương lai đã chốt. Skeleton không gọi các endpoint này. Proxy dev vẫn trỏ `/api` tới `http://127.0.0.1:8000`. API keys chỉ ở backend.

## Tài liệu kỹ thuật tham khảo

- [Vue Single-File Components](https://vuejs.org/guide/scaling-up/sfc.html): component `.vue` chứa template, logic và style.
- [Vue Router guide](https://router.vuejs.org/guide/): RouterLink, RouterView và route configuration. Project dùng major 4 như khai báo trong package.json.
