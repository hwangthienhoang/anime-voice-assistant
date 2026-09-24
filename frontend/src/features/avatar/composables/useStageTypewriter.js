import { onScopeDispose, ref } from 'vue';

const CHARACTER_DELAY = 38;

export function useStageTypewriter() {
  const text = ref('');
  const visibleText = ref('');
  const typing = ref(false);
  let timer = null;

  function cancel() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    typing.value = false;
  }

  function reveal() {
    cancel();
    visibleText.value = text.value;
  }

  function show(nextText, { animate = false, reducedMotion = false } = {}) {
    cancel();
    text.value = nextText;
    if (!animate || reducedMotion || !nextText) {
      visibleText.value = nextText;
      return;
    }

    const characters = typeof Intl.Segmenter === 'function'
      ? [...new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(nextText)].map((part) => part.segment)
      : Array.from(nextText);
    let index = 0;
    visibleText.value = '';
    typing.value = true;

    function nextCharacter() {
      visibleText.value += characters[index++];
      if (index === characters.length) {
        timer = null;
        typing.value = false;
      } else {
        timer = setTimeout(nextCharacter, CHARACTER_DELAY);
      }
    }
    timer = setTimeout(nextCharacter, CHARACTER_DELAY);
  }

  onScopeDispose(cancel);
  return { text, visibleText, typing, show, reveal };
}
