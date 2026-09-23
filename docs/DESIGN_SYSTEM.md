# Wishlight component gallery

## Mở trang dev

```bash
cd frontend
npm ci
npm run dev
```

Mở [localhost:5173/dev/design-system](http://localhost:5173/dev/design-system), hoặc link **Design system** trong app navigation khi chạy dev. Route được đăng ký qua `import.meta.env.DEV`; production build/preview không có gallery (URL này hiện 404).

Trang là môi trường thử **UI và design tokens**: không cần backend, API key, VRM hoặc quyền microphone. Fixture chỉ giữ trong memory và được reset khi rời trang/reload. Không xem event log, tin nhắn mẫu hoặc icon avatar là integration thật.

## Nội dung

| Khu vực | Có thể xem/thử |
| --- | --- |
| Màu sắc | Toàn bộ 26 semantic color tokens, giá trị light/dark và mô tả sử dụng |
| Typography | Hai font families, bảy text styles, dấu tiếng Việt, size/line-height/weight |
| Spacing & surfaces | Sáu spacing tokens, bốn radius, ba border widths, focus ring, hai shadows, surfaces và motion tokens |
| Iconography | 19 SVG icons; star/play dùng fill, còn lại stroke 2px |
| Buttons & fields | Bốn button variants, icon slot, loading/disabled, toggle, input/error, select, range |
| Voice & emotions | Bốn mic states + disabled, mic tương tác, sáu emotion tags trên light/night |
| Conversation | Dialogue/typewriter, subtitle, AUTO/LOG/SKIP, bubbles, replay event, typing/interim, composer và conversation items |
| Patterns & states | ChatPanel/sidebar, SettingsPanel, AvatarStage, notices và empty placeholder |

Theme có thể đổi bằng nút đầu trang hoặc SettingsPanel; chỉ áp dụng trong gallery, không ghi localStorage và không đổi theme toàn app. Giảm chuyển động tuân theo cả toggle preview lẫn `prefers-reduced-motion`.

## Component catalogue

Paths tương đối với `frontend/src/`. Tất cả component dưới đây là presentational; services/runtime/coordinator F1C/F1D vẫn là draft.

| Component | Path | Props / events / slots chính |
| --- | --- | --- |
| WishlightIcon | `shared/ui/` | `name`, optional `label`; icon lạ fallback star, icon trang trí aria-hidden |
| BaseButton | `shared/ui/` | `variant`, `icon`, `type`, `disabled`, `loading`; `click`; default/icon slots; native attrs |
| BaseToggle | `shared/ui/` | `modelValue`, `label`, `disabled`; `update:modelValue` |
| BaseInput | `shared/ui/` | `modelValue`, `label`, `hint`, `error`, `disabled`, optional `id`; `update:modelValue`; native input attrs |
| BaseSelect | `shared/ui/` | `modelValue`, `label`, `options: [{ value, label, disabled? }]`, `disabled`, `id`; `update:modelValue` |
| BaseRange | `shared/ui/` | Numeric `modelValue`, `label`, `min/max/step`, `unit`, `disabled`, `id`; `update:modelValue` |
| BaseNotice | `shared/ui/` | `title`, `description`, `tone: info/success/error/loading`; default/action slots |
| EmotionTag | `shared/ui/` | `emotion`, `onNight`; default label slot; emotion lạ fallback neutral |
| PagePlaceholder | `shared/ui/` | `title`, `description`, `headingLevel: 1/2/3`; default slot |
| MicButton | `features/voice/components/` | `state`, `label`, `showLabel`, `disabled`; `toggle`; native attrs đặt lên button |
| DialogueBox | `features/conversation/components/` | `speaker`, `text`, `done`, `emotion`, `subtitle`, `auto`, `disabled`; `toggle-auto/log/skip/reveal` |
| ChatBubble | `features/conversation/components/` | `from: ai/user`, `text`, `name`, `time`, `emotion`, `voice: { duration, disabled? }`, `typing`, `interim`; `play` |
| ChatComposer | `features/conversation/components/` | `modelValue`, `placeholder`, `label`, `disabled`; `update:modelValue/send/mic`; mic slot |
| ConversationItem | `features/conversation/components/` | `title`, `snippet`, `time`, `current`, `disabled`; `select` |
| ChatPanel | `features/conversation/components/` | `title`, `conversations`, `messages`, `currentId`, `loading`, `error`; `select(id)/play(id)/back/retry`; composer slot |
| SettingsPanel | `features/settings/components/` | `modelValue: { theme, subtitles, reducedMotion, voice, rate, autoPlay }`, `voices`, `disabled`; `update:modelValue` |
| AvatarStage | `features/avatar/components/` | `status: empty/loading/error/ready`, `message`, `controls`; `select-model/retry/zoom-in/zoom-out`; avatar/dialogue/controls slots |

`ChatPanel` compose nội bộ conversation; gallery view lắp MicButton qua composer slot, không tạo dependency conversation → voice. Dưới 900px viewport, sidebar ChatPanel thu gọn và được mở bằng nút danh sách. Đây là bố cục inline có thể thu gọn, không phải modal focus trap.

Control chỉ emit ý định. Ví dụ `play` không phát audio, `toggle` không bật mic, `select-model` không đọc file. App owner quyết định behavior và xác nhận thao tác xóa thật khi tích hợp.

## Source of truth

- `design/wishlight/tokens.json` mô tả color/type/spacing/radius/shadow/border/motion.
- `design/wishlight/tokens.css` và `components.css` là CSS chuẩn. JSON và token CSS hiện được cập nhật cùng nhau bằng tay; chưa có generator.
- `npm run sync:design` copy **tokens.css, components.css và tokens.json** vào `src/assets/styles/`. Gallery đọc JSON này để liệt kê foundations; component sử dụng CSS variables.
- `npm run check:design` so sánh cả ba bản copy. Không sửa trực tiếp bản copy trong frontend.
- `shared/constants/icons.js` chứa SVG paths; không import React reference bundle vào app.
- Layout/fixture gallery nằm tại `views/DesignSystemView.vue` và `features/devtools/`. Chỉ view compose giữa các feature.

## Kiểm tra

```bash
npm test
npm run check:design
npm run build
```

`tests/components.test.js` có 12 component/gallery tests kiểm tra disabled/loading, controlled events, label/error association, fallback values, IME/Enter/Shift+Enter, text escaping, settings immutability, theme, empty → message và timer cleanup/reduced motion.

Smoke-check thêm trong browser: light/dark, sidebar nhỏ, chat state/error/retry, typewriter/reveal, keyboard focus, refresh gallery URL và rời/quay lại gallery. Production bundle không có gallery/fixture/token JSON. Đây là nghiệm thu component gallery, chưa phải full app UI hoặc kiểm toán accessibility hoàn chỉnh.

Kiểm tra ngày 2026-09-23: `npm ci`, 12 tests, design sync và production build thành công. Browser smoke-check desktop/mobile (viewport 390px) cho theme, gửi tin từ empty state, mở/chọn/đóng sidebar; không thấy horizontal overflow hay console warning/error. Các routes sản phẩm, refresh deep link, 404 và quay lại gallery đều hoạt động. Typewriter cleanup và reduced motion được kiểm tra bằng tests; STT/TTS/VRM thật chưa nằm trong phạm vi này.
