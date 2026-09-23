/**
 * Nhận diện giọng nói bằng Web Speech API (Chrome, Edge, Safari).
 * Đây là giải pháp MVP: miễn phí, không cần backend.
 * Khi cần chất lượng/độ ổn định cao hơn, thay lớp này bằng VAD + Whisper/Deepgram
 * nhưng giữ nguyên giao diện (start, stop, pause, resume, callbacks).
 */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export class SpeechInput {
  /**
   * @param {object} opts
   * @param {string} [opts.lang]
   * @param {(text: string) => void} opts.onFinal    có câu hoàn chỉnh
   * @param {(text: string) => void} [opts.onInterim] đang nói dở
   * @param {(active: boolean) => void} [opts.onStateChange]
   * @param {(message: string) => void} [opts.onError]
   */
  constructor({ lang = 'vi-VN', onFinal, onInterim, onStateChange, onError }) {
    this.lang = lang;
    this.onFinal = onFinal;
    this.onInterim = onInterim;
    this.onStateChange = onStateChange;
    this.onError = onError;

    this.enabled = false; // người dùng đã bật micro
    this.paused = false; // tạm dừng (khi avatar đang nói)
    this.rec = null;
  }

  static get supported() {
    return Boolean(SpeechRecognition);
  }

  start() {
    if (!SpeechInput.supported) {
      this.onError?.('Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge.');
      return;
    }
    this.enabled = true;
    this.paused = false;
    this.onStateChange?.(true);
    this._listen();
  }

  stop() {
    this.enabled = false;
    this.onStateChange?.(false);
    this._abort();
  }

  /** Tạm ngừng nghe để micro không thu lại giọng của avatar. */
  pause() {
    this.paused = true;
    this._abort();
  }

  resume() {
    this.paused = false;
    if (this.enabled) this._listen();
  }

  _abort() {
    if (this.rec) {
      this.rec.onend = null;
      this.rec.abort();
      this.rec = null;
    }
  }

  _listen() {
    if (this.rec || this.paused || !this.enabled) return;

    const rec = new SpeechRecognition();
    rec.lang = this.lang;
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        (r.isFinal ? (final += r[0].transcript) : (interim += r[0].transcript));
      }
      if (interim) this.onInterim?.(interim.trim());
      if (final.trim()) this.onFinal(final.trim());
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        this.onError?.('Chưa được cấp quyền dùng micro. Hãy cho phép micro trong thanh địa chỉ của trình duyệt.');
        this.stop();
      } else {
        this.onError?.(`Lỗi nhận diện giọng nói: ${e.error}`);
      }
    };

    // Chế độ không liên tục kết thúc sau mỗi câu, nên tự mở lại nếu vẫn đang bật
    rec.onend = () => {
      this.rec = null;
      if (this.enabled && !this.paused) setTimeout(() => this._listen(), 150);
    };

    this.rec = rec;
    try {
      rec.start();
    } catch {
      this.rec = null;
    }
  }
}
