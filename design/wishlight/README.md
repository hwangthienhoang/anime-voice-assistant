Giao diện kiểu phiêu lưu kỳ ảo cho một trợ lý anime 3D (VRM) trò chuyện bằng chữ và giọng nói. Có hai không gian: **sân khấu** (cảnh 3D tối, khung thoại kiểu visual novel) và **trang giấy da** (chat chi tiết, cài đặt, persona). Phong cách lấy cảm hứng từ thể loại game nhập vai phiêu lưu nhưng là bộ nhận diện riêng: không dùng logo, icon, font hay tài sản của bất kỳ game thương mại nào.

## Nguyên tắc

- **Nhân vật là trung tâm.** Trên sân khấu, UI chỉ chiếm cạnh dưới (DialogueBox) và một cụm điều khiển nhỏ; không panel nào che mặt nhân vật.
- **Khung thoại cho khoảnh khắc, trang chat cho toàn bộ.** DialogueBox chỉ hiện câu đang nói. Mọi lịch sử, tìm kiếm, phát lại giọng nằm ở ChatPage, mở bằng nút LOG.
- **Trạng thái giọng nói luôn nhìn thấy được.** Mỗi lượt voice đi qua `idle → listening → thinking → speaking`; MicButton hiện cả màu lẫn chữ.
- **Ấm, mềm, có trang trí vừa phải.** Viên thuốc và góc bo lớn, viền vàng mảnh, ngôi sao bốn cánh làm dấu hiệu. Không dùng gradient tím-xanh, không dùng emoji làm trang trí.

## Giọng văn

- Nhân vật xưng "mình", gọi người dùng là "bạn" hoặc "nhà lữ hành" (người dùng đổi được trong persona). Giọng tinh nghịch, hay trêu, câu ngắn: "Về rồi đó hả!", "Lại ở nhà!".
- Chữ UI (nút, cài đặt) trung tính, viết hoa chữ đầu câu, động từ ngắn: "Bắt đầu trò chuyện", "Lưu persona", "Xóa trí nhớ". Nút điều khiển khung thoại viết hoa toàn bộ: AUTO, LOG, SKIP.
- Mọi chữ phải hiển thị đúng dấu tiếng Việt: cả hai font đều có bộ ký tự Vietnamese.

## Màu

- Sân khấu: `night` làm nền, khung thoại `night-glass`, chữ `on-night`, tên người nói `gold`. Khu vực này tối ở cả hai theme.
- Trang giấy da: nền `parchment`, card và bong bóng nhân vật `parchment-raised`, sidebar và ô nhập `parchment-sunk`, chữ `ink` / `ink-muted`.
- `gold` là màu nhận diện: viền trang trí, ngôi sao, gạch tiêu đề. Trên nền sáng KHÔNG dùng `gold` làm chữ; dùng `gold-strong`.
- Hành động chính và bong bóng người dùng: `action` với chữ `on-action` (theme Night đảo thành nền vàng chữ tối).
- Trạng thái giọng nói: `state-listening`, `state-thinking`, `state-speaking`. Cảm xúc: `emo-neutral`, `emo-happy`, `emo-relaxed`, `emo-sad`, `emo-surprised`, `emo-angry` (trùng thẻ cảm xúc của LLM và preset VRM), luôn đi cùng chữ.
- Vòng focus: 2px liền nét `focus`, cách control 2px, trên mọi nền.

## Chữ

- `display`, `title`, `speaker` dùng Philosopher (serif cổ điển, gợi cảm giác sách phiêu lưu); chỉ cho tiêu đề và tên.
- `dialogue`, `body`, `label`, `caption` dùng Nunito (tròn, dễ đọc, hợp tiếng Việt).
- Lời thoại trên sân khấu luôn dùng `dialogue` (18/28), không nhỏ hơn.

## Khoảng cách, bo góc, đổ bóng

- Thang khoảng cách `space-1` 4px đến `space-8` 32px. Lề trang và padding khung thoại `space-6`.
- `radius-pill` cho nút, toggle, mic; `radius-md` cho bong bóng và card; `radius-lg` cho khung thoại, panel và ô soạn tin.
- `shadow-card` cho card trên nền giấy; `shadow-stage` cho mọi thứ phủ lên cảnh 3D.

## Icon

- Nét tròn 2px, khung 24px, `currentColor`, vẽ inline qua `Wishlight.Icon` (star, mic, send, play, check, trash, chevron, wave).
- Ngôi sao bốn cánh (`star`) là dấu hiệu riêng: ô icon của Button, dấu "tiếp" cuối lời thoại, dấu mục lịch sử, vạch phân cách ngày.

## Chuyển động

- Chữ lời thoại chạy theo audio TTS; click để hiện hết câu.
- Vòng mic: sóng lan 1.4s khi nghe, xoay 1s khi nghĩ. Tắt khi `prefers-reduced-motion`.
- Chuyển giữa sân khấu và trang chat: trượt ngang 200ms, ease-out.

## Màn hình

1. **Sân khấu**: nhân vật 3D ở giữa, DialogueBox ở đáy, MicButton ở góc phải dưới, nút cài đặt góc phải trên.
2. **Trang chat chi tiết** (ChatPage): sidebar lịch sử, luồng tin, ô soạn tin có mic.
3. **Persona editor**: tên, cách xưng hô, tính cách, giọng TTS.
4. **Cài đặt**: giọng nói, model, phụ đề, rảnh tay, trí nhớ (Toggle, Button danger).
5. **Onboarding**: chọn file VRM, đặt tên, cấp quyền mic.
