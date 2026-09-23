// Kịch bản demo ~21 giây để xem animation khi chưa nối backend/giọng nói.
// Mỗi bước chạy đúng thời điểm `at` (giây): đổi cảm xúc, phát cử chỉ, hoặc "nói" giả lập
// (mô phỏng biên độ âm thanh để miệng mấp máy và avatar chuyển sang clip nói).

export const DEMO_STEPS = [
  // Đổi thứ tự để cô lập "happy" (vỗ tay): cho nó chạy NGAY ĐẦU, một mình, ngay từ idle —
  // chưa có cử chỉ nào khác chạy trước đó — để thấy lỗi (nếu còn) xảy ra ngay từ lần phát đầu
  // tiên hay chỉ xuất hiện sau khi đã đổi qua lại nhiều clip. Sau đó lặp lại "happy" lần hai
  // (sau khi đã phát nod/think/sad) để so sánh lần đầu và lần lặp lại.
  { at: 0.0, label: 'Đứng nghỉ (idle)' },
  { at: 1.0, label: '[TEST 1] Vỗ tay — lần đầu tiên, ngay từ idle', emotion: 'happy' },
  { at: 5.0, label: 'Gật đầu chào', gesture: 'nod' },
  { at: 7.0, label: 'Vui vẻ + đang nói (clip nói)', emotion: 'happy', face: true, say: 2.8 },
  { at: 10.6, label: 'Suy nghĩ', emotion: 'neutral', face: true, gesture: 'think' },
  { at: 13.4, label: 'Buồn + đang nói (clip nói)', emotion: 'sad', face: true, say: 2.4 },
  { at: 16.6, label: '[TEST 2] Vỗ tay — lần lặp lại, sau khi đã đổi qua nhiều clip', emotion: 'happy' },
  { at: 20.6, label: 'Kết thúc demo', emotion: 'neutral', end: true },
];

export class DemoSequence {
  /**
   * @param {import('./VRMAvatar.js').VRMAvatar} avatar
   * @param {{onStep?: (label: string) => void, onEnd?: () => void}} hooks
   */
  constructor(avatar, hooks = {}) {
    this.avatar = avatar;
    this.hooks = hooks;
    this.running = false;
    this.t0 = 0;
    this.next = 0;
    this.sayFrom = 0;
    this.sayUntil = 0;
  }

  start() {
    this.running = true;
    this.t0 = performance.now() / 1000;
    this.next = 0;
    this.sayUntil = 0;
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.avatar.setEmotion('neutral');
    this.avatar.animations.stopGesture();
    this.hooks.onEnd?.();
  }

  /** Gọi mỗi khung hình; trả về độ mở miệng 0..1 đang giả lập, hoặc null nếu demo không chạy. */
  tick() {
    if (!this.running) return null;
    const t = performance.now() / 1000 - this.t0;

    while (this.next < DEMO_STEPS.length && t >= DEMO_STEPS[this.next].at) {
      const step = DEMO_STEPS[this.next++];
      this.hooks.onStep?.(step.label);
      if (step.emotion) this.avatar.setEmotion(step.emotion, { gesture: !step.face });
      if (step.gesture) this.avatar.playGesture(step.gesture);
      if (step.say) {
        this.sayFrom = t;
        this.sayUntil = t + step.say;
      }
      if (step.end) {
        this.stop();
        return null;
      }
    }

    if (t < this.sayUntil) {
      // Tiếng "ba-ba" ~3.4 âm tiết/giây, có nhấn nhá và nghỉ giữa câu như lời nói thật
      const local = t - this.sayFrom;
      const syllable = Math.abs(Math.sin(local * Math.PI * 3.4));
      const phrase = 0.65 + 0.35 * Math.sin(local * 1.9);
      const pause = Math.sin(local * 0.9 + 1) > -0.85 ? 1 : 0.15;
      return Math.min(1, 0.12 + 0.75 * syllable * phrase) * pause;
    }
    return this.sayUntil ? 0 : null;
  }
}
