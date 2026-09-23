import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const between = ([a, b]) => a + Math.random() * (b - a);

/**
 * Phát animation .vrma lên một model VRM.
 *
 * - Clip là dữ liệu chung: cùng một file .vrma chạy được trên mọi model VRM (retarget theo
 *   tên xương chuẩn), nên controller chỉ cần nhận `vrm` khi bind.
 * - Một model có nhiều "bộ" (set) trong animations.json: mỗi bộ khai báo clip cho idle,
 *   khi nói, cử chỉ (nod/shake/think) và ánh xạ cảm xúc -> clip. Đổi bằng `useSet(name)`.
 * - Có hai lớp: lớp nền lặp (idle hoặc talking) và lớp cử chỉ phát một lần rồi tự về lớp nền,
 *   luôn chuyển mượt bằng crossfade.
 */
export class AnimationController {
  /** @param {string} configUrl */
  constructor(configUrl = '/animations/animations.json') {
    this.configUrl = configUrl;
    this.config = null;
    this.vrm = null;
    this.mixer = null;
    this.clips = new Map(); // tên -> AnimationClip (đã retarget cho model hiện tại)
    this.vrmAnimations = new Map(); // tên -> VRMAnimation (dữ liệu gốc, dùng lại khi đổi model)
    this.actions = new Map();
    this.setName = null;
    this.set = null;
    this.current = null; // action đang phát
    this.baseKind = 'idle'; // 'idle' | 'talking'
    this.gestureActive = false;
    this.idleTimer = 0;
    this.ready = false;
    this.fade = 0.5;
    this.gestureMax = 3; // giây: cử chỉ dài hơn thì cắt và về lớp nền
    this.gestureTimer = 0;
    // Chuyển cảnh (crossfade) tự quản lý bằng tay: KHÔNG dùng crossFadeTo/fadeIn/fadeOut có sẵn của
    // three.js. Lý do: những hàm đó lên lịch nội suy trọng số theo đồng hồ riêng của mixer và cứ thế
    // cộng dồn nếu một action được TÁI SỬ DỤNG (bật lại) trước khi lịch cũ của nó kết thúc hẳn — với
    // cử chỉ hay bị ngắt giữa chừng (gestureMax) và bật lại nhiều lần (vd. "happy" phát đi phát lại),
    // điều đó khiến nhiều action cùng góp trọng số vào một xương (đầu/cổ) làm nó xoay rất kỳ dị. Thay
    // vào đó, mỗi khung hình ta tự đặt weight bằng `setEffectiveWeight` theo đúng một cặp (from, to)
    // — không bao giờ có quá 2 action ảnh hưởng cùng lúc — và `stop()` action cũ ngay khi mờ xong.
    this.fading = null; // { from: AnimationAction|null, to: AnimationAction, t: 0 }
  }

  /** Tải config và toàn bộ clip. Lỗi (thiếu file...) không ném ra ngoài: `ready` chỉ đơn giản = false. */
  async loadLibrary() {
    try {
      const res = await fetch(this.configUrl);
      if (!res.ok) throw new Error(`${this.configUrl}: ${res.status}`);
      this.config = await res.json();
      this.fade = this.config.fadeSeconds ?? 0.5;
      this.gestureMax = this.config.gestureMaxSeconds ?? 3;

      const base = new URL(this.configUrl, location.href);
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
      await Promise.all(
        Object.entries(this.config.clips).map(async ([name, file]) => {
          try {
            const gltf = await loader.loadAsync(new URL(file, base).href);
            const anim = gltf.userData.vrmAnimations?.[0];
            if (anim) this.vrmAnimations.set(name, anim);
          } catch (err) {
            console.warn(`[animation] không tải được clip "${name}":`, err.message);
          }
        })
      );
      return this.vrmAnimations.size > 0;
    } catch (err) {
      console.warn('[animation] tắt phát VRMA, dùng chuyển động code:', err.message);
      return false;
    }
  }

  /** Gắn controller vào model (gọi lại mỗi khi đổi model). */
  bind(vrm) {
    this.dispose();
    this.vrm = vrm;
    if (this.vrmAnimations.size === 0) return;
    this.mixer = new THREE.AnimationMixer(vrm.scene);
    this.mixer.addEventListener('finished', (e) => this._onFinished(e.action));
    for (const [name, anim] of this.vrmAnimations) {
      this.clips.set(name, createVRMAnimationClip(anim, vrm));
    }
    this.ready = true;
    this.useSet(this.setName ?? this.config.defaultSet);
  }

  dispose() {
    this.mixer?.stopAllAction();
    this.actions.clear();
    this.clips.clear();
    this.current = null;
    this.fading = null; // action cũ thuộc mixer sắp bị huỷ, đừng giữ tham chiếu lại
    this.mixer = null;
    this.ready = false;
  }

  /** Đổi bộ animation (khai báo trong animations.json > sets). */
  useSet(name) {
    const set = this.config?.sets?.[name];
    if (!set) return console.warn(`[animation] không có bộ "${name}"`);
    this.setName = name;
    this.set = set;
    this.gestureActive = false;
    this._playBase(this.baseKind);
  }

  /** Cập nhật mỗi khung hình. `speaking` = đang phát giọng nói. */
  update(dt, speaking) {
    if (!this.ready) return;
    const kind = speaking ? 'talking' : 'idle';
    if (kind !== this.baseKind) {
      this.baseKind = kind;
      if (!this.gestureActive) this._playBase(kind); // cử chỉ đang chạy thì chờ nó xong
    }
    if (this.gestureActive) {
      this.gestureTimer -= dt;
      if (this.gestureTimer <= 0) this.stopGesture();
    }
    // Định kỳ đổi sang clip idle khác để không lặp một vòng mãi
    if (!this.gestureActive && this.baseKind === 'idle' && this.set.idle.length > 1) {
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) this._playBase('idle');
    }
    this._updateFade(dt);
    this.mixer.update(dt);
  }

  /** Phát cử chỉ theo tên nhóm (vd. 'nod', 'think'). */
  playGesture(name) {
    return this._playGesture(this.set?.gestures?.[name]);
  }

  /** Phát cử chỉ theo cảm xúc (happy, sad...). 'neutral' hoặc cảm xúc chưa khai báo thì bỏ qua. */
  playEmotion(name) {
    return this._playGesture(this.set?.emotions?.[name]);
  }

  /** Dừng cử chỉ đang chạy và về lớp nền (idle hoặc talking). */
  stopGesture() {
    if (!this.gestureActive) return;
    this.gestureActive = false;
    this._playBase(this.baseKind);
  }

  // ------------------------------------------------------------------

  _action(name) {
    let a = this.actions.get(name);
    if (!a) {
      const clip = this.clips.get(name);
      if (!clip) return null;
      a = this.mixer.clipAction(clip);
      this.actions.set(name, a);
    }
    return a;
  }

  _transitionTo(action, { loop }) {
    if (!action || action === this.current) return;
    action.stop(); // xoá sạch lịch fade/thời gian còn sót nếu action này từng được dùng trước đó
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    action.clampWhenFinished = true; // giữ pose cuối trong lúc mờ về lớp nền
    action.enabled = true;
    action.play();

    const from = this.current;
    if (from) {
      // Đang mờ dở một cặp khác thì action cũ hơn nữa (fading.from) bị cắt hẳn ngay, không kịp
      // chồng thêm một action thứ ba vào việc trộn xương.
      if (this.fading && this.fading.from && this.fading.from !== from) this.fading.from.stop();
      action.setEffectiveWeight(0); // sẽ tăng dần trong update()
      this.fading = { from, to: action, t: 0 };
    } else {
      action.setEffectiveWeight(1); // action đầu tiên, không có gì để mờ từ
      this.fading = null;
    }
    this.current = action;
  }

  /** Nội suy trọng số của cặp (from, to) đang mờ; dừng hẳn `from` khi mờ xong. */
  _updateFade(dt) {
    if (!this.fading) return;
    this.fading.t += dt;
    const p = this.fade > 0 ? Math.min(1, this.fading.t / this.fade) : 1;
    this.fading.to.setEffectiveWeight(p);
    this.fading.from.setEffectiveWeight(1 - p);
    if (p >= 1) {
      this.fading.from.stop();
      this.fading = null;
    }
  }

  _playBase(kind) {
    const names = kind === 'talking' ? this.set.talking : this.set.idle;
    if (!names?.length) return;
    // tránh chọn lại đúng clip đang phát
    const currentName = this.current && [...this.actions].find(([, a]) => a === this.current)?.[0];
    const candidates = names.length > 1 ? names.filter((n) => n !== currentName) : names;
    this._transitionTo(this._action(pick(candidates)), { loop: true });
    this.idleTimer = between(this.set.idleSwitchSeconds ?? [20, 45]);
  }

  _playGesture(names) {
    if (!this.ready || !names?.length) return false;
    const action = this._action(pick(names));
    if (!action) return false;
    this.gestureActive = true;
    this.gestureTimer = Math.min(this.gestureMax, action.getClip().duration);
    this._transitionTo(action, { loop: false });
    return true;
  }

  _onFinished(action) {
    if (action !== this.current || !this.gestureActive) return;
    this.gestureActive = false;
    this._playBase(this.baseKind); // về lớp nền phù hợp trạng thái hiện tại (idle hoặc talking)
  }
}
