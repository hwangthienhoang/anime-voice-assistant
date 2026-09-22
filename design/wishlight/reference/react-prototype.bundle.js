/* @ds-bundle: {"format":4,"namespace":"Wishlight","components":[{"name":"Button"},{"name":"MicButton"},{"name":"EmotionTag"},{"name":"DialogueBox"},{"name":"ChatBubble"},{"name":"ChatComposer"},{"name":"ConversationItem"},{"name":"Toggle"}]} */
(function () {
  var React = window.React, h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }

  var PATHS = {
    star: "M12 2 C12.6 8 16 11.4 22 12 C16 12.6 12.6 16 12 22 C11.4 16 8 12.6 2 12 C8 11.4 11.4 8 12 2 Z",
    mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3",
    send: "M4 12 20 4l-5 16-3.5-6.5L4 12Zm7.5 1.5L20 4",
    play: "M8 5v14l11-7L8 5Z",
    check: "M5 12.5 10 17l9-10",
    trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
    chevron: "M6 9l6 6 6-6",
    wave: "M4 12h1M8 8v8M12 5v14M16 8v8M20 12h0"
  };
  var FILLED = { star: 1, play: 1 };
  function Icon(props) {
    var n = props.name, filled = FILLED[n];
    return h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", className: props.className,
      fill: filled ? "currentColor" : "none", stroke: filled ? "none" : "currentColor",
      strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }, h("path", { d: PATHS[n] }));
  }

  function Button(p) {
    var variant = p.variant || "primary", icon = p.icon === undefined ? "star" : p.icon;
    var rest = Object.assign({}, p); delete rest.variant; delete rest.icon; delete rest.children; delete rest.className;
    return h("button", Object.assign({ type: "button" }, rest, {
      className: cx("wl-btn", "wl-btn-" + variant, !icon && "wl-btn-noicon", p.className)
    }), icon ? h("span", { className: "wl-btn-ico" }, h(Icon, { name: icon })) : null, p.children);
  }

  var MIC_LABEL = { idle: "Nhấn để nói", listening: "Đang nghe…", thinking: "Đang nghĩ…", speaking: "Đang nói" };
  function MicButton(p) {
    var state = p.state || "idle";
    var btn = h("button", { type: "button", className: cx("wl-mic", "wl-mic-" + state, p.className), onClick: p.onClick,
      "aria-label": MIC_LABEL[state], "aria-pressed": state === "listening" },
      h(Icon, { name: state === "speaking" ? "wave" : "mic" }));
    if (!p.showLabel) return btn;
    return h("span", { className: "wl-mic-wrap" }, btn, h("span", { "aria-live": "polite" }, p.label || MIC_LABEL[state]));
  }

  var EMO = { neutral: "Bình thường", happy: "Vui", relaxed: "Thư thái", sad: "Buồn", surprised: "Ngạc nhiên", angry: "Dỗi" };
  function EmotionTag(p) {
    var e = p.emotion || "neutral";
    return h("span", { className: cx("wl-emo", p.onNight && "wl-emo-onnight") },
      h("span", { className: "wl-emo-dot", style: { background: "var(--emo-" + e + ")" } }), p.children || EMO[e]);
  }

  function DialogueBox(p) {
    function ctrl(label, pressed, fn) {
      return h("button", { type: "button", className: "wl-dlg-ctrl", "aria-pressed": pressed, onClick: fn }, label);
    }
    return h("section", { className: cx("wl-dlg", p.className), "aria-label": "Lời thoại", onClick: p.onNext },
      h("div", { className: "wl-dlg-ctrls", onClick: function (e) { e.stopPropagation(); } },
        ctrl("AUTO", !!p.auto, p.onToggleAuto), ctrl("LOG", undefined, p.onLog), ctrl("SKIP", undefined, p.onSkip)),
      h("div", { className: "wl-dlg-head" },
        h("span", { className: "wl-dlg-name" }, p.speaker),
        p.emotion ? h(EmotionTag, { emotion: p.emotion, onNight: true }) : null,
        h("span", { className: "wl-dlg-rule", "aria-hidden": "true" })),
      h("p", { className: "wl-dlg-text", "aria-live": "polite" }, p.text,
        p.done === false ? null : h(Icon, { name: "star", className: "wl-dlg-caret" })),
      p.subtitle ? h("p", { className: "wl-dlg-sub" }, p.subtitle) : null);
  }

  function ChatBubble(p) {
    var from = p.from || "ai";
    var meta = [];
    if (from === "ai" && p.name) meta.push(h("span", { key: "n", className: "wl-msg-name" }, p.name));
    if (p.emotion) meta.push(h(EmotionTag, { key: "e", emotion: p.emotion }));
    if (p.time) meta.push(h("span", { key: "t" }, p.time));
    var body = p.typing
      ? h("div", { className: "wl-msg-body", "aria-label": "Đang soạn" }, h("span", { className: "wl-typing" }, h("i"), h("i"), h("i")))
      : h("p", { className: "wl-msg-body" }, p.children);
    return h("div", { className: cx("wl-msg", "wl-msg-" + from) },
      meta.length ? h("div", { className: "wl-msg-meta" }, meta) : null, body,
      p.voice ? h("button", { type: "button", className: "wl-voice", onClick: p.onPlay }, h(Icon, { name: "play" }), "Phát lại · " + p.voice) : null);
  }

  function ChatComposer(p) {
    return h("div", { className: "wl-composer" },
      h("textarea", { rows: 1, value: p.value, onChange: p.onChange, placeholder: p.placeholder || "Nhắn gì đó cho bạn đồng hành…", "aria-label": "Tin nhắn" }),
      h(MicButton, { state: p.micState || "idle", onClick: p.onMic }),
      h(Button, { variant: "primary", icon: null, className: "wl-send", onClick: p.onSend, "aria-label": "Gửi" }, h(Icon, { name: "send", className: "wl-send-ico", style: { width: 18, height: 18 } })));
  }

  function ConversationItem(p) {
    return h("button", { type: "button", className: "wl-conv", "aria-current": p.current ? "true" : undefined, onClick: p.onClick },
      h(Icon, { name: "star", className: "wl-conv-star" }),
      h("span", { className: "wl-conv-main" },
        h("span", { className: "wl-conv-title" }, h("span", null, p.title), h("span", { className: "wl-conv-time" }, p.time)),
        h("span", { className: "wl-conv-snip", style: { display: "block" } }, p.snippet)));
  }

  function Toggle(p) {
    return h("button", { type: "button", role: "switch", className: "wl-toggle", "aria-checked": !!p.checked,
      onClick: function () { if (p.onChange) p.onChange(!p.checked); } },
      h("span", { className: "wl-toggle-track" }, h("span", { className: "wl-toggle-thumb" })), p.label);
  }

  window.Wishlight = Object.assign(window.Wishlight || {}, {
    Button: Button, MicButton: MicButton, EmotionTag: EmotionTag, DialogueBox: DialogueBox,
    ChatBubble: ChatBubble, ChatComposer: ChatComposer, ConversationItem: ConversationItem, Toggle: Toggle, Icon: Icon
  });
})();
