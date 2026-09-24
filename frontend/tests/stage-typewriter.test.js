import { afterEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useStageTypewriter } from '../src/features/avatar/composables/useStageTypewriter.js';

afterEach(() => vi.useRealTimers());

describe('stage greeting typewriter', () => {
  it('reveals intro text, cancels the old line on replay, and stops on unmount', () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const writer = scope.run(() => useStageTypewriter());

    writer.show('Xin chào!', { animate: true });
    expect(writer.text.value).toBe('Xin chào!');
    expect(writer.visibleText.value).toBe('');
    vi.advanceTimersByTime(76);
    expect(writer.visibleText.value).toBe('Xi');

    writer.show('Rất vui gặp bạn.', { animate: true });
    expect(writer.visibleText.value).toBe('');
    vi.runAllTimers();
    expect(writer.visibleText.value).toBe('Rất vui gặp bạn.');
    expect(writer.typing.value).toBe(false);

    writer.show('Dở dang', { animate: true });
    vi.advanceTimersByTime(38);
    scope.stop();
    vi.runAllTimers();
    expect(writer.visibleText.value).toBe('D');
    expect(writer.typing.value).toBe(false);
  });

  it('shows the full sentence immediately for reduced motion and demo cues', () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const writer = scope.run(() => useStageTypewriter());
    writer.show('Xin chào!', { animate: true, reducedMotion: true });
    expect(writer.visibleText.value).toBe('Xin chào!');
    writer.show('Vui vẻ · happy');
    expect(writer.visibleText.value).toBe('Vui vẻ · happy');
    expect(vi.getTimerCount()).toBe(0);
    scope.stop();
  });
});
