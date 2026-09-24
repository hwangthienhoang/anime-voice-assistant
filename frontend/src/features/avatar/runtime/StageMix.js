import * as THREE from 'three';

const UPPER_BODY = [
  'spine', 'chest', 'upperChest', 'neck', 'head',
  'leftShoulder', 'rightShoulder', 'leftUpperArm', 'rightUpperArm',
  'leftLowerArm', 'rightLowerArm', 'leftHand', 'rightHand',
];

export function createUpperBodyClip(clip, vrm) {
  const names = new Set(UPPER_BODY.map((bone) => vrm.humanoid?.getNormalizedBoneNode(bone)?.name).filter(Boolean));
  const tracks = clip.tracks.filter((track) => names.has(track.name.slice(0, track.name.lastIndexOf('.'))));
  return new THREE.AnimationClip(`${clip.name}-upper-body`, clip.duration, tracks);
}
