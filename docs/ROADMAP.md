# Lộ trình phát triển

Bộ khung hiện tại là **giai đoạn 1 (MVP)**. Mỗi giai đoạn dưới đây thay hoặc nâng cấp một khối, giao diện giữa các khối được giữ nguyên nên không cần viết lại toàn bộ.

## Giai đoạn 1: MVP (đã có trong project này)

- Nhập chữ hoặc nói, Claude trả lời, avatar đọc lên và mấp máy miệng.
- Biểu cảm theo thẻ cảm xúc, chớp mắt, thở, nhìn theo chuột.
- Nhược điểm đã biết: chờ trọn câu trả lời rồi mới đọc (độ trễ khoảng 2 đến 4 giây), chưa ngắt lời bằng giọng nói được.

## Giai đoạn 2: Giảm độ trễ

Mục tiêu: dưới khoảng 1,5 giây từ lúc bạn ngừng nói đến lúc nhân vật cất tiếng.

- **Streaming câu trả lời:** dùng `client.messages.stream(...)` ở backend, gửi về frontend qua SSE hoặc WebSocket.
- **TTS theo câu:** cắt luồng chữ theo dấu câu, đọc câu đầu tiên ngay khi có, xếp hàng các câu sau trong `AudioPlayer`.
- **Thẻ cảm xúc giữa câu:** cho phép thẻ xuất hiện nhiều lần, mỗi thẻ áp dụng từ câu đó trở đi.

## Giai đoạn 3: Đối thoại tự nhiên

- **Ngắt lời (barge-in):** thay Web Speech API bằng VAD chạy trên trình duyệt (`@ricky0123/vad-web`, dựa trên Silero VAD). Khi VAD phát hiện bạn bắt đầu nói thì gọi `player.stop()`.
- **Chống vọng:** bật `echoCancellation` khi gọi `getUserMedia` để micro không nghe lại giọng avatar, từ đó bỏ được việc tạm dừng micro.
- **STT chất lượng cao hơn:** gửi audio lên Whisper (`faster-whisper` chạy local) hoặc dịch vụ như Deepgram, Google STT, FPT.AI. Thay nội dung `SpeechInput.js`, giữ nguyên `onFinal`, `onInterim`.
- **Điều phối realtime:** cân nhắc Pipecat hoặc LiveKit Agents nếu muốn WebRTC và quản lý lượt nói chuyên nghiệp.

## Giai đoạn 4: Nhân vật sống động hơn

- **Cử chỉ:** nạp animation `.vrma` bằng `@pixiv/three-vrm-animation` (idle, vẫy tay, gật đầu, nghiêng đầu). Có thể lấy từ Mixamo rồi retarget sang VRM.
- **Ánh mắt:** thêm dao động mắt nhỏ (saccade) và nhìn vào camera khi đang nói.
- **Khẩu hình chính xác:** dùng viseme thay cho biên độ. Azure TTS trả viseme kèm theo; hoặc phân tích âm thanh bằng thuật toán kiểu `uLipSync`.
- **Bối cảnh:** thay nền phẳng bằng phòng 3D, ánh sáng theo giờ trong ngày.

## Giai đoạn 5: Trí nhớ và khả năng làm việc

- **Bộ nhớ dài hạn:** lưu tóm tắt hội thoại và sở thích người dùng vào SQLite hoặc vector DB, đưa vào system prompt khi cần.
- **Tool use:** cho Claude gọi công cụ (thời tiết, lịch, tìm kiếm, điều khiển thiết bị). Tool calling của API Claude hoạt động tốt với mô hình trả lời ngắn.
- **Nhiều nhân vật:** mỗi nhân vật một `persona.md`, một model VRM và một giọng đọc.

## Giai đoạn 6: Đóng gói

- **Desktop:** Tauri hoặc Electron, có thể làm cửa sổ nền trong suốt để nhân vật đứng trên màn hình nền.
- **Mobile:** PWA trước, sau đó cân nhắc Capacitor hoặc Unity + UniVRM nếu cần hiệu năng cao.

## Nếu muốn giọng khác

| Nhu cầu | Gợi ý |
| --- | --- |
| Ổn định, có SLA, viseme kèm theo | Azure Speech (`vi-VN-HoaiMyNeural`) |
| Giọng tự nhiên, đa ngôn ngữ | ElevenLabs |
| Chạy hoàn toàn offline | Piper hoặc model F5-TTS tinh chỉnh cho tiếng Việt (cần thử nghiệm chất lượng) |
| Giọng kiểu anime tiếng Nhật/Anh | GPT-SoVITS, Style-Bert-VITS2 (không phù hợp tiếng Việt) |

Chỉ cần đổi hàm `tts()` trong `backend/main.py`, frontend không phải sửa.
