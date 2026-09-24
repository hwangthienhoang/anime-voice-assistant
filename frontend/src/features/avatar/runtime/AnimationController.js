import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation';

// Only fetch clips used by this stage. The manifest remains the source of asset paths.
const STAGE_CLIPS = ['idle', 'happy', 'raise-hand', 'nod', 'think', 'relaxed', 'shake', 'sad', 'idle-talking'];

export class AnimationController {
  constructor() {
    this.mixer = null;
    this.actions = new Map();
    this.current = null;
    this.fade = null;
    this.gestureUntil = 0;
    this.elapsed = 0;
    this.disposed = false;
    this.abort = new AbortController();
  }

  async load(vrm, baseUrl = import.meta.env.BASE_URL) {
    const manifestUrl = `${baseUrl}animations/animations.json`;
    const response = await fetch(manifestUrl, { signal: this.abort.signal });
    if (!response.ok) throw new Error(`Không tải được animation manifest (${response.status}).`);
    const manifest = await response.json();
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    const results = await Promise.allSettled(STAGE_CLIPS.map(async (name) => {
      const file = manifest.clips?.[name];
      if (!file) throw new Error(`Thiếu clip ${name} trong manifest.`);
      const clipUrl = new URL(file, new URL(manifestUrl, location.href));
      const clipResponse = await fetch(clipUrl, { signal: this.abort.signal });
      if (!clipResponse.ok) throw new Error(`HTTP ${clipResponse.status}`);
      const buffer = await clipResponse.arrayBuffer();
      if (this.disposed) return null;
      const gltf = await loader.parseAsync(buffer, new URL('.', clipUrl).href);
      if (this.disposed) return null;
      const animation = gltf.userData.vrmAnimations?.[0];
      if (!animation) throw new Error(`Clip ${name} không hợp lệ.`);
      return [name, createVRMAnimationClip(animation, vrm)];
    }));
    if (this.disposed) return;
    this.mixer = new THREE.AnimationMixer(vrm.scene);
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const [name, clip] = result.value;
        this.actions.set(name, this.mixer.clipAction(clip));
      } else {
        console.warn(`[stage] ${STAGE_CLIPS[index]}:`, result.reason);
      }
    });
    if (!this.actions.has('idle')) throw new Error('Không tải được animation idle.');
    this.play('idle', { loop: true, fadeSeconds: 0 });
  }

  get available() { return [...this.actions.keys()]; }

  replaceClip(name, clip) {
    if (!this.mixer || this.disposed) return false;
    const previous = this.actions.get(name);
    if (previous) {
      if (this.fade) {
        this.fade.from.stop();
        this.fade.to.stop();
        this.fade = null;
      }
      if (this.current === previous) this.current = null;
      previous.stop();
      this.mixer.uncacheAction(previous.getClip());
    }
    this.actions.set(name, this.mixer.clipAction(clip));
    return true;
  }

  play(name, { loop = false, fadeSeconds = 0.42, maxSeconds = 0 } = {}) {
    const action = this.actions.get(name);
    if (!action) return false;
    if (action === this.current && loop) return true;
    if (this.fade?.from && this.fade.from !== this.current) this.fade.from.stop();
    const from = action === this.current ? null : this.current;
    action.stop();
    action.reset();
    action.enabled = true;
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    action.clampWhenFinished = !loop;
    action.setEffectiveWeight(from && fadeSeconds ? 0 : 1);
    action.play();
    this.current = action;
    this.fade = from && fadeSeconds ? { from, to: action, duration: fadeSeconds, time: 0 } : null;
    if (from && !this.fade) from.stop();
    this.gestureUntil = loop ? 0 : this.elapsed + Math.min(maxSeconds || action.getClip().duration, action.getClip().duration);
    return true;
  }

  idle() { this.play('idle', { loop: true }); }

  update(dt) {
    if (!this.mixer) return;
    this.elapsed += dt;
    if (this.fade) {
      this.fade.time += dt;
      const p = Math.min(1, this.fade.time / this.fade.duration);
      this.fade.from.setEffectiveWeight(1 - p);
      this.fade.to.setEffectiveWeight(p);
      if (p === 1) {
        this.fade.from.stop();
        this.fade = null;
      }
    }
    this.mixer.update(dt);
    if (this.gestureUntil && this.elapsed >= this.gestureUntil) this.idle();
  }

  dispose() {
    this.disposed = true;
    this.abort.abort();
    this.mixer?.stopAllAction();
    this.mixer?.uncacheRoot(this.mixer.getRoot());
    this.actions.clear();
    this.current = null;
    this.fade = null;
    this.mixer = null;
  }
}
