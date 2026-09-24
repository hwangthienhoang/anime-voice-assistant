# Frontend

Vue 3 + Vue Router 4 + Vite + JavaScript ESM. **Hiện có foundation, component gallery F1B và Sân khấu avatar cục bộ thuộc F1C**. Chat/voice/API chưa port. Đọc [architecture](../docs/ARCHITECTURE.md) và [migration](../docs/FRONTEND_MIGRATION.md) trước khi implement.

## Chạy và kiểm tra

Node.js 22.12+ hoặc 24.x, npm; Sân khấu cần `public/models/avatar.vrm`, không cần backend/API key.

```bash
npm ci
npm run dev
```

Mở [dev gallery](http://localhost:5173/dev/design-system) để xem toàn bộ design system. Catalogue/contract ở [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md). Gallery không có trong production build/preview.

App chính ở [localhost:5173](http://localhost:5173). `/` có model VRM; màn chào dùng `AnimationClip` tạo tại runtime để Paimon bay từ xa vào giữa sân khấu với tay/chân chuyển động, xoay một vòng, đáp đất, vẫy tay và hiện chữ typewriter. Nút “Xem chuỗi demo” và “Xem lại màn chào” nằm dưới sân khấu; khi bật reduced motion, lời chào bắt đầu ngay và bỏ qua đoạn bay. Thư viện 31 VRMA và bốn mix nằm trong sidebar phải; trên màn hình hẹp, chọn clip sẽ đóng drawer để xem nhân vật. Preview khẩu hình chạy khi phát clip nói, mix và chữ typewriter trong màn chào, chưa đồng bộ với audio/TTS. `/chat` còn placeholder, `/settings` hoạt động một phần. URL khác hiện 404. `npm run preview` phục vụ output sau build.

```bash
npm test
npm run check:design
npm run build
```

- `npm run sync:design`: copy CSS/JSON từ `../design/wishlight/` vào `src/assets/styles/`.
- `npm run check:design`: kiểm tra ba file CSS/JSON giống nguồn; không generate tokens.
- Commit `package-lock.json` khi thay dependency; không commit `node_modules/` hoặc `dist/`.
- Alias `@/` là `src/`, khai báo cùng nhau trong Vite và jsconfig.

## Deploy lên GitHub Pages

Repo có workflow `.github/workflows/deploy-pages.yml`. Mỗi lần push nhánh `codex/deploy-github` sẽ chạy `npm ci`, build frontend và deploy `frontend/dist` lên `https://hwangthienhoang.github.io/anime-voice-assistant/`. Không cần merge vào `main` để deploy.

Trong GitHub, vào **Settings → Pages → Build and deployment → Source** và chọn **GitHub Actions**. Nếu environment `github-pages` có deployment branch rule, cho phép nhánh `codex/deploy-github`. Với GitHub Free, repo phải public. Không cần commit `dist/` hoặc tạo nhánh `gh-pages`.

Build Pages dùng `GITHUB_PAGES=true npm run build`, đặt Vite base thành `/anime-voice-assistant/`. Để xem bản build này ở local, chạy `GITHUB_PAGES=true npm run preview` và mở URL có `/anime-voice-assistant/` mà Vite in ra. Build local thông thường và dev server vẫn dùng `/`. Bản Pages dùng hash routing (`/#/chat`, `/#/settings`) để refresh route không bị GitHub Pages trả 404; local dev vẫn dùng `/chat`, `/settings`.

Frontend hiện vẫn là skeleton, chưa gọi backend, tải model hay chạy voice. Backend FastAPI cần được host riêng khi tích hợp về sau; không đưa API key vào frontend. Các file `.vrm` cá nhân bị `.gitignore` và không có trong build từ GitHub.

## Phân biệt source

| Folder | Vai trò |
| --- | --- |
| `src/app` | Shell/router và coordinator draft |
| `src/views` | Bốn route-level views chạy được |
| `src/features` | avatar có runtime sân khấu cục bộ; conversation/voice còn draft; devtools giữ fixtures/gallery |
| `src/shared` | UI components đã implement, constants, HTTP draft |
| `src/assets/styles` | Wishlight CSS + global foundations |
| `public` | Model VRM cục bộ và VRMA/manifest/NOTICE dùng trên Sân khấu |
| `legacy/mvp-0` | Snapshot tham khảo; không import vào app |

UI components đã implement và xuất hiện trong gallery; `AvatarStage` là presentation layer với slots. `StageView` sở hữu composable tạo renderer, tải model/animation và dispose khi rời route. Sân khấu không gửi API request hoặc xin quyền mic. Proxy `/api` vẫn trỏ port 8000 để tích hợp sau plan backend.

Khi triển khai production, host cần history fallback về `index.html` cho route UI và xử lý `/api` riêng. Chưa thêm hosting configuration trong đợt này.
