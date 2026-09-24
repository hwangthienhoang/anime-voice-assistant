import { describe, expect, it, vi } from 'vitest';
import { DemoSequence, STAGE_SEQUENCE } from '../src/features/avatar/runtime/DemoSequence.js';

describe('stage animation sequence', () => {
  it('waits for the flight before greeting, then continues with gestures', () => {
    const play = vi.fn();
    const onEnd = vi.fn();
    const sequence = new DemoSequence({ play, onEnd });

    sequence.start('intro');
    sequence.update(5);
    expect(play).not.toHaveBeenCalled();
    sequence.update(0.1);
    expect(play.mock.lastCall[0].clip).toBe('raise-hand');
    sequence.update(11);
    expect(play.mock.calls.map(([cue]) => cue.clip)).toEqual(['raise-hand', 'happy', 'nod', 'relaxed']);
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('starts the greeting promptly when the entrance is skipped for reduced motion', () => {
    const play = vi.fn();
    const sequence = new DemoSequence({ play });

    sequence.start('intro', { skipEntrance: true });
    sequence.update(0.1);
    expect(play.mock.lastCall[0].clip).toBe('raise-hand');
  });

  it('plays cues in order, ends once, and can restart from the beginning', () => {
    const play = vi.fn();
    const onEnd = vi.fn();
    const sequence = new DemoSequence({ play, onEnd });

    sequence.start('demo');
    sequence.update(11);
    expect(play.mock.calls.map(([cue]) => cue.clip)).toEqual(['happy', 'raise-hand', 'nod', 'think']);
    sequence.update(13);
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledWith('demo');
    expect(play).toHaveBeenCalledTimes(STAGE_SEQUENCE.demo.length);

    sequence.start('demo');
    sequence.update(0.1);
    expect(play.mock.lastCall[0].clip).toBe('happy');
    sequence.stop();
    sequence.update(30);
    expect(onEnd).toHaveBeenCalledTimes(2);
    expect(play).toHaveBeenCalledTimes(STAGE_SEQUENCE.demo.length + 1);
  });
});
