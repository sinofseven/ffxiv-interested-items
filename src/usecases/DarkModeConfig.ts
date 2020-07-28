const DARK_MODE_KEY = "DarkModeKey";
const DARK_MODE_TRUE_VALUE = "true";
const DARK_NODE_FALSE_VALUE = "false";

export function loadDarkModeConfig(): boolean {
  const textDarkMode = window.localStorage.getItem(DARK_MODE_KEY);
  return textDarkMode === DARK_MODE_TRUE_VALUE;
}

export function saveDarkModeConfig(state: boolean) {
  const text = state ? DARK_MODE_TRUE_VALUE : DARK_NODE_FALSE_VALUE;
  window.localStorage.setItem(DARK_MODE_KEY, text);
}
