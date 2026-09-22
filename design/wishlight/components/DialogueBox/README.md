Khung thoại kiểu visual novel đặt ở cạnh dưới sân khấu 3D, hiện lời nhân vật đang nói.

**Consumer cung cấp:** `speaker`, `text` (chữ đang chạy theo TTS), `done` (false khi chữ còn đang chạy, ẩn ngôi sao "tiếp"), `emotion`, `subtitle` (dòng dịch), `auto`, `onToggleAuto`, `onLog` (mở trang chat chi tiết), `onSkip`, `onNext` (click khung để tiếp).

- Nền `night-glass` trên cảnh 3D, tên người nói kiểu `speaker` màu `gold`, lời thoại kiểu `dialogue` màu `on-night`.
- Chiều rộng tối đa 880px, căn giữa, cách đáy màn hình `space-6`.
- Nút LOG luôn mở ChatPage: khung thoại chỉ hiện câu hiện tại, lịch sử đầy đủ nằm ở trang chat.
- Chữ chạy đồng bộ với audio TTS; khi người dùng click trước khi xong thì hiện hết câu ngay.
