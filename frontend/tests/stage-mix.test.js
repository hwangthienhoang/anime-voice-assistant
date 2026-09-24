import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createUpperBodyClip } from '../src/features/avatar/runtime/StageMix.js';
import { previewVisemes, VISEMES } from '../src/features/avatar/runtime/MouthMotion.js';

describe('stage speaking mix', () => {
  it('keeps upper body gesture tracks and excludes hips, legs, and expression tracks', () => {
    const source = new THREE.AnimationClip('gesture', 2, [
      new THREE.QuaternionKeyframeTrack('Chest.quaternion', [0, 2], [0, 0, 0, 1, 0, 0, 0, 1]),
      new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', [0, 2], [0, 0, 0, 1, 0, 0, 0, 1]),
      new THREE.QuaternionKeyframeTrack('Hips.quaternion', [0, 2], [0, 0, 0, 1, 0, 0, 0, 1]),
      new THREE.NumberKeyframeTrack('VRMExpression_aa.weight', [0, 2], [0, 1]),
    ]);
    const vrm = { humanoid: { getNormalizedBoneNode: (name) => ({ chest: { name: 'Chest' }, leftUpperArm: { name: 'LeftArm' }, hips: { name: 'Hips' } })[name] } };
    expect(createUpperBodyClip(source, vrm).tracks.map((track) => track.name)).toEqual(['Chest.quaternion', 'LeftArm.quaternion']);
  });

  it('cycles vowel shapes with pauses and bounded weights', () => {
    const active = VISEMES.map((_, index) => previewVisemes((index + 0.5) / 4.4));
    expect(new Set(active.map((weights) => VISEMES.find((name) => weights[name] > 0)))).toContain('aa');
    expect(VISEMES.every((name) => previewVisemes(2.55)[name] === 0)).toBe(true);
    expect(active.every((weights) => Object.values(weights).every((value) => value >= 0 && value <= 0.74))).toBe(true);
  });
});
