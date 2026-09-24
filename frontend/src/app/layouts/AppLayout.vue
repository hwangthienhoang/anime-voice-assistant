<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { SETTINGS_GROUPS, SETTINGS_SECTIONS } from '@/features/settings/sections.js';
import { useWorkspaceTheme } from '@/features/settings/composables/useWorkspaceTheme.js';
import WishlightIcon from '@/shared/ui/WishlightIcon.vue';

const route = useRoute();
const { theme, initializeTheme, setTheme } = useWorkspaceTheme();
initializeTheme();
const showDevGallery = import.meta.env.DEV;
const features = [
  { name: 'stage', label: 'Sân khấu', icon: 'star' },
  { name: 'chat', label: 'Trò chuyện', icon: 'message' },
];
const tools = [
  { id: 'overview', label: 'Thông tin', icon: 'info' },
  { id: 'avatar', label: 'Nhân vật', icon: 'star' },
  { id: 'voice', label: 'Giọng nói', icon: 'wave' },
];
const settingsMode = computed(() => route.name === 'settings');
const settingsSection = computed(() => SETTINGS_SECTIONS.find((item) => item.id === route.query.section) || SETTINGS_SECTIONS[0]);
const pageTitle = computed(() => settingsMode.value ? `Cài đặt / ${settingsSection.value.label}` : route.meta.title || 'Wishlight');
const lastFeature = ref(features.some((item) => item.name === route.name) ? route.name : 'stage');
const leftOpen = ref(true);
const rightVisible = ref(true);
const rightTool = ref(null);
const accountOpen = ref(false);
const narrow = ref(false);
let media;

function syncViewport(event) {
  if (event.matches && !narrow.value) {
    leftOpen.value = false;
    rightVisible.value = false;
    rightTool.value = null;
  }
  narrow.value = event.matches;
}
function closeDrawers() {
  if (narrow.value) {
    leftOpen.value = false;
    rightVisible.value = false;
  }
}
function toggleLeft() {
  leftOpen.value = !leftOpen.value;
  if (narrow.value && leftOpen.value) rightVisible.value = false;
}
function toggleRight() {
  rightVisible.value = !rightVisible.value;
  if (narrow.value && rightVisible.value) leftOpen.value = false;
}
function selectTool(id) {
  rightTool.value = rightTool.value === id ? null : id;
}
function onKeydown(event) {
  if (event.key !== 'Escape') return;
  if (accountOpen.value) accountOpen.value = false;
  else if (rightTool.value) rightTool.value = null;
  else closeDrawers();
}
watch(() => route.fullPath, () => {
  if (features.some((item) => item.name === route.name)) lastFeature.value = route.name;
  accountOpen.value = false;
  closeDrawers();
});
onMounted(() => {
  media = window.matchMedia('(max-width: 900px)');
  syncViewport(media);
  media.addEventListener('change', syncViewport);
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  media?.removeEventListener('change', syncViewport);
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div class="workspace-shell" :class="{ 'left-closed': !leftOpen, 'right-hidden': !rightVisible, 'tool-open': Boolean(rightTool), narrow }">
    <a class="skip-link" href="#main-content">Đến nội dung chính</a>
    <button v-if="narrow && (leftOpen || rightVisible)" type="button" class="drawer-backdrop" aria-label="Đóng thanh bên" @click="closeDrawers" />

    <aside id="navigation-sidebar" class="navigation-sidebar" aria-label="Điều hướng ứng dụng" :inert="!leftOpen">
      <div class="sidebar-header">
        <RouterLink v-if="settingsMode" class="back-link" :to="{ name: lastFeature }" aria-label="Quay về tính năng" @click="closeDrawers"><WishlightIcon name="back" /><span>Tính năng</span></RouterLink>
        <RouterLink v-else class="brand-link" :to="{ name: 'stage' }" @click="closeDrawers"><WishlightIcon name="star" /><strong>Wishlight</strong></RouterLink>
        <button type="button" class="icon-button" aria-label="Ẩn thanh bên trái" @click="toggleLeft"><WishlightIcon name="panel-left" /></button>
      </div>

      <nav v-if="settingsMode" class="sidebar-list" aria-label="Danh mục cài đặt">
        <h2 class="sidebar-title">Cài đặt</h2>
        <div v-for="group in SETTINGS_GROUPS" :key="group.label" class="nav-group">
          <p class="group-label">{{ group.label }}</p>
          <RouterLink v-for="item in group.items" :key="item.id" class="nav-item" :class="{ selected: settingsSection.id === item.id }" :to="{ name: 'settings', query: { section: item.id } }" :aria-current="settingsSection.id === item.id ? 'page' : undefined" @click="closeDrawers"><WishlightIcon :name="item.icon" /><span>{{ item.label }}</span></RouterLink>
        </div>
      </nav>
      <nav v-else class="sidebar-list" aria-label="Tính năng">
        <div class="nav-group">
          <p class="group-label">KHÔNG GIAN</p>
          <RouterLink v-for="item in features" :key="item.name" class="nav-item feature-item" :to="{ name: item.name }" @click="closeDrawers"><WishlightIcon :name="item.icon" /><span>{{ item.label }}</span></RouterLink>
        </div>
        <div class="nav-group sessions">
          <p class="group-label">PHIÊN TRÒ CHUYỆN</p>
          <p class="empty-sessions">Chưa có phiên nào</p>
        </div>
      </nav>

      <div class="account-area">
        <div v-show="accountOpen" id="account-menu" class="account-menu">
          <div class="account-detail"><strong>Khách</strong><small>Chưa có tài khoản</small></div>
          <RouterLink :to="{ name: 'settings', query: { section: 'appearance' } }" @click="closeDrawers"><WishlightIcon name="settings" /> Cài đặt</RouterLink>
          <RouterLink :to="{ name: 'settings', query: { section: 'about' } }" @click="closeDrawers"><WishlightIcon name="info" /> Thông tin ứng dụng</RouterLink>
          <RouterLink v-if="showDevGallery" :to="{ name: 'design-system' }" @click="closeDrawers"><WishlightIcon name="star" /> Design system</RouterLink>
        </div>
        <button type="button" class="account-button" :aria-expanded="accountOpen" aria-controls="account-menu" @click="accountOpen = !accountOpen">
          <span class="avatar"><WishlightIcon name="user" /></span><span class="account-label"><strong>Khách</strong><small>Không gian cá nhân</small></span><WishlightIcon class="account-chevron" name="chevron" />
        </button>
      </div>
    </aside>

    <div class="workspace-main">
      <header class="top-bar">
        <div class="top-left">
          <button v-if="!leftOpen" type="button" class="icon-button" aria-label="Hiện thanh bên trái" aria-controls="navigation-sidebar" @click="toggleLeft"><WishlightIcon name="panel-left" /></button>
          <span class="top-title">{{ pageTitle }}</span>
        </div>
        <div class="top-actions">
          <button type="button" class="icon-button" :aria-label="theme === 'light' ? 'Chuyển sang theme tối' : 'Chuyển sang theme sáng'" :title="theme === 'light' ? 'Theme tối' : 'Theme sáng'" @click="setTheme(theme === 'light' ? 'dark' : 'light')"><WishlightIcon :name="theme === 'light' ? 'moon' : 'sun'" /></button>
          <button v-if="!rightVisible" type="button" class="icon-button" aria-label="Hiện thanh công cụ bên phải" aria-controls="utility-sidebar" @click="toggleRight"><WishlightIcon name="panel-right" /></button>
        </div>
      </header>
      <main id="main-content" class="workspace-content" tabindex="-1"><slot /></main>
      <footer class="status-bar" aria-label="Trạng thái ứng dụng"><span><i class="status-dot" /> Bản xem trước</span><span>Hội thoại chưa kết nối</span></footer>
    </div>

    <aside id="utility-sidebar" class="utility-sidebar" aria-label="Công cụ mở rộng" :inert="!rightVisible">
      <section v-if="rightTool" class="tool-detail" :aria-label="tools.find((item) => item.id === rightTool)?.label">
        <div class="tool-heading"><span>{{ tools.find((item) => item.id === rightTool)?.label }}</span><span class="tool-hint">Chọn icon lần nữa để thu gọn</span></div>
        <template v-if="rightTool === 'overview'"><h2>{{ route.meta.title }}</h2><p>Giao diện đang ở bản xem trước. Các tính năng hội thoại sẽ được bổ sung ở bản tiếp theo.</p></template>
        <template v-else-if="rightTool === 'avatar'"><h2>Nhân vật trên sân khấu</h2><p>Model VRM cục bộ và bộ animation demo đã có trên Sân khấu. Chức năng chọn hoặc đổi model sẽ được bổ sung sau.</p><RouterLink :to="{ name: 'stage' }">Mở Sân khấu</RouterLink></template>
        <template v-else><h2>Giọng nói chưa sẵn sàng</h2><p>Ứng dụng sẽ chỉ bật micro sau thao tác của bạn khi tính năng giọng nói hoàn thành.</p><RouterLink :to="{ name: 'settings', query: { section: 'voice' } }">Mở cài đặt giọng nói</RouterLink></template>
      </section>
      <div class="tool-rail">
        <button type="button" class="icon-button rail-toggle" aria-label="Ẩn thanh công cụ bên phải" @click="toggleRight"><WishlightIcon name="panel-right" /></button>
        <div class="rail-items" role="group" aria-label="Công cụ">
          <button v-for="item in tools" :key="item.id" type="button" class="icon-button tool-button" :title="item.label" :aria-label="item.label" :aria-pressed="rightTool === item.id" @click="selectTool(item.id)"><WishlightIcon :name="item.icon" /></button>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.workspace-shell { --left-size: 244px; --right-size: 48px; display: grid; grid-template-columns: var(--left-size) minmax(0, 1fr) var(--right-size); width: 100%; height: 100dvh; min-height: 100dvh; background: var(--parchment); }
.workspace-shell.left-closed { --left-size: 0px; }
.workspace-shell.right-hidden { --right-size: 0px; }
.workspace-shell.tool-open:not(.right-hidden) { --right-size: 292px; }
.navigation-sidebar, .utility-sidebar { min-width: 0; overflow: hidden; background: var(--parchment-raised); }
.navigation-sidebar { display: flex; flex-direction: column; border-right: 1px solid var(--line); }
.utility-sidebar { display: flex; border-left: 1px solid var(--line); }
.left-closed .navigation-sidebar, .right-hidden .utility-sidebar { border: 0; visibility: hidden; }
.sidebar-header { height: 44px; flex: none; display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); padding: 0 var(--space-2) 0 var(--space-4); border-bottom: 1px solid var(--line); }
.brand-link, .back-link { min-width: 0; display: flex; align-items: center; gap: var(--space-2); color: var(--ink); text-decoration: none; font-size: 13px; }
.brand-link :deep(svg) { width: 17px; height: 17px; color: var(--gold-strong); }
.back-link :deep(svg) { width: 16px; height: 16px; }
.icon-button { width: 30px; height: 30px; flex: none; display: grid; place-items: center; border: 0; border-radius: var(--radius-sm); color: var(--ink-muted); background: transparent; cursor: pointer; }
.icon-button:hover, .icon-button[aria-pressed='true'] { color: var(--ink); background: var(--parchment-sunk); }
.icon-button :deep(svg) { width: 17px; height: 17px; }
.sidebar-list { flex: 1; min-height: 0; overflow: auto; padding: var(--space-4) var(--space-2); }
.sidebar-title { margin: 0 var(--space-2) var(--space-6); font-size: 18px; font-weight: 800; }
.nav-group + .nav-group { margin-top: var(--space-6); }
.group-label { margin: 0 0 var(--space-2); padding-inline: var(--space-2); color: var(--ink-muted); font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.nav-item { display: flex; align-items: center; gap: var(--space-3); min-height: 36px; padding: 0 var(--space-3); border-radius: var(--radius-sm); color: var(--ink-muted); font-size: 13px; font-weight: 700; text-decoration: none; }
.nav-item :deep(svg) { width: 16px; height: 16px; flex: none; }
.nav-item:hover, .feature-item.router-link-exact-active, .nav-item.selected { color: var(--ink); background: var(--parchment-sunk); }
.empty-sessions { margin: 0; padding: var(--space-2); color: var(--ink-muted); font-size: 12px; }
.account-area { flex: none; border-top: 1px solid var(--line); padding: var(--space-2); }
.account-menu { margin-bottom: var(--space-2); padding: var(--space-2); border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--parchment); }
.account-detail { display: flex; flex-direction: column; padding: var(--space-2); }
.account-detail strong { font-size: 12px; }
.account-detail small { color: var(--ink-muted); font-size: 11px; }
.account-menu a { display: flex; align-items: center; gap: var(--space-2); min-height: 30px; padding: 0 var(--space-2); border-radius: 4px; color: var(--ink); font-size: 12px; text-decoration: none; }
.account-menu a:hover { background: var(--parchment-sunk); }
.account-menu a :deep(svg) { width: 15px; height: 15px; }
.account-button { display: flex; align-items: center; gap: var(--space-2); width: 100%; min-height: 40px; padding: 3px var(--space-2); border: 0; border-radius: var(--radius-sm); color: var(--ink); background: transparent; text-align: left; cursor: pointer; }
.account-button:hover { background: var(--parchment-sunk); }
.avatar { width: 28px; height: 28px; flex: none; display: grid; place-items: center; border-radius: 50%; color: var(--gold-strong); background: var(--parchment-sunk); }
.avatar :deep(svg) { width: 16px; height: 16px; }
.account-label { flex: 1; min-width: 0; }
.account-label strong, .account-label small { display: block; line-height: 1.15; }
.account-label strong { font-size: 12px; }
.account-label small { color: var(--ink-muted); font-size: 10px; }
.account-chevron { width: 13px; height: 13px; transition: transform .15s ease; }
.account-button[aria-expanded='true'] .account-chevron { transform: rotate(180deg); }
.workspace-main { min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.top-bar { height: 44px; flex: none; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: 0 var(--space-3); border-bottom: 1px solid var(--line); background: var(--parchment-raised); }
.top-left, .top-actions { min-width: 0; display: flex; align-items: center; gap: var(--space-2); }
.top-title { overflow: hidden; color: var(--ink); font-size: 12px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.workspace-content { flex: 1; min-height: 0; overflow: auto; padding: var(--space-6); }
.status-bar { height: 26px; flex: none; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: 0 var(--space-4); border-top: 1px solid var(--line); color: var(--ink-muted); background: var(--parchment-raised); font-size: 10px; }
.status-bar span { display: inline-flex; align-items: center; gap: var(--space-2); white-space: nowrap; }
.status-dot { width: 6px; height: 6px; display: inline-block; border-radius: 50%; background: var(--state-thinking); }
.tool-detail { flex: 1; min-width: 0; overflow: auto; padding: var(--space-4); border-right: 1px solid var(--line); }
.tool-heading { display: flex; flex-direction: column; gap: 2px; margin-bottom: var(--space-6); color: var(--ink-muted); font-size: 11px; font-weight: 800; }
.tool-hint { font-size: 10px; font-weight: 500; }
.tool-detail h2 { margin: 0 0 var(--space-2); font-size: 14px; }
.tool-detail p { margin: 0; color: var(--ink-muted); font-size: 12px; line-height: 1.5; }
.tool-detail a { display: inline-block; margin-top: var(--space-4); color: var(--gold-strong); font-size: 12px; font-weight: 800; }
.tool-rail { width: 47px; flex: none; display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding-top: 7px; }
.rail-toggle { margin-bottom: var(--space-3); }
.rail-items { display: grid; gap: var(--space-2); }
.tool-button[aria-pressed='true'] { box-shadow: inset 2px 0 var(--gold-strong); }
.skip-link { position: absolute; z-index: 12; left: var(--space-4); top: var(--space-1); padding: var(--space-2); background: var(--parchment-raised); transform: translateY(-160%); }
.skip-link:focus { transform: translateY(0); }
.drawer-backdrop { display: none; }
@media (max-width: 900px) {
  .workspace-shell, .workspace-shell.left-closed, .workspace-shell.right-hidden, .workspace-shell.tool-open { display: block; height: 100dvh; }
  .workspace-main { height: 100dvh; }
  .navigation-sidebar, .utility-sidebar { position: fixed; z-index: 7; top: 0; bottom: 0; visibility: visible; box-shadow: var(--shadow-stage); }
  .navigation-sidebar { left: 0; width: min(260px, calc(100vw - 48px)); }
  .utility-sidebar { right: 0; width: 48px; }
  .tool-open .utility-sidebar { width: min(292px, calc(100vw - 48px)); }
  .left-closed .navigation-sidebar { transform: translateX(-105%); visibility: hidden; }
  .right-hidden .utility-sidebar { transform: translateX(105%); visibility: hidden; }
  .drawer-backdrop { position: fixed; z-index: 6; inset: 0; display: block; width: 100%; border: 0; background: rgba(20, 24, 36, .3); }
}
@media (max-width: 560px) {
  .workspace-content { padding: var(--space-4); }
  .status-bar span:last-child { display: none; }
}
@media (prefers-reduced-motion: reduce) { .account-chevron { transition: none; } }
</style>
