# Anime Voice Assistant

Trợ lý AI trò chuyện bằng giọng nói, có avatar 3D phong cách anime (định dạng VRM) biết chớp mắt, đổi biểu cảm và mấp máy miệng theo giọng nói.

```
Mic ──► Web Speech API ──► FastAPI ──► Claude ──► [thẻ cảm xúc] + câu trả lời
                                                        │
                                          Edge TTS ◄────┘
                                              │
                    Web Audio (đo âm lượng) ──┴──► Three.js + three-vrm
                                                    (khẩu hình + biểu cảm)
```

## Yêu cầu

- Node.js 18 trở lên
- Python 3.10 trở lên
- Trình duyệt Chrome hoặc Edge (cần cho nhận diện giọng nói)
- API key của Anthropic
- Một model nhân vật `.vrm` (xem phần dưới)

## Chạy thử

**1. Cấu hình key**

```bash
cp .env.example .env
# mở .env và điền ANTHROPIC_API_KEY
```

**2. Backend** (terminal thứ nhất)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**3. Frontend** (terminal thứ hai)

```bash
cd frontend
npm install
npm run dev
```

Mở http://localhost:5173. Nếu chưa có model, giao diện sẽ hiện nút **Chọn file .vrm** để bạn nạp nhân vật ngay.

## Lấy nhân vật VRM

- **VRoid Studio** (miễn phí): tự tạo nhân vật anime rồi Export → VRM.
- **VRoid Hub** và **Booth.pm**: tải model có sẵn, nhớ đọc điều khoản sử dụng của từng model.
- Đặt file vào `frontend/public/models/avatar.vrm` để tự nạp mỗi lần mở, hoặc chọn file thủ công trên giao diện.

## Cấu trúc thư mục

```
anime-voice-assistant/
├── .env.example
├── backend/
│   ├── main.py               # /api/chat (Claude) và /api/tts (Edge TTS)
│   ├── prompts/persona.md    # tính cách nhân vật + quy ước thẻ cảm xúc
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── vite.config.js        # proxy /api -> backend
│   ├── public/models/        # đặt avatar.vrm ở đây
│   └── src/
│       ├── main.js           # điều phối luồng hội thoại
│       ├── api.js
│       ├── style.css
│       ├── avatar/VRMAvatar.js     # tải VRM, biểu cảm, chớp mắt, lip-sync
│       └── audio/
│           ├── AudioPlayer.js      # phát TTS + đo âm lượng
│           └── SpeechInput.js      # nhận diện giọng nói
└── docs/ROADMAP.md
```

## Cách hoạt động

1. **Nghe:** `SpeechInput` dùng Web Speech API (`vi-VN`) để chuyển giọng nói thành chữ. Micro tạm dừng khi avatar đang nói để không thu lại giọng của chính nó.
2. **Nghĩ:** backend gửi lịch sử hội thoại cho Claude cùng `persona.md`. Claude luôn mở đầu câu trả lời bằng một thẻ như `[happy]`; backend tách thẻ này ra thành trường `emotion`.
3. **Nói:** backend tạo giọng bằng Edge TTS (mặc định `vi-VN-HoaiMyNeural`) và trả về mp3.
4. **Diễn:** `AudioPlayer` phát mp3 qua một `AnalyserNode`. Mỗi khung hình, `VRMAvatar` đọc âm lượng để mở miệng (`aa`, cộng chút `oh`, `ih` cho tự nhiên), đồng thời chuyển mượt sang biểu cảm tương ứng.

## Tùy chỉnh nhanh

| Muốn đổi | Sửa ở đâu |
| --- | --- |
| Tên, tính cách, cách xưng hô | `backend/prompts/persona.md` |
| Giọng đọc | `TTS_VOICE` trong `.env` (chạy `edge-tts --list-voices` để xem) |
| Model Claude | `ANTHROPIC_MODEL` trong `.env` |
| Ngôn ngữ nhận diện giọng nói | `SPEECH_LANG` trong `frontend/src/main.js` |
| Khung hình camera (cận/xa) | hằng số `CAMERA` trong `VRMAvatar.js` |
| Tay bị giơ lên hoặc dang ngang | đổi dấu hằng số `ARM_DOWN` trong `VRMAvatar.js` |
| Màu sắc giao diện | biến CSS ở đầu `frontend/src/style.css` |

## Xử lý sự cố

- **Nút micro bị mờ:** trình duyệt không hỗ trợ Web Speech API. Dùng Chrome hoặc Edge.
- **Micro không nhận:** cần chạy qua `localhost` hoặc HTTPS, và phải cấp quyền micro cho trang.
- **Báo thiếu `ANTHROPIC_API_KEY`:** kiểm tra file `.env` nằm ở thư mục gốc (cùng cấp với `backend/`) và khởi động lại backend.
- **Nhân vật quay lưng hoặc lệch hướng:** hầu hết đã được xử lý tự động cho VRM 0.x và 1.0. Nếu vẫn sai, xuất lại model từ VRoid Studio.
- **Avatar không có biểu cảm:** model cần có sẵn các expression chuẩn VRM (`happy`, `sad`...). Model làm bằng VRoid Studio thường có đủ.
- **Edge TTS lỗi:** đây là thư viện không chính thức dùng dịch vụ đọc của Microsoft Edge, nên có thể thay đổi bất kỳ lúc nào. Xem `docs/ROADMAP.md` để biết các lựa chọn thay thế ổn định hơn.

## Hướng phát triển

Xem `docs/ROADMAP.md`.
