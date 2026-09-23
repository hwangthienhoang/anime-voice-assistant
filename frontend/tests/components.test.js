import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { effectScope } from 'vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import BaseToggle from '@/shared/ui/BaseToggle.vue';
import BaseInput from '@/shared/ui/BaseInput.vue';
import EmotionTag from '@/shared/ui/EmotionTag.vue';
import MicButton from '@/features/voice/components/MicButton.vue';
import ChatComposer from '@/features/conversation/components/ChatComposer.vue';
import ChatBubble from '@/features/conversation/components/ChatBubble.vue';
import DialogueBox from '@/features/conversation/components/DialogueBox.vue';
import SettingsPanel from '@/features/settings/components/SettingsPanel.vue';
import DesignSystemView from '@/views/DesignSystemView.vue';
import { useGalleryDemo } from '@/features/devtools/composables/useGalleryDemo.js';

const wrappers = [];
function render(component, options) {
  const wrapper = mount(component, options);
  wrappers.push(wrapper);
  return wrapper;
}
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Wishlight component contracts', () => {
  it('forwards native button attributes and blocks clicks while loading', async () => {
    const button = render(BaseButton, { props: { loading: true }, attrs: { 'aria-label': 'Lưu' }, slots: { default: 'Lưu' } });
    expect(button.attributes('type')).toBe('button');
    expect(button.attributes('aria-label')).toBe('Lưu');
    expect(button.attributes('aria-busy')).toBe('true');
    await button.trigger('click');
    expect(button.emitted('click')).toBeUndefined();
    await button.setProps({ loading: false });
    await button.trigger('click');
    expect(button.emitted('click')).toHaveLength(1);
  });

  it('toggle emits controlled state and respects disabled', async () => {
    const toggle = render(BaseToggle, { props: { label: 'Phụ đề', modelValue: false } });
    await toggle.trigger('click');
    expect(toggle.emitted('update:modelValue')).toEqual([[true]]);
    expect(toggle.attributes('aria-checked')).toBe('false');
    await toggle.setProps({ disabled: true });
    await toggle.trigger('click');
    expect(toggle.emitted('update:modelValue')).toHaveLength(1);
  });

  it('input links label and validation text to a unique control', async () => {
    const field = render(BaseInput, { props: { label: 'Tên', error: 'Bắt buộc' } });
    const input = field.get('input');
    expect(field.get('label').attributes('for')).toBe(input.attributes('id'));
    expect(field.get(`#${input.attributes('aria-describedby')}`).text()).toBe('Bắt buộc');
    expect(input.attributes('aria-invalid')).toBe('true');
    await input.setValue('Hana');
    expect(field.emitted('update:modelValue')).toEqual([['Hana']]);
  });

  it('unknown emotion and voice state safely fall back', () => {
    expect(render(EmotionTag, { props: { emotion: 'not-a-color' } }).text()).toBe('Bình thường');
    const mic = render(MicButton, { props: { state: 'bad-state', showLabel: false, disabled: true } });
    expect(mic.get('button').classes()).toContain('wl-mic-idle');
    expect(mic.get('button').attributes('aria-label')).toBe('Nhấn để nói');
    expect(mic.get('button').element.disabled).toBe(true);
  });

  it('composer sends trimmed text; ignores empty, disabled, Shift+Enter and IME', async () => {
    const composer = render(ChatComposer, { props: { modelValue: '  Xin chào  ' } });
    const textarea = composer.get('textarea');
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true });
    await textarea.trigger('keydown', { key: 'Enter', isComposing: true });
    await textarea.trigger('compositionstart');
    await textarea.trigger('keydown', { key: 'Enter' });
    expect(composer.emitted('send')).toBeUndefined();
    await textarea.trigger('compositionend');
    await textarea.trigger('keydown', { key: 'Enter' });
    expect(composer.emitted('send')).toEqual([['Xin chào']]);
    await composer.setProps({ modelValue: '   ' });
    await composer.get('form').trigger('submit');
    await composer.setProps({ modelValue: 'Text', disabled: true });
    await composer.get('form').trigger('submit');
    expect(composer.emitted('send')).toHaveLength(1);
    expect(composer.get('button[type="submit"]').element.disabled).toBe(true);
  });

  it('chat content is escaped and replay emits without playing audio', async () => {
    const bubble = render(ChatBubble, { props: { text: '<img src=x onerror=alert(1)>', voice: { duration: 65 } } });
    expect(bubble.find('img').exists()).toBe(false);
    expect(bubble.get('.wl-msg-body').text()).toBe('<img src=x onerror=alert(1)>');
    expect(bubble.get('button').text()).toContain('1:05');
    await bubble.get('button').trigger('click');
    expect(bubble.emitted('play')).toHaveLength(1);
  });

  it('dialogue controls have independent events and a keyboard-operable reveal button', async () => {
    const dialogue = render(DialogueBox, { props: { done: false, text: 'Chào…', auto: true } });
    await dialogue.get('.wl-dlg-reveal').trigger('click');
    const controls = dialogue.findAll('.wl-dlg-ctrl');
    for (const control of controls) await control.trigger('click');
    expect(controls[0].attributes('aria-pressed')).toBe('true');
    for (const event of ['reveal', 'toggle-auto', 'log', 'skip']) expect(dialogue.emitted(event)).toHaveLength(1);
    expect(dialogue.find('[aria-live]').exists()).toBe(false);
  });

  it('settings updates a copy of preferences without mutating the parent object', async () => {
    const preferences = Object.freeze({ theme: 'light', rate: 1, subtitles: false });
    const settings = render(SettingsPanel, { props: { modelValue: preferences } });
    await settings.get('select').setValue('dark');
    expect(preferences.theme).toBe('light');
    expect(settings.emitted('update:modelValue')[0][0]).toEqual({ ...preferences, theme: 'dark' });
  });
});

describe('Dev gallery', () => {
  it('sending from the empty preview starts a fresh visible thread', () => {
    const scope = effectScope();
    const demo = scope.run(useGalleryDemo);
    demo.chatState.value = 'empty';
    demo.send('Chào từ empty state');
    expect(demo.chatState.value).toBe('ready');
    expect(demo.messages.value).toHaveLength(1);
    expect(demo.messages.value[0].text).toBe('Chào từ empty state');
    scope.stop();
  });
  it('renders every foundation section and changes the local theme', async () => {
    const gallery = render(DesignSystemView, { global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } } });
    for (const id of ['palette', 'typography', 'geometry', 'icons', 'controls', 'voice', 'conversation', 'patterns']) expect(gallery.find(`#${id}`).exists()).toBe(true);
    expect(gallery.findAll('.color-token')).toHaveLength(26);
    const ids = gallery.findAll('[id]').map(element => element.attributes('id'));
    expect(new Set(ids).size).toBe(ids.length);
    const themeButton = gallery.findAll('button').find(button => button.text().includes('Chuyển sang Night'));
    await themeButton.trigger('click');
    expect(gallery.attributes('data-theme')).toBe('dark');
    expect(gallery.getComponent(SettingsPanel).props('modelValue').theme).toBe('dark');
  });

  it('cleans up the typewriter timer on scope disposal', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const scope = effectScope();
    const demo = scope.run(useGalleryDemo);
    demo.typeDialogue();
    vi.advanceTimersByTime(100);
    expect(demo.dialogueDone.value).toBe(false);
    const lastText = demo.dialogueText.value;
    scope.stop();
    vi.advanceTimersByTime(1000);
    expect(demo.dialogueText.value).toBe(lastText);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reduced motion reveals immediately without a timer', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const scope = effectScope();
    const demo = scope.run(useGalleryDemo);
    demo.typeDialogue();
    expect(demo.dialogueDone.value).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    scope.stop();
  });
});
