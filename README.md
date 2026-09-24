# Anime Voice Assistant

Trợ lý AI trò chuyện bằng text/voice với nhân vật anime 3D (VRM), sử dụng design system **Wishlight**.

## Trạng thái hiện tại

Project đang **tái cấu trúc frontend**, chưa có MVP sản phẩm hoàn chỉnh.

- **MVP 0** là prototype trước đây: thử model VRM, animation, luồng chat/voice và một phần CSS Wishlight. Source được giữ trong [`frontend/legacy/mvp-0/`](frontend/legacy/mvp-0/README.md) để tham khảo.
- **Frontend hiện tại** có Vue app shell, bộ presentational components Wishlight, **dev gallery** và Sân khấu chạy model VRM cục bộ với màn chào/animation demo. Chat, voice và API vẫn chưa tích hợp.
- **Backend** giữ nguyên prototype FastAPI; chưa nằm trong đợt tái cấu trúc này. Kế hoạch backend sẽ được chủ project xác định riêng.

## Bắt đầu đọc

| Tài liệu | Nội dung |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Hướng dẫn cho AI làm việc trong repo, phạm vi và quy tắc cập nhật |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phân biệt MVP 0, foundation và các mốc tiếp theo |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, folder, dependency boundaries, routes và lifecycle |
| [`docs/WORKSPACE_LAYOUT.md`](docs/WORKSPACE_LAYOUT.md) | Workspace shell tối giản, navigation theo feature, theme và sidebar responsive |
| [`docs/FRONTEND_MIGRATION.md`](docs/FRONTEND_MIGRATION.md) | Thứ tự migration, mapping source cũ → mới, tiêu chí nghiệm thu |
| [`docs/FEATURES.md`](docs/FEATURES.md) | Backlog và trạng thái tính năng của frontend mới |
| [`design/wishlight/IMPLEMENTATION.md`](design/wishlight/IMPLEMENTATION.md) | Port Wishlight thành Vue components |
| [`frontend/README.md`](frontend/README.md) | Chạy frontend và kiểm tra |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Dev gallery, component contracts và design tokens |

## Chạy frontend

Dùng Node.js 22.12+ hoặc 24.x và npm. Sân khấu cần file `frontend/public/models/avatar.vrm`; các route khác không cần model, Python hoặc API key.

```bash
cd frontend
npm ci
npm run dev
```

Mở [Wishlight dev gallery](http://localhost:5173/dev/design-system) để xem components/design tokens và thử light/dark, inputs, conversation states. Gallery chỉ có trong dev.

App chính ở [localhost:5173](http://localhost:5173). Route `/` tải avatar, tự phát màn chào và có các nút demo animation; `/chat` vẫn là placeholder, `/settings` mới có một số mục hoạt động. URL không khớp hiện trang 404. Chưa có hội thoại thật.

```bash
npm test
npm run check:design
npm run build
npm run preview
```

Để deploy skeleton lên GitHub Pages, xem [hướng dẫn frontend](frontend/README.md#deploy-lên-github-pages). Bản Pages chưa có chat, voice hoặc avatar runtime.

## Cấu trúc

```text
anime-voice-assistant/
├── AGENTS.md                    # entry point cho AI
├── docs/                        # architecture, roadmap, backlog, migration
├── design/wishlight/            # design source + prototype tham khảo
├── frontend/
│   ├── src/
│   │   ├── app/                 # bootstrap, router, layouts, điều phối app
│   │   ├── views/               # route-level components
│   │   ├── features/            # avatar, conversation, voice, settings
│   │   ├── shared/              # UI dùng chung, constants, HTTP boundary
│   │   └── assets/styles/       # Wishlight CSS + global styles
│   ├── public/                  # VRM/VRMA assets giữ nguyên
│   ├── scripts/                 # đồng bộ CSS từ design source
│   └── legacy/mvp-0/            # snapshot prototype; không import vào app
└── backend/                     # prototype hiện có; chờ plan riêng
```

Frontend dùng **Vue 3, Vue Router 4, Vite, JavaScript ESM**, giữ các dependency **Three.js, `@pixiv/three-vrm`, `@pixiv/three-vrm-animation`** để port sau. Chưa thêm state library hoặc UI framework mới.

## Model và animation

- Model riêng đặt tại `frontend/public/models/avatar.vrm`; Sân khấu tự tải file này. Xem [hướng dẫn model](frontend/public/models/README.md).
- Animation và manifest nằm trong `frontend/public/animations/`; giữ [credits](frontend/public/animations/NOTICE.md) cùng assets.
- Logic cũ về idle, gesture, lip-sync, camera và demo nằm trong `frontend/legacy/mvp-0/src/avatar/`.

## Backend prototype

Source hiện có trong `backend/` vẫn dùng FastAPI, LLM providers và Edge TTS. Frontend mới chưa kết nối backend; proxy `/api` được giữ để tích hợp sau. API keys chỉ thuộc backend, không đặt trong biến `VITE_*`.

Hướng dẫn chạy prototype và contract hiện có được lưu tại [`frontend/legacy/mvp-0/README.md`](frontend/legacy/mvp-0/README.md). Việc mô tả contract không đồng nghĩa chốt kiến trúc backend tương lai.
