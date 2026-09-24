export const STAGE_SEQUENCE = {
  intro: [
    { at: 5.05, clip: 'raise-hand', emotion: 'happy', label: 'Xin chào! Rất vui được gặp bạn.' },
    { at: 7.85, clip: 'happy', emotion: 'happy', label: 'Mình là {name}, bạn đồng hành của bạn!' },
    { at: 10.45, clip: 'nod', emotion: 'relaxed', label: 'Cùng bắt đầu một chuyến phiêu lưu nhỏ nhé!' },
    { at: 13, clip: 'relaxed', emotion: 'relaxed', label: 'Mình luôn ở đây khi bạn cần.' },
  ],
  demo: [
    { at: 0, clip: 'happy', emotion: 'happy', label: 'Vui vẻ · happy' },
    { at: 3.5, clip: 'raise-hand', emotion: 'happy', label: 'Vẫy chào · raise-hand' },
    { at: 7, clip: 'nod', emotion: 'relaxed', label: 'Gật đầu · nod' },
    { at: 10, clip: 'think', emotion: 'neutral', label: 'Suy nghĩ · think' },
    { at: 13.5, clip: 'shake', emotion: 'neutral', label: 'Lắc đầu · shake' },
    { at: 16.5, clip: 'sad', emotion: 'sad', label: 'Trầm lắng · sad' },
    { at: 20, clip: 'relaxed', emotion: 'relaxed', label: 'Thư giãn · relaxed' },
  ],
};

const INTRO_DURATION = 15.7;
const INTRO_ENTRANCE_DELAY = 5;

export class DemoSequence {
  constructor({ play, onCue, onEnd }) {
    this.play = play;
    this.onCue = onCue;
    this.onEnd = onEnd;
    this.steps = [];
    this.time = 0;
    this.next = 0;
    this.running = false;
    this.kind = null;
    this.duration = 0;
  }

  start(kind, { skipEntrance = false } = {}) {
    const entranceDelay = kind === 'intro' && skipEntrance ? INTRO_ENTRANCE_DELAY : 0;
    this.steps = (STAGE_SEQUENCE[kind] || []).map((cue) => ({ ...cue, at: cue.at - entranceDelay }));
    this.time = 0;
    this.next = 0;
    this.kind = kind;
    this.duration = (kind === 'intro' ? INTRO_DURATION : 23.5) - entranceDelay;
    this.running = this.steps.length > 0;
  }

  stop() {
    if (!this.running) return;
    const kind = this.kind;
    this.running = false;
    this.kind = null;
    this.onEnd?.(kind);
  }

  update(dt) {
    if (!this.running) return;
    this.time += dt;
    while (this.next < this.steps.length && this.time >= this.steps[this.next].at) {
      const cue = this.steps[this.next++];
      this.play(cue);
      this.onCue?.(cue, this.kind, this.next, this.steps.length);
    }
    if (this.time >= this.duration) this.stop();
  }
}
