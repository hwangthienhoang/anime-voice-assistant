<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  headingLevel: { type: Number, default: 1, validator: (value) => [1, 2, 3].includes(value) },
});
</script>

<template>
  <section class="page-placeholder">
    <component :is="`h${headingLevel}`" class="wl-text-display">{{ title }}</component>
    <p class="page-description">{{ description }}</p>
    <slot />
  </section>
</template>

<style scoped>
.page-placeholder { padding-block: var(--space-6); }
.wl-text-display { margin: 0 0 var(--space-4); }
.page-description { max-width: 65ch; color: var(--ink-muted); margin: 0 0 var(--space-6); }
</style>
