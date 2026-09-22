Tag nhỏ cho biết cảm xúc hiện tại của nhân vật, luôn gồm chấm màu và chữ.

**Consumer cung cấp:** `emotion` (`neutral` | `happy` | `relaxed` | `sad` | `surprised` | `angry`), `onNight` khi đặt trên nền `night`, `children` để đổi chữ.

- Sáu giá trị trùng với thẻ cảm xúc LLM trả về (`[happy] …`) và với preset biểu cảm của VRM, nên truyền thẳng giá trị đó vào, không cần bảng chuyển đổi.
- Màu chấm: `emo-<emotion>`. Chữ: Bình thường, Vui, Thư thái, Buồn, Ngạc nhiên, Dỗi.
- `neutral` thường không cần hiện tag; chỉ hiện khi muốn ghi rõ.
- Dùng trong DialogueBox và meta của ChatBubble; không dùng làm nút.
