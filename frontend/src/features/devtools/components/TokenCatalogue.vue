<script setup>
import tokens from '@/assets/styles/tokens.json';
import { ICON_PATHS } from '@/shared/constants/icons.js';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';
import ShowcaseSection from './ShowcaseSection.vue';
defineProps({ theme: { type: String, default: 'light' } });
const valueFor = (value, theme) => typeof value === 'object' ? value[theme] : value;
const typeStyles = tokens.type.groups.flatMap(group => group.styles.map(style => ({ ...style, family: group.family })));
</script>

<template>
  <ShowcaseSection id="palette" number="01" title="Màu sắc" description="Toàn bộ semantic colors. Chuyển theme để xem giá trị và cách các surfaces thay đổi cùng nhau.">
    <div class="palette-grid">
      <article v-for="token in tokens.color.tokens" :key="token.name" class="color-token" :title="token.usage">
        <div class="color-swatch" :style="{ background: `var(--${token.name})` }" />
        <div class="color-meta"><code>--{{ token.name }}</code><span>{{ valueFor(token.value, theme) }}</span><p>{{ token.usage }}</p></div>
      </article>
    </div>
  </ShowcaseSection>
  <ShowcaseSection id="typography" number="02" title="Typography" description="Philosopher cho tiêu đề; Nunito cho nội dung. Mẫu tiếng Việt để kiểm tra dấu, line-height và weight.">
    <div class="type-families"><div><span>DISPLAY FAMILY</span><p class="display-font">Philosopher</p></div><div><span>BODY FAMILY</span><p>Nunito · Aa Ăă Ââ Đđ Êê Ôô Ơơ Ưư</p></div></div>
    <div class="type-list"><article v-for="style in typeStyles" :key="style.name" class="type-row"><div><code>wl-text-{{ style.name }}</code><small>{{ style.fontSize }} / {{ style.lineHeight }} · {{ style.fontWeight }}</small></div><p :class="`wl-text-${style.name}`">{{ style.sample }}</p></article></div>
  </ShowcaseSection>
  <ShowcaseSection id="geometry" number="03" title="Spacing, borders & surfaces" description="Các đơn vị tạo nên nhịp điệu và chiều sâu của Wishlight.">
    <h3 class="token-group-title">Spacing scale</h3>
    <div class="spacing-list"><div v-for="token in tokens.spacing.tokens" :key="token.name"><code>{{ token.name }}</code><span class="space-bar" :style="{ width: `calc(var(--${token.name}) * 4)` }" /><span>{{ token.value }}</span></div></div>
    <h3 class="token-group-title">Radius</h3>
    <div class="sample-grid"><article v-for="token in tokens.radius.tokens" :key="token.name" class="shape-sample" :style="{ borderRadius: `var(--${token.name})` }"><code>{{ token.name }}</code><span>{{ token.value }}</span></article></div>
    <h3 class="token-group-title">Borders & focus</h3>
    <div class="sample-grid"><article v-for="token in tokens.border.tokens" :key="token.name" class="shape-sample" :style="{ borderWidth: `var(--${token.name})` }"><code>{{ token.name }}</code><span>{{ token.value }}</span></article><button type="button" class="shape-sample focus-example">Focus ring<span>2px · offset 2px</span></button></div>
    <h3 class="token-group-title">Elevation</h3>
    <div class="sample-grid"><article v-for="token in tokens.shadow.tokens" :key="token.name" class="shape-sample" :style="{ boxShadow: `var(--${token.name})` }"><code>{{ token.name }}</code><span>{{ valueFor(token.value, theme) }}</span></article></div>
    <h3 class="token-group-title">Surfaces</h3>
    <div class="sample-grid"><article v-for="surface in ['parchment', 'parchment-raised', 'parchment-sunk', 'night']" :key="surface" class="shape-sample" :style="{ background: `var(--${surface})`, color: surface === 'night' ? 'var(--on-night)' : 'var(--ink)' }"><WishlightIcon name="star" /><code>{{ surface }}</code></article></div>
    <h3 class="token-group-title">Motion tokens</h3>
    <div class="motion-tokens"><div v-for="token in tokens.motion.tokens" :key="token.name"><code>{{ token.name }}</code><span>{{ token.value }}</span></div></div>
    <p class="token-note">Các animation đang chạy có ở MicButton và loading states bên dưới. “Giảm chuyển động” và cài đặt hệ điều hành đều tắt animation.</p>
  </ShowcaseSection>
  <ShowcaseSection id="icons" number="04" title="Iconography" description="Nét 2px trên grid 24px. Star và play dùng fill; các icon còn lại dùng stroke và currentColor.">
    <div class="icon-grid"><div v-for="name in Object.keys(ICON_PATHS)" :key="name"><WishlightIcon :name="name" /><code>{{ name }}</code></div></div>
  </ShowcaseSection>
</template>

<style scoped>
.palette-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: var(--space-4); }
.color-token { border: var(--border-thin) solid var(--line); border-radius: var(--radius-md); overflow: hidden; background: var(--parchment-raised); }
.color-swatch { height: 76px; border-bottom: var(--border-thin) solid var(--line); }
.color-meta { padding: var(--space-3); display: grid; gap: var(--space-1); }
.color-meta code { font-size: 12px; overflow-wrap: anywhere; }
.color-meta > span { color: var(--ink-muted); font-size: 12px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.color-meta p { font-size: 12px; line-height: 18px; color: var(--ink-muted); margin: var(--space-2) 0 0; }
.type-families { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); padding-bottom: var(--space-6); }
.type-families span { font-size: 11px; font-weight: 800; letter-spacing: .1em; color: var(--gold-strong); }
.type-families p { font-size: 24px; margin: var(--space-2) 0; }
.display-font { font-family: var(--font-display); }
.type-row { display: grid; grid-template-columns: 200px 1fr; align-items: baseline; gap: var(--space-6); padding: var(--space-6) 0; border-top: var(--border-thin) solid var(--line); }
.type-row small { display: block; margin-top: var(--space-1); color: var(--ink-muted); }
.type-row p { margin: 0; overflow-wrap: anywhere; }
.token-group-title { font: 700 18px/24px var(--font-display); margin: var(--space-8) 0 var(--space-4); }
.token-group-title:first-child { margin-top: 0; }
.spacing-list { display: grid; gap: var(--space-3); }
.spacing-list > div { display: flex; align-items: center; gap: var(--space-4); }
.spacing-list code { min-width: 70px; }
.space-bar { display: block; height: 12px; background: var(--gold-strong); border-radius: var(--radius-sm); }
.sample-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--space-6); }
.shape-sample { display: flex; min-height: 108px; flex-direction: column; justify-content: center; align-items: center; gap: var(--space-2); padding: var(--space-4); text-align: center; border: var(--border-thin) solid var(--line-strong); border-radius: var(--radius-md); background: var(--parchment-raised); color: var(--ink); }
.shape-sample span { font-size: 12px; overflow-wrap: anywhere; max-width: 100%; }
.focus-example { outline: var(--border-focus) solid var(--focus); outline-offset: 2px; cursor: pointer; }
.motion-tokens { display: flex; flex-wrap: wrap; gap: var(--space-4) var(--space-8); }
.motion-tokens > div { display: grid; gap: var(--space-1); }
.motion-tokens span, .token-note { color: var(--ink-muted); }
.token-note { margin: var(--space-6) 0 0; }
.icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: var(--space-3); }
.icon-grid > div { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-6) var(--space-3); border: var(--border-thin) solid var(--line); border-radius: var(--radius-md); color: var(--gold-strong); }
.icon-grid code { font-size: 12px; color: var(--ink-muted); }
@media (max-width: 600px) {
  .type-families, .type-row { grid-template-columns: 1fr; gap: var(--space-3); }
  .palette-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
  .color-meta p { font-size: 11px; }
}
</style>
