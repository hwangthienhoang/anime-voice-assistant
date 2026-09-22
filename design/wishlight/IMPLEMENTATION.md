# Wishlight — hướng dẫn implement cho anime-voice-assistant

File này dành cho AI (hoặc người) code frontend. Đọc hết file này, rồi `README.md` (quy tắc thiết kế) và `components/<Tên>/README.md` trước khi sửa UI.

## Có gì trong thư mục này

| File | Vai trò |
|---|---|
| `README.md` | Quy tắc thiết kế: màu dùng ở đâu, chữ, giọng văn, bố cục màn hình |
| `tokens.json` | Nguồn gốc của mọi giá trị (màu 2 theme, font, spacing, radius, shadow) |
| `tokens.css` | CSS variables sinh từ `tokens.json`, dùng thẳng được |
| `components.css` | CSS thuần cho mọi component (class `wl-*`), không phụ thuộc framework |
| `components/<Tên>/README.md` | Props/dữ liệu cần truyền, khi nào dùng, nên và không nên |
| `reference/*.preview.html`, `reference/react-prototype.bundle.js`, `reference/props.d.ts` | Bản prototype React dùng để xem mẫu trong design system. **Chỉ để tham khảo, không import vào app.** |

Bản xem trực quan (live preview) nằm ở artifact Design System "Wishlight" trên claude.ai của chủ project.

## Nguyên tắc khi implement

1. **Giữ stack hiện tại: Vite + JavaScript thuần.** Không thêm React/Vue chỉ để làm UI. Mỗi component là một hàm nhỏ tạo DOM (hoặc template HTML) trả ra đúng markup ở mục "Markup chuẩn" bên dưới, để `components.css` áp dụng được luôn.
2. **Không hard-code màu, font, khoảng cách.** Luôn dùng `var(--token)`. Nếu cần giá trị mới, thêm vào `tokens.json` rồi sinh lại `tokens.css`.
3. **Thẻ cảm xúc dùng chung một bộ tên:** `neutral`, `happy`, `relaxed`, `sad`, `surprised`, `angry`, trùng với `backend/prompts/persona.md` và preset VRM. Giá trị `emotion` từ `/api/chat` truyền thẳng vào `avatar.setEmotion()` và vào EmotionTag.
4. Theme đặt bằng `data-theme="light" | "dark"` trên `<html>`. Sân khấu và khung thoại luôn tối ở cả hai theme.
5. Không đổi logic audio/avatar/API nếu không cần; phần này chủ yếu là lớp giao diện.

## Bước 1 — Nền tảng

- Copy `tokens.css` và `components.css` vào `frontend/src/styles/`, import trong `main.js` **trước** `style.css`.
- `index.html`: thay font Be Vietnam Pro bằng
  `https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&family=Philosopher:wght@400;700&display=swap`
- `style.css`: bỏ các biến cũ (`--night`, `--dusk`, `--mist`, `--sakura`, `--paper`, `--ink`, `--ink-soft`, `--line`, `--font`) và thay mọi chỗ dùng bằng token Wishlight. Gợi ý: nền sân khấu → `--night`; chữ → `--ink`/`--on-night`; viền → `--line`; font → `--font-sans` / `--font-display`. Giữ biến `--level` (âm lượng) vì MicButton dùng lại.
- Thêm `data-theme="light"` cho `<html>`.

## Bước 2 — Sân khấu (`.stage`)

- Thay `#status` + `#mic` bằng **MicButton** (có nhãn). Map trạng thái:

| Chỗ trong `main.js` | Trạng thái MicButton |
|---|---|
| Mặc định / `speech.onStateChange(false)` | `idle` |
| `speech.onStateChange(true)` | `listening` |
| Trước `await chat(history)` | `thinking` |
| Trước `await player.play(audio)` | `speaking` |
| `finally` | `listening` nếu `speech.enabled`, ngược lại `idle` |

  Nhấn mic khi `speaking` = `player.stop()` rồi bắt đầu nghe (ngắt lời).
- Thêm **DialogueBox** ở đáy sân khấu (tối đa 880px, căn giữa, cách đáy `--space-6`), thay cho việc chỉ hiện câu trả lời ở panel:
  - `speaker` = tên nhân vật (hiện là "Hana" trong `index.html`; nên lấy từ một hằng số/persona).
  - `emotion` = giá trị từ `/api/chat` (ẩn tag khi `neutral`).
  - Chữ chạy từng ký tự trong khoảng thời lượng audio TTS; click vào khung → hiện hết câu ngay.
  - **SKIP** = `player.stop()`. **LOG** = mở trang chat (Bước 3). **AUTO** = chế độ rảnh tay (mic tự nghe lại sau khi nhân vật nói xong).
  - Ẩn khung khi chưa có câu nào hoặc sau khoảng 6 giây im lặng.
- Nút zoom giữ nguyên chức năng, restyle thành nút tròn `--parchment-raised` + icon.
- Thông báo lỗi và "Chưa có nhân vật" (`#model-notice`): card `--parchment-raised`, `--radius-lg`, nút "Chọn file .vrm" dùng Button `primary`.

## Bước 3 — Trang chat chi tiết (ChatPage)

- Panel `.panel` hiện tại trở thành **ChatPage**: một view riêng mở bằng LOG hoặc phím tắt, trượt ngang 200ms, có nút "Về sân khấu" (Button `secondary`, icon `play`). Trên màn rộng ≥1200px có thể giữ dạng panel bên phải; dưới 720px thì sidebar thu thành ngăn kéo.
- `addMessage(kind, text)` → sinh **ChatBubble**:
  - `user` → `wl-msg-user`; `assistant` → `wl-msg-ai` kèm tên, EmotionTag, giờ.
  - `user interim` (chữ đang nhận dạng) → bong bóng user với `opacity: .6`.
  - `error` → dòng chữ `--danger` căn giữa, có chữ "Lỗi:" ở đầu (không chỉ dựa vào màu).
  - Khi đang chờ `/api/chat` → bong bóng `typing`.
  - Lưu blob audio TTS của mỗi câu để nút "Phát lại" phát lại được.
- Form `.composer` → **ChatComposer** (textarea, MicButton nhỏ, nút gửi). Enter gửi, Shift+Enter xuống dòng.
- Sidebar **ConversationItem**: giai đoạn đầu chỉ có một cuộc trò chuyện; khi có lưu lịch sử (localStorage hoặc backend) thì mỗi cuộc là một item.
- Bảng demo (`#demo-panel`): các nút dùng Button `secondary`/`ghost`, nhóm cảm xúc hiện EmotionTag.

## Bước 4 — Kiểm tra trước khi xong

- [ ] Không còn màu/font hard-code ngoài `tokens.css` (grep `#[0-9a-f]{3,6}` trong `style.css`).
- [ ] Đổi `data-theme` sang `dark`: mọi chữ vẫn đọc rõ.
- [ ] Tab qua mọi control: có vòng focus `--focus`.
- [ ] Bật "Reduce motion" của hệ điều hành: vòng mic hết chuyển động.
- [ ] Chữ tiếng Việt hiện đủ dấu ở cả Philosopher và Nunito.
- [ ] Luồng voice đầy đủ: nghe → nghĩ → nói → nghe lại, MicButton và DialogueBox đổi đúng trạng thái.

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
