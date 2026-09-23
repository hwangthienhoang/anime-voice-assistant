import { readonly, ref } from 'vue';

const theme = ref('light');
let initialized = false;

function applyTheme(value) {
  theme.value = value === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme.value;
}

function initializeTheme() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  let saved;
  try { saved = window.localStorage.getItem('wishlight-theme'); } catch { /* Storage can be unavailable. */ }
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  applyTheme(saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light');
}

function setTheme(value) {
  initializeTheme();
  applyTheme(value);
  try { window.localStorage.setItem('wishlight-theme', theme.value); } catch { /* Keep this session's choice. */ }
}

export function useWorkspaceTheme() {
  return { theme: readonly(theme), initializeTheme, setTheme };
}
