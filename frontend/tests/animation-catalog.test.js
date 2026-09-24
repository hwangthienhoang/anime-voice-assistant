import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const directory = join(process.cwd(), 'public', 'animations');
const manifest = JSON.parse(readFileSync(join(directory, 'animations.json'), 'utf8'));

describe('stage VRMA catalogue', () => {
  it('lists every animation file exactly once in a named category', () => {
    const files = readdirSync(directory).filter((file) => file.endsWith('.vrma')).sort();
    expect(Object.values(manifest.clips).sort()).toEqual(files);

    const entries = manifest.catalogue.flatMap((group) => {
      expect(group.id).toBeTruthy();
      expect(group.label).toBeTruthy();
      expect(group.description).toBeTruthy();
      return group.clips.map((clip) => {
        expect(clip.label).toBeTruthy();
        return clip.name;
      });
    });
    expect(entries.sort()).toEqual(Object.keys(manifest.clips).sort());
  });

  it('builds speaking mixes from existing clips', () => {
    const talking = new Set(manifest.catalogue.find((group) => group.id === 'talking').clips.map((clip) => clip.name));
    for (const mix of manifest.mixes) {
      expect(mix.id).toBeTruthy();
      expect(mix.label).toBeTruthy();
      expect(talking.has(mix.base)).toBe(true);
      expect(manifest.clips[mix.gesture]).toBeTruthy();
    }
  });
});
