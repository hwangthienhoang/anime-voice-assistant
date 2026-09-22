/**
 * Phát audio (mp3/wav...) qua Web Audio API và cung cấp `level` (0..1)
 * theo thời gian thực để điều khiển khẩu hình của avatar.
 */
export class AudioPlayer {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.buffer = null;
    this.source = null;
    this._finish = null;
  }

  get playing() {
    return this.source !== null;
  }

  async _ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.5;
      this.analyser.connect(this.ctx.destination);
      this.buffer = new Uint8Array(this.analyser.fftSize);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  /** Phát xong (hoặc bị stop) thì promise mới resolve. */
  async play(arrayBuffer, { onDecoded } = {}) {
    await this._ensureContext();
    this.stop();

    const decoded = await this.ctx.decodeAudioData(arrayBuffer);
    onDecoded?.(decoded.duration);
    const source = this.ctx.createBufferSource();
    source.buffer = decoded;
    source.connect(this.analyser);
    this.source = source;

    return new Promise((resolve) => {
      this._finish = () => {
        if (this.source === source) this.source = null;
        this._finish = null;
        resolve();
      };
      source.onended = this._finish;
      source.start();
    });
  }

  /** Dừng ngay (dùng khi người dùng ngắt lời). */
  stop() {
    const finish = this._finish;
    if (this.source) {
      this.source.onended = null;
      try {
        this.source.stop();
      } catch {
        /* đã dừng */
      }
    }
    this.source = null;
    finish?.();
  }

  /** Âm lượng hiện tại, đã chuẩn hóa về 0..1 (RMS). */
  get level() {
    if (!this.analyser || !this.playing) return 0;
    this.analyser.getByteTimeDomainData(this.buffer);
    let sum = 0;
    for (const v of this.buffer) {
      const x = (v - 128) / 128;
      sum += x * x;
    }
    const rms = Math.sqrt(sum / this.buffer.length);
    return Math.min(1, rms * 5);
  }
}
