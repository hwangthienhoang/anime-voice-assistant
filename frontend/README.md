# Frontend

Vue 3 + Vue Router 4 + Vite + JavaScript ESM. **Hiện có foundation + component gallery F1B**, chưa port runtime/API từ MVP 0. Đọc [architecture](../docs/ARCHITECTURE.md) và [migration](../docs/FRONTEND_MIGRATION.md) trước khi implement.

## Chạy và kiểm tra

Node.js 22.12+ hoặc 24.x, npm; không cần backend/API key/model cho skeleton.

```bash
npm ci
npm run dev
```

Mở [dev gallery](http://localhost:5173/dev/design-system) để xem toàn bộ design system. Catalogue/contract ở [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md). Gallery không có trong production build/preview.

App chính ở [localhost:5173](http://localhost:5173). `/`, `/chat`, `/settings` có placeholder; URL khác hiện 404. `npm run preview` phục vụ output sau build.

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
| `src/features` | avatar, conversation, voice, settings: UI đã có, runtime/services draft; devtools giữ fixtures/gallery |
| `src/shared` | UI components đã implement, constants, HTTP draft |
| `src/assets/styles` | Wishlight CSS + global foundations |
| `public` | Assets giữ nguyên; skeleton chưa load model/animation |
| `legacy/mvp-0` | Snapshot tham khảo; không import vào app |

UI components đã implement và xuất hiện trong gallery; `AvatarStage` là presentation layer với slots, chưa có renderer. Routes sản phẩm vẫn skeleton. Không có API requests, mic session hoặc renderer trong skeleton. Proxy `/api` vẫn trỏ port 8000 để tích hợp sau plan backend.

Khi triển khai production, host cần history fallback về `index.html` cho route UI và xử lý `/api` riêng. Chưa thêm hosting configuration trong đợt này.
