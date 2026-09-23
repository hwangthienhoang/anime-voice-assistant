# MVP 0 — snapshot tham khảo

Đây là source prototype **trước khi chuyển sang Vue**: `src/`, `index.html`, `package.json`, `vite.config.js` được giữ nguyên. Không import/mount vào `frontend/src/`; không xem snapshot là tính năng đã có của app mới.

## Có gì để tham khảo

| File | Nội dung |
| --- | --- |
| `src/main.js` | DOM UI, history, điều phối voice/chat, demo controls |
| `src/avatar/VRMAvatar.js` | Load VRM, camera, blink/gaze, lip-sync, spring bones |
| `src/avatar/IdleMotion.js` | Procedural idle motion |
| `src/avatar/AnimationController.js` | VRMA retarget, crossfade và gesture |
| `src/avatar/DemoSequence.js` | Chuỗi demo biểu cảm/chuyển động |
| `src/audio/AudioPlayer.js` | Web Audio playback và RMS amplitude |
| `src/audio/SpeechInput.js` | Web Speech API, pause/resume và callbacks |
| `src/api.js` | Chat và TTS requests của prototype |
| `src/style.css`, `src/styles/` | Layout/CSS thử nghiệm thời MVP 0 |

Model/VRMA/manifest/credits giữ một bản tại `frontend/public/`. Snapshot không có `public/` riêng hoặc dependency lockfile gốc. **Không chạy `npm install` tại đây** và không sửa source snapshot; muốn thử lại thì khôi phục vào thư mục sandbox riêng cùng assets. Đợt tái cấu trúc không kiểm chứng lại runtime prototype.

## Cách thử lại trong sandbox riêng

1. Copy `src`, `index.html`, `package.json`, `vite.config.js` của snapshot vào một thư mục thử nghiệm ngoài active source.
2. Copy `frontend/public/` vào `public/` của thư mục thử nghiệm (model riêng không có trong Git).
3. Chạy `npm install` và `npm run dev` trong thư mục thử nghiệm; dùng port khác nếu Vue app đang chạy.
4. Demo avatar không cần backend, có thể chọn `.vrm` hoặc đặt `public/models/avatar.vrm`; `?demo` kích hoạt chuỗi thử trong prototype.

Nếu cần thử chat/voice cũ, backend prototype chạy từ repo gốc với cấu hình riêng:

```bash
cp .env.example .env
# Điền API key phù hợp trong .env, không commit file này.
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend hiện hỗ trợ `AI_PROVIDER=claude|openai`; cần API key/model tương ứng. Giọng TTS dùng `TTS_VOICE`. Không chạy backend hoặc thay config chỉ để xem Vue skeleton. Luồng prototype phụ thuộc browser STT, LLM provider và dịch vụ TTS; source tồn tại không đảm bảo các dịch vụ này hoạt động ở thời điểm thử lại.

## Khi port

Đọc [migration guide](../../../docs/FRONTEND_MIGRATION.md). Tách từng runtime khỏi DOM/global state, bổ sung cleanup và kiểm tra route lifecycle. Những ghi chú về crossfade, camera fitting và timer trong source là reference cần giữ khi giải thích quyết định port.
