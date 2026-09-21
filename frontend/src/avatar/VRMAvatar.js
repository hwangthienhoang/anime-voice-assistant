import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// Các cảm xúc trùng tên với expression preset của VRM
const EMOTIONS = ['happy', 'sad', 'angry', 'surprised', 'relaxed'];

// Góc hạ tay khỏi tư thế chữ T (radian). Nếu model của bạn bị giơ tay lên, đổi dấu của hằng số này.
const ARM_DOWN = 1.2;

// Vị trí camera (bán thân). Chỉnh ở đây nếu muốn cận/xa hơn.
const CAMERA = { y: 1.3, lookAtY: 1.22, minDistance: 1.9 };

export class VRMAvatar {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.vrm = null;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);

    const key = new THREE.DirectionalLight(0xffffff, Math.PI);
    key.position.set(1, 1.2, 1.5).normalize();
    this.scene.add(key, new THREE.AmbientLight(0xffffff, 0.6));

    // Điểm mà mắt nhân vật nhìn theo (bám theo con trỏ chuột)
    this.lookTarget = new THREE.Object3D();
    this.scene.add(this.lookTarget);
    this.pointer = { x: 0, y: 0 };
    this.pointerSmooth = { x: 0, y: 0 };
    window.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    });

    // Trạng thái biểu cảm / miệng
    this.emotionTarget = 'neutral';
    this.emotionWeights = Object.fromEntries(EMOTIONS.map((e) => [e, 0]));
    this.mouthTarget = 0;
    this.mouth = 0;

    // Chớp mắt
    this.blinkTimer = 2;
    this.blinkT = -1;

    /** Gọi mỗi khung hình trước khi cập nhật, để bên ngoài đẩy dữ liệu (vd. âm lượng) vào. */
    this.onBeforeUpdate = null;

    this.clock = new THREE.Clock();
    this._resize = this._resize.bind(this);
    new ResizeObserver(this._resize).observe(canvas.parentElement);
    this._resize();
  }

  /** Tải model VRM từ URL (đường dẫn hoặc blob URL). */
  async load(url) {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const gltf = await loader.loadAsync(url);

    const vrm = gltf.userData.vrm;
    if (!vrm) throw new Error('File này không phải VRM hợp lệ.');

    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.rotateVRM0(vrm); // model VRM 0.x quay mặt ngược hướng, hàm này xoay lại
    vrm.scene.traverse((o) => (o.frustumCulled = false));

    if (this.vrm) {
      this.scene.remove(this.vrm.scene);
      VRMUtils.deepDispose(this.vrm.scene);
    }
    this.vrm = vrm;
    this.scene.add(vrm.scene);

    if (vrm.lookAt) vrm.lookAt.target = this.lookTarget;
    this._applyRestPose();
  }

  /** @param {'neutral'|'happy'|'sad'|'angry'|'surprised'|'relaxed'} name */
  setEmotion(name) {
    this.emotionTarget = EMOTIONS.includes(name) ? name : 'neutral';
  }

  /** @param {number} v độ mở miệng 0..1 */
  setMouth(v) {
    this.mouthTarget = Math.max(0, Math.min(1, v));
  }

  start() {
    const tick = () => {
      requestAnimationFrame(tick);
      const dt = Math.min(this.clock.getDelta(), 0.1);
      this.onBeforeUpdate?.(dt);
      this._update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  // ------------------------------------------------------------------

  _bone(name) {
    return this.vrm?.humanoid?.getNormalizedBoneNode(name) ?? null;
  }

  _expr(name, value) {
    const em = this.vrm?.expressionManager;
    if (em?.getExpression(name)) em.setValue(name, value);
  }

  _applyRestPose() {
    const set = (bone, axis, v) => {
      const n = this._bone(bone);
      if (n) n.rotation[axis] = v;
    };
    set('leftUpperArm', 'z', -ARM_DOWN);
    set('rightUpperArm', 'z', ARM_DOWN);
    set('leftLowerArm', 'z', -0.08);
    set('rightLowerArm', 'z', 0.08);
  }

  _update(dt) {
    const vrm = this.vrm;
    if (!vrm) return;
    const t = this.clock.elapsedTime;
    const k = (speed) => Math.min(1, dt * speed);

    // Con trỏ (làm mượt) -> mắt và đầu
    this.pointerSmooth.x += (this.pointer.x - this.pointerSmooth.x) * k(4);
    this.pointerSmooth.y += (this.pointer.y - this.pointerSmooth.y) * k(4);
    this.lookTarget.position.set(
      this.pointerSmooth.x * 0.6,
      1.35 + this.pointerSmooth.y * 0.3,
      this.camera.position.z
    );

    // Biểu cảm: chuyển mượt giữa các trạng thái
    for (const e of EMOTIONS) {
      const target = e === this.emotionTarget ? (e === 'angry' ? 0.6 : 0.85) : 0;
      this.emotionWeights[e] += (target - this.emotionWeights[e]) * k(6);
      this._expr(e, this.emotionWeights[e]);
    }

    // Chớp mắt ngẫu nhiên
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0 && this.blinkT < 0) this.blinkT = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const p = this.blinkT / 0.18;
      if (p >= 1) {
        this.blinkT = -1;
        this.blinkTimer = 2 + Math.random() * 4;
        this._expr('blink', 0);
      } else {
        this._expr('blink', 1 - Math.abs(2 * p - 1));
      }
    }

    // Khẩu hình: miệng mở theo biên độ âm thanh, thêm chút biến thiên cho tự nhiên
    this.mouth += (this.mouthTarget - this.mouth) * k(22);
    const m = this.mouth;
    this._expr('aa', m * 0.9);
    this._expr('oh', m * 0.25 * (0.5 + 0.5 * Math.sin(t * 11)));
    this._expr('ih', m * 0.15 * (0.5 + 0.5 * Math.cos(t * 7)));

    // Thở, lắc nhẹ và nhìn theo con trỏ
    const spine = this._bone('spine');
    if (spine) spine.rotation.x = Math.sin(t * 1.6) * 0.012;
    const chest = this._bone('chest');
    if (chest) chest.rotation.x = Math.sin(t * 1.6 + 0.4) * 0.01;

    const head = this._bone('head');
    if (head) {
      head.rotation.y = this.pointerSmooth.x * 0.25 + Math.sin(t * 0.5) * 0.03;
      head.rotation.x = -this.pointerSmooth.y * 0.15 + m * 0.05 * Math.sin(t * 6);
      head.rotation.z = Math.sin(t * 0.7) * 0.015;
    }

    vrm.update(dt);
  }

  _resize() {
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || 1;
    const h = parent.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;

    // Màn hình hẹp thì lùi camera ra để không cắt mất nhân vật
    const distance = Math.max(CAMERA.minDistance, 1.3 / this.camera.aspect);
    this.camera.position.set(0, CAMERA.y, distance);
    this.camera.lookAt(0, CAMERA.lookAtY, 0);
    this.camera.updateProjectionMatrix();
  }
}
