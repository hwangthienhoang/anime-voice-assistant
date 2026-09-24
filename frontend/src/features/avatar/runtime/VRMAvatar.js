import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { AnimationController } from './AnimationController.js';
import { DemoSequence, STAGE_SEQUENCE } from './DemoSequence.js';
import { createEntranceClip } from './EntranceMotion.js';

const EXPRESSIONS = ['happy', 'sad', 'relaxed'];

export class VRMAvatar {
  constructor(container, { onCue, onSequenceEnd } = {}) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9daac0, 2.4));
    const key = new THREE.DirectionalLight(0xffebd0, 3.3);
    key.position.set(2, 4, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xb2c7ff, 2.4);
    rim.position.set(-3, 2, -3);
    this.scene.add(rim);

    this.vrm = null;
    this.modelAbort = new AbortController();
    this.basePosition = new THREE.Vector3();
    this.baseQuaternion = new THREE.Quaternion();
    this.restBones = new Map();
    this.modelBounds = null;
    this.floatTime = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.animations = new AnimationController();
    this.sequence = new DemoSequence({
      play: (cue) => this.play(cue.clip, cue.emotion),
      onCue,
      onEnd: onSequenceEnd,
    });
    this.emotion = 'neutral';
    this.expressionWeights = Object.fromEntries(EXPRESSIONS.map((name) => [name, 0]));
    this.blinkTime = 2.2;
    this.blinkPhase = -1;
    this.clock = new THREE.Clock();
    this.raf = 0;
    this.disposed = false;
    this.frame = null;
    this.zoom = 1;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      } else {
        this.clock.getDelta();
        this.start();
      }
    };
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
    this.start();
  }

  async load(url) {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const modelUrl = new URL(url, location.href);
    const response = await fetch(modelUrl, { signal: this.modelAbort.signal });
    if (!response.ok) throw new Error(`Không tải được model (${response.status}).`);
    const gltf = await loader.parseAsync(await response.arrayBuffer(), new URL('.', modelUrl).href);
    const vrm = gltf.userData.vrm;
    if (!vrm) throw new Error('Model không phải file VRM hợp lệ.');
    if (this.disposed) {
      VRMUtils.deepDispose(vrm.scene);
      return false;
    }
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.rotateVRM0(vrm);
    vrm.scene.traverse((object) => { object.frustumCulled = false; });
    this.vrm = vrm;
    this.basePosition.copy(vrm.scene.position);
    this.baseQuaternion.copy(vrm.scene.quaternion);
    for (const bone of ['spine', 'chest', 'head', 'leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm', 'leftUpperLeg', 'rightUpperLeg', 'leftLowerLeg', 'rightLowerLeg', 'leftFoot', 'rightFoot']) {
      const node = vrm.humanoid?.getNormalizedBoneNode(bone);
      if (node) this.restBones.set(bone, node.quaternion.clone());
    }
    this.scene.add(vrm.scene);
    this.fitCamera();
    try {
      await this.animations.load(vrm);
    } catch (error) {
      if (!this.disposed) {
        console.warn('[stage] VRMA:', error);
        this.animationError = error;
      }
    }
    return !this.disposed;
  }

  fitCamera() {
    if (!this.vrm) return;
    this.vrm.update(0);
    const box = new THREE.Box3().setFromObject(this.vrm.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    this.modelBounds = { minX: box.min.x, minY: box.min.y, width: size.x, height: size.y };
    this.frame = { height: Math.max(size.y, 0.5) * 1.4, centerY: center.y, centerX: center.x };
    this.resize();
  }

  resize() {
    if (this.disposed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    if (this.frame) {
      const fov = THREE.MathUtils.degToRad(this.camera.fov);
      const vertical = this.frame.height / (2 * Math.tan(fov / 2));
      const horizontal = vertical * 0.85 / this.camera.aspect;
      this.camera.position.set(this.frame.centerX, this.frame.centerY + this.frame.height * 0.035, Math.max(vertical, horizontal) / this.zoom);
      this.camera.lookAt(this.frame.centerX, this.frame.centerY, 0);
    }
    this.camera.updateProjectionMatrix();
  }

  zoomStep(direction) {
    this.zoom = THREE.MathUtils.clamp(this.zoom * (direction > 0 ? 1.18 : 1 / 1.18), 0.7, 1.7);
    this.resize();
  }

  play(clip, emotion = 'neutral') {
    this.emotion = emotion;
    return this.animations.play(clip);
  }

  startSequence(kind) {
    if (!STAGE_SEQUENCE[kind]?.every((cue) => this.animations.actions.has(cue.clip))) return false;
    if (kind === 'intro' && !this.reducedMotion) {
      const fov = THREE.MathUtils.degToRad(this.camera.fov);
      const farDistance = this.camera.position.z + 1.25;
      const farHeight = 2 * farDistance * Math.tan(fov / 2);
      const clip = createEntranceClip(this.vrm, this.modelBounds, {
        right: this.frame.centerX + farHeight * this.camera.aspect / 2,
        top: this.frame.centerY + farHeight / 2,
      }, this.basePosition, this.baseQuaternion, this.restBones);
      this.animations.replaceClip('fairy-flight', clip);
      this.animations.play('fairy-flight', { fadeSeconds: 0 });
    } else {
      this.resetEntrance();
      this.animations.play('idle', { loop: true, fadeSeconds: 0 });
    }
    this.sequence.start(kind, { skipEntrance: kind === 'intro' && this.reducedMotion });
    return true;
  }

  stopSequence() {
    this.sequence.stop();
    this.animations.play('idle', { loop: true, fadeSeconds: 0 });
    this.resetEntrance();
    this.emotion = 'neutral';
  }

  resetEntrance() {
    if (!this.vrm) return;
    this.vrm.scene.position.copy(this.basePosition);
    this.vrm.scene.quaternion.copy(this.baseQuaternion);
  }

  start() {
    if (this.disposed || this.raf || document.hidden) return;
    const tick = () => {
      if (this.disposed) return;
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.floatTime += dt;
      this.sequence.update(dt);
      this.animations.update(dt);
      if (this.vrm && !this.reducedMotion && this.animations.current !== this.animations.actions.get('fairy-flight')) {
        this.vrm.scene.position.y = this.basePosition.y + Math.sin(this.floatTime * 1.8) * 0.016;
      }
      this.updateExpressions(dt);
      this.vrm?.update(dt);
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  updateExpressions(dt) {
    const manager = this.vrm?.expressionManager;
    if (!manager) return;
    for (const name of EXPRESSIONS) {
      const target = this.emotion === name ? 0.85 : 0;
      this.expressionWeights[name] += (target - this.expressionWeights[name]) * (1 - Math.exp(-dt * 5));
      if (manager.getExpression(name)) manager.setValue(name, this.expressionWeights[name]);
    }
    this.blinkTime -= dt;
    if (this.blinkTime <= 0 && this.blinkPhase < 0) this.blinkPhase = 0;
    if (this.blinkPhase >= 0) {
      this.blinkPhase += dt;
      const p = this.blinkPhase / 0.22;
      if (manager.getExpression('blink')) manager.setValue('blink', p >= 1 ? 0 : Math.sin(Math.PI * p));
      if (p >= 1) {
        this.blinkPhase = -1;
        this.blinkTime = 2.4 + Math.random() * 2.8;
      }
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.modelAbort.abort();
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.sequence.stop();
    this.animations.dispose();
    if (this.vrm) {
      this.scene.remove(this.vrm.scene);
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
