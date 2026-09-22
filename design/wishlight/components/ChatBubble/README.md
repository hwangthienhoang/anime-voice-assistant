Bong bóng tin nhắn cho trang chat chi tiết, phân biệt nhân vật (`ai`) và người dùng (`user`).

**Consumer cung cấp:** `from`, `children` (nội dung), `name` (tên nhân vật), `time`, `emotion`, `voice` (thời lượng, hiện nút phát lại giọng), `onPlay`, `typing` (hiện ba chấm đang soạn).

- Nhân vật: nền `parchment-raised`, bên trái, góc trên trái vuông. Người dùng: nền `action`, bên phải.
- Tin nhắn gửi bằng giọng nói vẫn hiện bản chép lời; nút phát lại nằm dưới bong bóng.
- Gộp các tin liền nhau cùng người gửi, cách `space-2`; giữa các nhóm cách `space-4`.
