# EmotionTag

Tag nhỏ cho biết cảm xúc hiện tại của nhân vật, luôn gồm chấm màu và chữ.

**Vue contract (F1B, đã implement):** `EmotionTag.vue` tại `src/shared/ui/`. Props: `emotion` (`neutral` | `happy` | `relaxed` | `sad` | `surprised` | `angry`), `onNight`; default slot tùy chọn để đổi nhãn. Dùng `shared/constants/emotions.js` cho bộ nhãn mặc định.

- Sáu giá trị trùng với thẻ cảm xúc LLM trả về (`[happy] …`) và với preset biểu cảm của VRM, nên dùng chung domain constants; boundary kiểm tra giá trị và fallback `neutral` khi không hợp lệ.
- Màu chấm: `emo-<emotion>`. Chữ: Bình thường, Vui, Thư thái, Buồn, Ngạc nhiên, Dỗi.
- `neutral` thường không cần hiện tag; chỉ hiện khi muốn ghi rõ.
- Dùng trong DialogueBox và meta của ChatBubble; không dùng làm nút.
