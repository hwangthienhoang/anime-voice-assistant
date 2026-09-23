# Hướng dẫn cho AI làm việc trong project

## Đọc trước khi sửa

1. [`README.md`](README.md): trạng thái thật của project.
2. [`docs/ROADMAP.md`](docs/ROADMAP.md): mốc đang làm và phạm vi.
3. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): structure và dependency boundaries.
4. [`docs/FRONTEND_MIGRATION.md`](docs/FRONTEND_MIGRATION.md): mapping legacy và thứ tự port.
5. [`docs/FEATURES.md`](docs/FEATURES.md): backlog; chỉ đọc phần liên quan task.
6. Khi làm UI: [`design/wishlight/IMPLEMENTATION.md`](design/wishlight/IMPLEMENTATION.md), design README và component spec liên quan.

## Bối cảnh và phạm vi

- Bản JavaScript thuần trước đây là **MVP 0 / prototype**, không phải MVP hoàn chỉnh.
- Trạng thái hiện tại: foundation + presentational components và dev gallery F1B. Runtime/API còn draft; không tự mở rộng task thành implement toàn bộ backlog.
- Frontend: **Vue 3 + Vue Router 4 + Vite + JavaScript ESM**, Composition API với `<script setup>`. Giữ Three.js và các thư viện VRM hiện có. Không chuyển sang React, Nuxt hoặc TypeScript nếu chưa có yêu cầu.
- Backend đang chờ plan riêng: không refactor `backend/`, sửa persona, đổi API contract, provider hoặc `.env.example` trong task frontend.
- Trao đổi và tài liệu viết bằng tiếng Việt; giữ tên API, code, file, thư viện và thuật ngữ kỹ thuật bằng English.

## Quy tắc source

- `app/` lắp ghép app; `views/` lắp ghép màn hình; `features/` chứa nghiệp vụ; `shared/` không phụ thuộc feature. Chi tiết tại architecture.
- `main.js` chỉ bootstrap. Không đưa DOM query, chat orchestration, audio hoặc render loop vào entry point.
- Component UI nhận props và phát emits; API/browser side effects nằm trong services, runtime hoặc composables của đúng feature.
- Chỉ tạo folder khi có trách nhiệm rõ ràng. Không tạo `utils/`, `helpers/` hoặc global store như nơi chứa mọi thứ.
- File draft phải có `TODO(F1B)`, `TODO(F1C)` hoặc `TODO(F1D)` kèm trách nhiệm và reference. Không export hàm giả báo thành công. Không import draft chưa thực hiện vào app đang chạy.
- `frontend/legacy/mvp-0/` là snapshot tham khảo, giữ nguyên source. Không import, mount hay bundle legacy vào frontend mới. Khi port, lấy từng logic cần thiết và bổ sung lifecycle cleanup.
- Không đưa `THREE.Scene`, renderer, VRM instance hoặc AudioContext vào deep reactive state. Dừng RAF/timer/audio, remove listeners, disconnect observers và dispose resources khi unmount.
- Không tự xin quyền mic hoặc khởi tạo audio khi page load. Việc đó chỉ diễn ra sau thao tác người dùng trong milestone tương ứng.
- Giữ VRM/VRMA assets và credits. Không commit model có bản quyền riêng, API keys, `.env`, `node_modules`, `dist`.

## Design và trạng thái

- `design/wishlight/` là nguồn chuẩn cho thiết kế; React prototype trong `reference/` chỉ là tài liệu hình ảnh/markup.
- Sửa design CSS tại nguồn, chạy `npm run sync:design` trong `frontend/`. Không sửa trực tiếp bản copy trong `src/assets/styles/`.
- Gallery ở `/dev/design-system` chỉ có trong dev; catalogue/contract tại `docs/DESIGN_SYSTEM.md`. Gallery state không được đưa vào app session thật.
- Dùng tokens và class `wl-*`; scoped CSS dành cho layout riêng. Props kiểu React trong tài liệu cũ phải được chuyển thành Vue props/emits/slots theo implementation guide.
- `[x]` trong roadmap/features chỉ có nghĩa đã hoạt động và được kiểm tra ở frontend mới. Skeleton/draft không đồng nghĩa tính năng hoàn chỉnh; legacy có trạng thái riêng.

## Kiểm tra và bàn giao

- Sau thay đổi structure/dependencies: `cd frontend && npm ci`, `npm run check:design`, `npm run build`.
- Khi sửa components/gallery: chạy `npm test`, kiểm tra light/dark, keyboard, small viewport và gallery không có trong production.
- Smoke-check `/`, `/chat`, `/settings`, route 404, navigation và refresh deep link; không cần backend cho skeleton.
- Khi thêm runtime: kiểm tra mount/unmount, lỗi tải model, thiếu browser capability, hủy tác vụ và cleanup phù hợp.
- Cập nhật architecture khi thay boundary/route, migration khi port một phần, features/roadmap khi đạt tiêu chí. Luôn nói rõ phần đang chạy, draft và chưa được kiểm chứng.
- Không tự commit, push hoặc deploy nếu task không yêu cầu.
