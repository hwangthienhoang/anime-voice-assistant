# Wishlight — hướng dẫn implement bằng Vue

Dành cho AI và người phát triển frontend. Đọc [AGENTS](../../AGENTS.md), [architecture](../../docs/ARCHITECTURE.md), [migration](../../docs/FRONTEND_MIGRATION.md), [design README](README.md) và component spec liên quan trước khi sửa UI.

## Trạng thái và nguồn chuẩn

App có **Wishlight components và dev gallery F1B**; views sản phẩm vẫn skeleton. Xem [catalogue](../../docs/DESIGN_SYSTEM.md) và mở `/dev/design-system` khi chạy dev. Source JavaScript thuần thuộc **MVP 0**, giữ trong `frontend/legacy/mvp-0/`. Hướng dẫn này thay thế yêu cầu cũ dùng DOM helpers; không port cả `main.js` cũ vào một Vue component.

| File | Vai trò |
| --- | --- |
| `README.md` | Quy tắc visual, copy, bố cục và accessibility |
| `tokens.json` | Định nghĩa tokens; khi sửa phải cập nhật CSS tương ứng |
| `tokens.css`, `components.css` | CSS chuẩn, framework-independent; class `wl-*` |
| `components/<Tên>/README.md` | Contract mục tiêu cho Vue props/emits/slots |
| `reference/*.preview.html`, `react-prototype.bundle.js`, `props.d.ts` | Prototype cũ để xem mẫu; không import vào runtime, không phải Vue API |

## Stack và CSS

1. Vue 3 SFC với `<script setup>`, JavaScript ESM; navigation dùng Vue Router 4.
2. Chỉnh design source rồi chạy `cd frontend && npm run sync:design`; kiểm tra bằng `npm run check:design`. Script copy tokens.css, components.css và tokens.json, **không** generate CSS từ `tokens.json`.
3. `src/assets/styles/index.css` import tokens → components → base. Layout riêng dùng scoped style; không đưa CSS toàn app vào một component.
4. Màu, font, spacing, radius dùng tokens. `index.html` load Nunito và Philosopher; `data-theme="light" | "dark"` trên `<html>`. Stage/DialogueBox luôn tối.
5. Render text bằng interpolation/slot, không dùng `v-html` cho nội dung người dùng hoặc LLM.
6. Pure UI chỉ nhận props/phát events; không gọi API, khởi tạo renderer, mic hoặc audio. Owner của effects là composable/runtime theo architecture.

## Mapping component

Các path sau tương đối với `frontend/src/`. Các component UI đã implement; contract chi tiết và các control bổ sung có tại [DESIGN_SYSTEM.md](../../docs/DESIGN_SYSTEM.md). Runtime và API chưa tích hợp.

| Design component | Vue destination | Contract chính |
| --- | --- | --- |
| Button | `shared/ui/BaseButton.vue` | `variant`, `icon`, `loading`, `disabled`, native attrs; default/icon slots; native click |
| Toggle | `shared/ui/BaseToggle.vue` | `modelValue`, `label`; `update:modelValue` |
| Icon | `shared/ui/WishlightIcon.vue` | `name`; SVG inline, không phụ thuộc React |
| EmotionTag | `shared/ui/EmotionTag.vue` | `emotion`, `onNight`; optional default slot |
| MicButton | `features/voice/components/MicButton.vue` | `state`, `label`, `showLabel`, `disabled`; `toggle` |
| DialogueBox | `features/conversation/components/DialogueBox.vue` | `speaker`, `text`, `done`, `emotion`, `subtitle`, `auto`; `toggle-auto`, `log`, `skip`, `reveal` |
| ChatBubble | `features/conversation/components/ChatBubble.vue` | `from`, `text`, `name`, `time`, `emotion`, `voice`, `typing`; `play` |
| ChatComposer | `features/conversation/components/ChatComposer.vue` | `modelValue`, `placeholder`, `disabled`; `update:modelValue`, `send`, `mic`; slot `mic` |
| ConversationItem | `features/conversation/components/ConversationItem.vue` | `title`, `snippet`, `time`, `current`; `select` |
| ChatPage / ChatPanel | `features/conversation/components/ChatPanel.vue` | Ghép sidebar/thread/composer trong gallery; `/chat` vẫn placeholder |

`children` của prototype React chuyển thành default slot hoặc prop text rõ nghĩa; `onX` chuyển thành `@event`, `value/onChange` chuyển thành `v-model`. Component specs đã dùng Vue contract; `reference/props.d.ts` được giữ nguyên như tài liệu lịch sử.

## Thứ tự port

### F1B — UI

- Implement shared UI trước, sau đó feature components và views với fixture.
- Dùng `shared/constants/emotions.js` và `voiceStates.js`; giá trị lạ fallback về `neutral`/`idle`.
- MicButton luôn có nhãn/aria-label; màu không phải dấu hiệu trạng thái duy nhất. Component phát `toggle`, owner quyết định bắt đầu/dừng/ngắt lời.
- DialogueBox: LOG phát `log`, view điều hướng tới named route `chat`; SKIP/AUTO/reveal phát event, không gọi audio service. Typewriter thuộc composable, không phát `aria-live` lại từng ký tự. Component thực tế dùng button reveal riêng khi `done=false`, có keyboard access; markup bên dưới là reference tĩnh từ prototype.
- ChatComposer: Enter gửi, Shift+Enter xuống dòng; không gửi khi IME đang composition. Ghép MicButton qua slot ở view để tránh feature import lẫn nhau.
- Workspace shell có navigation sidebar và utility icon rail độc lập; dưới 900px chúng là drawer. StageView giữ nút demo/phát lại dưới sân khấu, đưa thư viện VRMA/mix vào panel bên phải; chọn clip ở drawer sẽ trả người dùng về sân khấu. Cài đặt có navigation chia nhóm trong sidebar trái. ChatPanel vẫn có sidebar lịch sử riêng trong nội dung ChatView khi được tích hợp. Không dùng DOM class toggle thay thế route.
- Chưa hiện control hoạt động giả nếu chưa có handler. Fixture phải được ghi rõ trong môi trường phát triển.

### F1C / F1D — runtime và tích hợp

- Port avatar/audio theo migration guide, thêm cleanup đầy đủ trước khi ghép vào UI.
- Voice state và playback/duration đi từ app coordinator xuống component. Chỉ bắt đầu mic sau thao tác người dùng.
- Khi backend plan được chốt mới nối chat/TTS adapters. Giữ draft service cho tới lúc đó.

## Kiểm tra trước khi hoàn tất UI

- [x] Props/emits/slots có contract rõ, component không chứa side effects ngoài trách nhiệm.
- [x] Màu/font/spacing dùng tokens; `check:design` và `build` chạy được.
- [ ] Theme dark/light, viewport hẹp, tiếng Việt và focus đều đọc được.
- [ ] Keyboard hoạt động; labels đầy đủ; reduced motion tắt chuyển động không cần thiết.
- [ ] Navigation qua router; back/forward/refresh đúng; loading/empty/error có trạng thái riêng.
- [ ] Chỉ đánh dấu feature hoàn tất khi behavior đã chạy; fixture và draft không tính integration.

## Markup chuẩn

Sinh đúng cấu trúc và class dưới đây thì `components.css` áp dụng được luôn. Icon là SVG inline 24×24, nét 2px, `currentColor`; path lấy trong `reference/react-prototype.bundle.js` (biến `PATHS`).

### Button
Biến thể: `wl-btn-primary`, `wl-btn-secondary`, `wl-btn-ghost`, `wl-btn-danger`. Không có icon: bỏ `wl-btn-ico` và thêm `wl-btn-noicon`.
```html
<button type="button" class="wl-btn wl-btn-primary">
<span class="wl-btn-ico"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 2 C12.6 8 16 11.4 22 12 C16 12.6 12.6 16 12 22 C11.4 16 8 12.6 2 12 C8 11.4 11.4 8 12 2 Z"></path></svg></span>Bắt đầu trò chuyện</button>
```

### MicButton
Class trạng thái: `wl-mic-idle`, `wl-mic-listening`, `wl-mic-thinking`, `wl-mic-speaking`. Luôn cập nhật `aria-label` và nhãn chữ theo trạng thái.
```html
<span class="wl-mic-wrap">
<button type="button" class="wl-mic wl-mic-listening" aria-label="Đang nghe…" aria-pressed="true"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3"></path></svg></button><span aria-live="polite">Đang nghe…</span></span>
```

### EmotionTag
Trên nền sáng bỏ class `wl-emo-onnight`. Màu chấm: `var(--emo-<emotion>)`.
```html
<span class="wl-emo wl-emo-onnight"><span class="wl-emo-dot" style="background:var(--emo-happy)"></span>Vui</span>
```

### DialogueBox
Khi chữ còn đang chạy thì chưa chèn ngôi sao `wl-dlg-caret`. AUTO bật: `aria-pressed="true"`. Dòng phụ đề (tùy chọn): `<p class="wl-dlg-sub">…</p>` sau `wl-dlg-text`.
```html
<section class="wl-dlg" aria-label="Lời thoại">
<div class="wl-dlg-ctrls">
<button type="button" class="wl-dlg-ctrl" aria-pressed="false">AUTO</button>
<button type="button" class="wl-dlg-ctrl">LOG</button>
<button type="button" class="wl-dlg-ctrl">SKIP</button></div>
<div class="wl-dlg-head">
<span class="wl-dlg-name">Hana</span><span class="wl-emo wl-emo-onnight"><span class="wl-emo-dot" style="background:var(--emo-happy)"></span>Vui</span>
<span class="wl-dlg-rule" aria-hidden="true"></span></div>
<p class="wl-dlg-text" aria-live="polite">Chào bạn, hôm nay mình giúp gì được nào?<svg viewBox="0 0 24 24" aria-hidden="true" class="wl-dlg-caret" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 2 C12.6 8 16 11.4 22 12 C16 12.6 12.6 16 12 22 C11.4 16 8 12.6 2 12 C8 11.4 11.4 8 12 2 Z"></path></svg></p></section>
```

### ChatBubble — nhân vật
```html
<div class="wl-msg wl-msg-ai">
<div class="wl-msg-meta">
<span class="wl-msg-name">Hana</span><span class="wl-emo"><span class="wl-emo-dot" style="background:var(--emo-happy)"></span>Vui</span><span>21:01</span></div>
<p class="wl-msg-body">Chào bạn!</p>
<button type="button" class="wl-voice"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M8 5v14l11-7L8 5Z"></path></svg>Phát lại · 0:04</button></div>
```

### ChatBubble — người dùng
```html
<div class="wl-msg wl-msg-user">
<div class="wl-msg-meta"><span>21:02</span></div>
<p class="wl-msg-body">Chào Hana</p></div>
```

### ChatBubble — đang soạn
```html
<div class="wl-msg wl-msg-ai">
<div class="wl-msg-meta">
<span class="wl-msg-name">Hana</span></div>
<div class="wl-msg-body" aria-label="Đang soạn"><span class="wl-typing"><i></i><i></i><i></i></span></div></div>
```

### ChatComposer
```html
<div class="wl-composer"><textarea rows="1" placeholder="Nhắn gì đó cho bạn đồng hành…" aria-label="Tin nhắn"></textarea>
<button type="button" class="wl-mic wl-mic-idle" aria-label="Nhấn để nói" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3"></path></svg></button>
<button type="button" aria-label="Gửi" class="wl-btn wl-btn-primary wl-btn-noicon wl-send"><svg viewBox="0 0 24 24" aria-hidden="true" class="wl-send-ico" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M4 12 20 4l-5 16-3.5-6.5L4 12Zm7.5 1.5L20 4"></path></svg></button></div>
```

### ConversationItem
Item đang mở: `aria-current="true"`.
```html
<button type="button" class="wl-conv" aria-current="true"><svg viewBox="0 0 24 24" aria-hidden="true" class="wl-conv-star" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 2 C12.6 8 16 11.4 22 12 C16 12.6 12.6 16 12 22 C11.4 16 8 12.6 2 12 C8 11.4 11.4 8 12 2 Z"></path></svg>
<span class="wl-conv-main">
<span class="wl-conv-title"><span>Kế hoạch cuối tuần</span>
<span class="wl-conv-time">21:03</span></span>
<span class="wl-conv-snip" style="display:block">Tối nay ăn gì?</span></span></button>
```

### Toggle
```html
<button type="button" role="switch" class="wl-toggle" aria-checked="true">
<span class="wl-toggle-track">
<span class="wl-toggle-thumb"></span></span>Hiện phụ đề song ngữ</button>
```

### Bố cục ChatPage
Class `wl-page` (lưới 260px + 1fr), `wl-side`, `wl-main`, `wl-main-head`, `wl-thread`, `wl-daysep`, `wl-main-foot` đã có trong `components.css`; xem `reference/ChatPage.preview.html` để biết thứ tự lồng nhau.
