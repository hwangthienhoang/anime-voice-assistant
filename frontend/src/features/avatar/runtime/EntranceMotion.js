import * as THREE from 'three';

// A local clip: no extra asset or animation format is needed for the entrance.
export const FLIGHT_SECONDS = 5.2;
const ARRIVAL_SECONDS = 3.25;
const LANDING_SECONDS = 4.65;
const FPS = 30;
const TAU = Math.PI * 2;
const BONE_NAMES = [
  'spine', 'chest', 'head',
  'leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm',
  'leftUpperLeg', 'rightUpperLeg', 'leftLowerLeg', 'rightLowerLeg',
  'leftFoot', 'rightFoot',
];

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const ease = (value) => {
  const p = clamp01(value);
  return p * p * (3 - 2 * p);
};
const blend = (start, end, time) => ease((time - start) / (end - start));
const bezier = (a, b, c, d, t) => {
  const u = 1 - t;
  return u ** 3 * a + 3 * u ** 2 * t * b + 3 * u * t ** 2 * c + t ** 3 * d;
};

export function getFlightPose(time, bounds, view) {
  const t = Math.max(0, time);
  const arrival = blend(0, ARRIVAL_SECONDS, t);
  const startX = view.right - bounds.minX + bounds.width * 0.14;
  const startY = view.top - bounds.minY + bounds.height * 0.14;
  const height = bounds.height;
  const landing = blend(ARRIVAL_SECONDS, LANDING_SECONDS, t);
  const spin = blend(3.55, 4.52, t);
  const inFlight = 1 - blend(3.25, LANDING_SECONDS, t);
  const impact = Math.sin(Math.PI * blend(4.25, LANDING_SECONDS, t)) ** 2;

  const x = bezier(startX, startX * 0.52, startX * 0.08, 0.4 * height, arrival);
  const y = bezier(startY, startY * 0.2, height * 0.2, height * 0.17, arrival);
  const z = bezier(-1.25, -1.0, -0.5, 0.22, arrival);
  const sway = Math.sin(t * TAU * 1.65);
  return {
    x: x * (1 - landing) - Math.sin(Math.PI * landing) * height * 0.055,
    y: y * (1 - landing) + sway * height * 0.028 * inFlight
      - Math.sin(Math.PI * landing) * height * 0.035 - impact * height * 0.08,
    z: z * (1 - landing),
    yaw: Math.sin(Math.PI * arrival) * -0.24 * inFlight - TAU * spin,
    pitch: (0.55 + 0.045 * sway) * inFlight,
    roll: (0.48 + 0.055 * sway) * inFlight,
    inFlight,
    landing: Math.max(Math.sin(Math.PI * landing) * (1 - blend(4.3, LANDING_SECONDS, t)), impact * 0.85),
    flutter: sway,
    kick: Math.sin(t * TAU * 2.05 + 0.6),
  };
}

function boneOffset(name, pose, handedness) {
  const fly = pose.inFlight;
  const brace = pose.landing;
  const arm = 1.04 - 0.2 * fly - 0.34 * brace;
  const flap = pose.flutter * 0.24 * fly;
  const kick = pose.kick * 0.17 * fly;
  const f = handedness;
  switch (name) {
    case 'spine': return [f * (-0.18 * fly + 0.1 * brace), 0, 0];
    case 'chest': return [f * (-0.1 * fly + 0.06 * brace), 0, 0];
    case 'head': return [f * 0.35 * fly, 0, -0.035 * pose.flutter * fly];
    case 'leftUpperArm': return [f * (-0.42 * fly + 0.1 * pose.flutter * fly), 0, -f * (arm + flap)];
    case 'rightUpperArm': return [f * (-0.42 * fly - 0.1 * pose.flutter * fly), 0, f * (arm - flap)];
    case 'leftLowerArm': return [f * -0.35 * fly, -0.62 * fly - 0.2 * brace, 0];
    case 'rightLowerArm': return [f * -0.35 * fly, 0.62 * fly + 0.2 * brace, 0];
    case 'leftUpperLeg': return [f * (0.55 * fly + kick - 0.13 * brace), 0, -0.06 * fly];
    case 'rightUpperLeg': return [f * (0.55 * fly - kick - 0.13 * brace), 0, 0.06 * fly];
    case 'leftLowerLeg': return [f * (0.38 * fly + Math.max(0, pose.kick) * 0.14 * fly + 0.72 * brace), 0, 0];
    case 'rightLowerLeg': return [f * (0.38 * fly + Math.max(0, -pose.kick) * 0.14 * fly + 0.72 * brace), 0, 0];
    case 'leftFoot': return [f * -0.2 * fly, 0, 0];
    case 'rightFoot': return [f * -0.2 * fly, 0, 0];
    default: return [0, 0, 0];
  }
}

export function createEntranceClip(vrm, bounds, view, basePosition, baseQuaternion, restBones) {
  const times = [];
  const positions = [];
  const rotations = [];
  const boneValues = new Map();
  const bones = BONE_NAMES.map((name) => ({ name, node: vrm.humanoid?.getNormalizedBoneNode(name) }))
    .filter(({ node }) => node);
  for (const { name } of bones) boneValues.set(name, []);
  const handedness = vrm.meta?.metaVersion === '0' ? -1 : 1;
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const offset = new THREE.Quaternion();

  for (let frame = 0; frame <= Math.round(FLIGHT_SECONDS * FPS); frame++) {
    const time = frame / FPS;
    const pose = getFlightPose(time, bounds, view);
    times.push(time);
    positions.push(basePosition.x + pose.x, basePosition.y + pose.y, basePosition.z + pose.z);
    // rotateVRM0 turns the scene 180° around Y, reversing local pitch and bank.
    offset.setFromEuler(euler.set(pose.pitch * handedness, pose.yaw, pose.roll * handedness));
    rotations.push(...baseQuaternion.clone().multiply(offset).toArray());

    for (const { name, node } of bones) {
      const [x, y, z] = boneOffset(name, pose, handedness);
      offset.setFromEuler(euler.set(x, y, z));
      boneValues.get(name).push(...(restBones.get(name) || node.quaternion).clone().multiply(offset).toArray());
    }
  }

  const tracks = [
    new THREE.VectorKeyframeTrack('.position', times, positions),
    new THREE.QuaternionKeyframeTrack('.quaternion', times, rotations),
    ...bones.map(({ name, node }) => new THREE.QuaternionKeyframeTrack(`${node.name}.quaternion`, times, boneValues.get(name))),
  ];
  return new THREE.AnimationClip('fairy-flight', FLIGHT_SECONDS, tracks);
}
