export const VISEMES = ['aa', 'ih', 'ou', 'ee', 'oh'];

// Preview only: a varied speaking rhythm until the voice pipeline can supply phonemes.
export function previewVisemes(time) {
  const syllable = Math.floor(time * 4.4);
  const phase = (time * 4.4) % 1;
  const pause = syllable % 13 === 11 || syllable % 13 === 12;
  const weights = Object.fromEntries(VISEMES.map((name) => [name, 0]));
  if (pause) return weights;
  const shape = VISEMES[(syllable * 3 + Math.floor(syllable / 5)) % VISEMES.length];
  weights[shape] = Math.min(0.74, Math.sin(Math.PI * phase) * 0.72);
  return weights;
}
