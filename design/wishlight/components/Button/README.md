# Button

Nút bấm dạng viên thuốc (pill) với ô icon tròn ở đầu, lấy cảm hứng từ menu game phiêu lưu.

**Vue contract (F1B, đã implement):** `BaseButton.vue` tại `src/shared/ui/`. Props: `variant` (`primary` | `secondary` | `ghost` | `danger`), `icon`, `loading`, `disabled`; chuyển tiếp native button attributes và event `click`. Default slot chứa nhãn, slot `icon` chứa WishlightIcon (bỏ slot khi không có icon). Mặc định `type="button"`.

- `primary`: một hành động chính mỗi màn hình (Bắt đầu, Lưu, Gửi). Nền `action`, chữ `on-action`, ô icon `gold`.
- `secondary`: hành động phụ đi cạnh primary. Viền `line-strong`.
- `ghost`: Hủy, Để sau.
- `danger`: xóa trí nhớ, xóa lịch sử; luôn kèm hộp xác nhận.
- Chữ động từ ngắn, viết hoa chữ đầu câu. Không dùng emoji.
