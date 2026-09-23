# Toggle

Công tắc bật/tắt cho màn hình cài đặt (phụ đề, chế độ rảnh tay, trí nhớ dài hạn).

**Vue contract (F1B, đã implement):** `BaseToggle.vue` tại `src/shared/ui/`. Props: `modelValue` (boolean), `label`, `disabled`. Emit: `update:modelValue`; sử dụng với `v-model`. Không tự lưu preferences.

- Luôn có nhãn chữ bên phải; nhãn mô tả trạng thái BẬT.
- Tắt: track `parchment-sunk` viền `line-strong`. Bật: track `action`, núm `on-action`.
