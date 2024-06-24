import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { showMediaWindow } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { SettingsValues } from 'src/types/settings';
const { registerShortcut, unregisterShortcut } = electronApi;

const shortcutCallbacks: Partial<Record<keyof SettingsValues, () => void>> = {
  shortcutMediaNext: () => {
    console.log('shortcutMediaNext');
  },
  shortcutMediaPrevious: () => {
    console.log('shortcutMediaPrevious');
  },
  shortcutMediaWindow: () => {
    const currentState = useCurrentStateStore();
    const { mediaPlayer } = storeToRefs(currentState);
    showMediaWindow(!mediaPlayer.value.windowVisible);
  },
  shortcutMusic: () => {
    window.dispatchEvent(new CustomEvent('toggleMusic'));
  },
};

const getCurrentShortcuts = () => {
  const currentState = useCurrentStateStore();
  const { currentSettings } = storeToRefs(currentState);
  const shortcuts = [];
  for (const shortcutName of Object.keys(shortcutCallbacks)) {
    const shortcutVal =
      currentSettings.value[shortcutName as keyof SettingsValues];
    if (shortcutVal) shortcuts.push(shortcutVal);
  }
  return shortcuts;
};

const registerCustomShortcut = (
  shortcutName: Partial<keyof SettingsValues>,
  keySequence?: string,
) => {
  const currentState = useCurrentStateStore();
  const { currentSettings } = storeToRefs(currentState);
  if (
    !shortcutCallbacks[shortcutName] ||
    !currentSettings.value ||
    !currentSettings.value[shortcutName] ||
    !currentSettings.value.enableKeyboardShortcuts
  )
    return;
  if (!keySequence) keySequence = currentSettings.value[shortcutName] as string;
  registerShortcut(keySequence, shortcutCallbacks[shortcutName]!);
};

const registerAllCustomShortcuts = () => {
  unregisterAllCustomShortcuts();
  for (const shortcutName of Object.keys(shortcutCallbacks)) {
    registerCustomShortcut(shortcutName as keyof SettingsValues);
  }
};

const unregisterAllCustomShortcuts = () => {
  const currentState = useCurrentStateStore();
  const { currentSettings } = storeToRefs(currentState);
  for (const shortcutName of Object.keys(
    shortcutCallbacks,
  ) as (keyof SettingsValues)[]) {
    if (!shortcutName || !currentSettings.value[shortcutName]) continue;
    unregisterShortcut(currentSettings.value[shortcutName] as string);
  }
};

export {
  getCurrentShortcuts,
  registerAllCustomShortcuts,
  registerCustomShortcut,
  unregisterAllCustomShortcuts,
  unregisterShortcut,
};
