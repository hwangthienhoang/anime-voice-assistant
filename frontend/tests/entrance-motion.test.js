import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { FLIGHT_SECONDS, createEntranceClip, getFlightPose } from '../src/features/avatar/runtime/EntranceMotion.js';

describe('fairy flight entrance', () => {
  const bounds = { minX: -0.3, minY: 0, width: 0.6, height: 0.8 };
  const view = { right: 0.9, top: 1.2 };

  it('travels from the far upper-right toward the viewer, then lands after one spin', () => {
    const start = getFlightPose(0, bounds, view);
    const approach = getFlightPose(2.4, bounds, view);
    const spin = getFlightPose(4.15, bounds, view);
    const impact = getFlightPose(4.45, bounds, view);
    const land = getFlightPose(FLIGHT_SECONDS, bounds, view);

    expect(bounds.minX + start.x).toBeGreaterThan(view.right);
    expect(bounds.minY + start.y).toBeGreaterThan(view.top);
    expect(start.z).toBeLessThan(approach.z);
    expect(approach.z).toBeLessThan(0);
    expect(approach.x).toBeLessThan(start.x);
    expect(spin.yaw).toBeLessThan(-Math.PI);
    expect(impact.y).toBeLessThan(land.y);
    expect(impact.landing).toBeGreaterThan(0.7);
    expect(land.x).toBeCloseTo(0);
    expect(land.y).toBeCloseTo(0);
    expect(land.z).toBeCloseTo(0);
    expect(land.yaw).toBeCloseTo(-Math.PI * 2);
  });

  it('generates a clip for the root and articulated arms and legs', () => {
    const names = ['spine', 'leftUpperArm', 'rightUpperArm', 'leftUpperLeg', 'rightUpperLeg'];
    const nodes = Object.fromEntries(names.map((name) => {
      const node = new THREE.Object3D();
      node.name = `normalized-${name}`;
      return [name, node];
    }));
    const vrm = { meta: { metaVersion: '0' }, humanoid: { getNormalizedBoneNode: (name) => nodes[name] } };
    const facingCamera = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    const clip = createEntranceClip(vrm, bounds, view, new THREE.Vector3(), facingCamera, new Map());

    expect(clip.duration).toBe(FLIGHT_SECONDS);
    expect(clip.tracks.map((track) => track.name)).toEqual([
      '.position', '.quaternion',
      'normalized-spine.quaternion',
      'normalized-leftUpperArm.quaternion', 'normalized-rightUpperArm.quaternion',
      'normalized-leftUpperLeg.quaternion', 'normalized-rightUpperLeg.quaternion',
    ]);
    const flightFrame = 2 * 30;
    const rootValues = clip.tracks[1].values;
    const forward = new THREE.Vector3(0, 1, 0).applyQuaternion(
      new THREE.Quaternion(...rootValues.slice(flightFrame * 4, flightFrame * 4 + 4)),
    );
    expect(forward.x).toBeLessThan(0); // Head leads left into the stage.
    expect(forward.z).toBeGreaterThan(0); // Torso leans toward the viewer.
    expect(clip.tracks[2].values[flightFrame * 4]).toBeGreaterThan(0);
    expect(clip.tracks[5].values[flightFrame * 4]).toBeLessThan(0);
    expect(clip.tracks[6].values[flightFrame * 4]).toBeLessThan(0);
    const leftArm = clip.tracks[3];
    expect(Array.from(leftArm.values.slice(0, 4))).not.toEqual(Array.from(leftArm.values.slice(-4)));
  });
});
