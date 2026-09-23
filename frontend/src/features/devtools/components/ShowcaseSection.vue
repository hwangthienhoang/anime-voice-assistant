<script setup>
defineProps({ id: { type: String, required: true }, number: String, title: { type: String, required: true }, description: String });
</script>

<template>
  <section :id="id" class="showcase-section" :aria-labelledby="`${id}-title`">
    <header class="showcase-heading"><span class="showcase-number">{{ number }}</span><div><h2 :id="`${id}-title`">{{ title }}</h2><p v-if="description">{{ description }}</p></div></header>
    <slot />
  </section>
</template>

<style scoped>
.showcase-section { scroll-margin-top: var(--space-6); padding-block: var(--space-8); border-top: var(--border-thin) solid var(--line); }
.showcase-heading { display: flex; gap: var(--space-4); align-items: baseline; margin-bottom: var(--space-6); }
.showcase-number { color: var(--gold-strong); font: 700 12px/18px var(--font-sans); font-variant-numeric: tabular-nums; }
h2 { font: 700 28px/36px var(--font-display); margin: 0; }
p { color: var(--ink-muted); margin: var(--space-2) 0 0; max-width: 70ch; }
</style>
