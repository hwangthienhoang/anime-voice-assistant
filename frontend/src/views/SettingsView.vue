<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { SETTINGS_SECTIONS } from '@/features/settings/sections.js';
import { useWorkspaceTheme } from '@/features/settings/composables/useWorkspaceTheme.js';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';

const route = useRoute();
const { theme, setTheme } = useWorkspaceTheme();
const section = computed(() => SETTINGS_SECTIONS.find((item) => item.id === route.query.section) || SETTINGS_SECTIONS[0]);
</script>

<template>
  <section class="settings-view" aria-labelledby="settings-title">
    <header class="view-heading">
      <span class="view-kicker">CÀI ĐẶT / {{ section.label.toUpperCase() }}</span>
      <h1 id="settings-title" class="wl-text-display">{{ section.label }}</h1>
      <p>{{ section.description }}</p>
    </header>

    <div v-if="section.id === 'appearance'" class="setting-section">
      <div class="setting-row">
        <div><h2>Theme</h2><p>Chọn giao diện sáng hoặc tối. Lựa chọn được lưu trên thiết bị này.</p></div>
        <div class="theme-options" role="group" aria-label="Theme">
          <button type="button" :aria-pressed="theme === 'light'" @click="setTheme('light')"><WishlightIcon name="sun" /> Sáng</button>
          <button type="button" :aria-pressed="theme === 'dark'" @click="setTheme('dark')"><WishlightIcon name="moon" /> Tối</button>
        </div>
      </div>
    </div>

    <div v-else-if="section.id === 'about'" class="setting-section">
      <div class="setting-row"><div><h2>Wishlight</h2><p>Anime Voice Assistant · bản xem trước giao diện.</p></div><span class="version">v0.1.0</span></div>
      <div class="setting-row"><div><h2>Trạng thái</h2><p>Sân khấu, trò chuyện và giọng nói đang được hoàn thiện.</p></div></div>
    </div>

    <div v-else class="setting-section">
      <div class="setting-row"><div><h2>Chưa có tùy chọn</h2><p>Các tùy chọn {{ section.label.toLowerCase() }} sẽ xuất hiện khi tính năng sẵn sàng.</p></div><span class="pending">SẮP CÓ</span></div>
    </div>
  </section>
</template>

<style scoped>
.settings-view { max-width: 900px; width: 100%; margin: 0 auto; padding: clamp(20px, 5vw, 56px) clamp(8px, 3vw, 36px); }
.view-kicker { color: var(--ink-muted); font-size: 11px; font-weight: 800; letter-spacing: .13em; }
.view-heading h1 { margin: var(--space-3) 0 var(--space-2); }
.view-heading p { margin: 0; color: var(--ink-muted); }
.setting-section { margin-top: var(--space-8); border-top: 1px solid var(--line); }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); padding: var(--space-6) 0; border-bottom: 1px solid var(--line); }
.setting-row h2 { margin: 0 0 var(--space-1); font-size: 15px; line-height: 22px; }
.setting-row p { max-width: 54ch; margin: 0; color: var(--ink-muted); font-size: 13px; line-height: 1.5; }
.theme-options { display: flex; flex: none; gap: var(--space-1); padding: 3px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--parchment-sunk); }
.theme-options button { display: flex; align-items: center; gap: var(--space-2); padding: 5px var(--space-3); border: 0; border-radius: 4px; color: var(--ink-muted); background: transparent; cursor: pointer; font-size: 12px; }
.theme-options button[aria-pressed='true'] { color: var(--ink); background: var(--parchment-raised); box-shadow: var(--shadow-card); }
.theme-options :deep(svg) { width: 15px; height: 15px; }
.version, .pending { flex: none; color: var(--ink-muted); font-size: 11px; font-weight: 800; letter-spacing: .08em; }
@media (max-width: 620px) { .setting-row { align-items: flex-start; flex-direction: column; gap: var(--space-4); } }
</style>
