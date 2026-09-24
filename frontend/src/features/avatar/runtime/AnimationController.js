import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation';
import { createUpperBodyClip } from './StageMix.js';

// Keep the opening sequence ready; load the rest of the catalogue on selection.
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
    this.clipFiles = {};
    this.catalogue = [];
    this.mixes = [];
    this.mix = null;
    this.mixActions = new Map();
    this.pending = new Map();
    this.manifestUrl = null;
    this.loader = null;
  }

  async load(vrm, baseUrl = import.meta.env.BASE_URL) {
    const manifestUrl = `${baseUrl}animations/animations.json`;
    const response = await fetch(manifestUrl, { signal: this.abort.signal });
    if (!response.ok) throw new Error(`Không tải được animation manifest (${response.status}).`);
    const manifest = await response.json();
    this.clipFiles = manifest.clips || {};
    this.catalogue = Array.isArray(manifest.catalogue) ? manifest.catalogue : [];
    this.mixes = Array.isArray(manifest.mixes) ? manifest.mixes : [];
    this.vrm = vrm;
    this.manifestUrl = new URL(manifestUrl, location.href);
    this.loader = new GLTFLoader();
    this.loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    this.mixer = new THREE.AnimationMixer(vrm.scene);
    const results = await Promise.allSettled(STAGE_CLIPS.map((name) => this.ensureClip(name, vrm)));
    if (this.disposed) return;
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`[stage] ${STAGE_CLIPS[index]}:`, result.reason);
      }
    });
    if (!this.actions.has('idle')) throw new Error('Không tải được animation idle.');
    this.play('idle', { loop: true, fadeSeconds: 0 });
  }

  get available() { return [...this.actions.keys()]; }

  async ensureClip(name, vrm) {
    if (this.disposed) return false;
    if (this.actions.has(name)) return true;
    if (this.pending.has(name)) return this.pending.get(name);
    const file = this.clipFiles[name];
    if (!file) throw new Error(`Thiếu clip ${name} trong manifest.`);
    const task = (async () => {
      const clipUrl = new URL(file, this.manifestUrl);
      const response = await fetch(clipUrl, { signal: this.abort.signal });
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      const gltf = await this.loader.parseAsync(await response.arrayBuffer(), new URL('.', clipUrl).href);
      if (this.disposed) return false;
      const animation = gltf.userData.vrmAnimations?.[0];
      if (!animation) throw new Error(`${file} không có VRM animation hợp lệ.`);
      this.actions.set(name, this.mixer.clipAction(createVRMAnimationClip(animation, vrm)));
      return true;
    })().finally(() => this.pending.delete(name));
    this.pending.set(name, task);
    return task;
  }

  replaceClip(name, clip) {
    if (!this.mixer || this.disposed) return false;
    this.stopMix();
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
    this.stopMix();
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

  playMix(base, gesture) {
    if (!this.actions.has(base) || !this.actions.has(gesture) || !this.vrm) return false;
    let overlay = this.mixActions.get(gesture);
    if (!overlay) {
      const clip = createUpperBodyClip(this.actions.get(gesture).getClip(), this.vrm);
      if (!clip.tracks.length) return false;
      overlay = this.mixer.clipAction(clip);
      this.mixActions.set(gesture, overlay);
    }
    this.play(base, { loop: true });
    overlay.stop().reset();
    overlay.enabled = true;
    overlay.clampWhenFinished = false;
    overlay.setLoop(THREE.LoopOnce, 1);
    overlay.setEffectiveWeight(0);
    overlay.play();
    this.mix = { overlay, time: 0, duration: overlay.getClip().duration, pause: 0.9 };
    return true;
  }

  stopMix() {
    this.mix?.overlay.stop();
    this.mix = null;
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
    if (this.mix) {
      const mix = this.mix;
      mix.time += dt;
      if (mix.time >= mix.duration + mix.pause) {
        mix.overlay.stop().reset().play();
        mix.time = 0;
      }
      const fadeIn = Math.min(1, mix.time / 0.28);
      const fadeOut = Math.min(1, Math.max(0, mix.duration - mix.time) / 0.34);
      mix.overlay.setEffectiveWeight(0.7 * Math.min(fadeIn, fadeOut));
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
    this.pending.clear();
    this.catalogue = [];
    this.mixes = [];
    this.mixActions.clear();
    this.mix = null;
    this.vrm = null;
    this.clipFiles = {};
    this.loader = null;
    this.current = null;
    this.fade = null;
    this.mixer = null;
  }
}
