import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { showMediaWindow } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { SettingsValues } from 'src/types/settings';

import { errorCatcher } from './error-catcher';
const { registerShortcut, unregisterShortcut } = electronApi;

const shortcutCallbacks: Partial<Record<keyof SettingsValues, () => void>> = {
  // shortcutMediaNext: () => {
  //   console.debug('shortcutMediaNext');
  // },
  // shortcutMediaPrevious: () => {
  //   console.debug('shortcutMediaPrevious');
  // },
  shortcutMediaWindow: () => {
    showMediaWindow();
  },
  shortcutMusic: () => {
    window.dispatchEvent(new CustomEvent('toggleMusic'));
  },
};

const getCurrentShortcuts = () => {
  try {
    const currentState = useCurrentStateStore();
    const { currentSettings } = storeToRefs(currentState);
    const shortcuts = [];
    for (const shortcutName of Object.keys(shortcutCallbacks)) {
      const shortcutVal =
        currentSettings.value[shortcutName as keyof SettingsValues];
      if (shortcutVal) shortcuts.push(shortcutVal);
    }
    return shortcuts;
  } catch (error) {
    errorCatcher(error);
    return [];
  }
};

const registerCustomShortcut = (
  shortcutName: Partial<keyof SettingsValues>,
  keySequence?: string,
) => {
  try {
    const currentState = useCurrentStateStore();
    const { currentSettings } = storeToRefs(currentState);
    if (
      !shortcutCallbacks[shortcutName] ||
      !currentSettings.value ||
      !currentSettings.value[shortcutName] ||
      !currentSettings.value.enableKeyboardShortcuts
    )
      return;
    if (!keySequence)
      keySequence = currentSettings.value[shortcutName] as string;
    registerShortcut(keySequence, shortcutCallbacks[shortcutName]!);
  } catch (error) {
    errorCatcher(error);
  }
};

const registerAllCustomShortcuts = () => {
  try {
    const currentState = useCurrentStateStore();
    const { currentSettings } = storeToRefs(currentState);
    if (!currentSettings.value) return;
    unregisterAllCustomShortcuts();
    for (const shortcutName of Object.keys(shortcutCallbacks)) {
      registerCustomShortcut(shortcutName as keyof SettingsValues);
    }
  } catch (error) {
    errorCatcher(error);
  }
};

const unregisterAllCustomShortcuts = () => {
  try {
    const currentState = useCurrentStateStore();
    const { currentSettings } = storeToRefs(currentState);
    if (!currentSettings.value) return;
    for (const shortcutName of Object.keys(
      shortcutCallbacks,
    ) as (keyof SettingsValues)[]) {
      if (!shortcutName || !currentSettings.value[shortcutName]) continue;
      unregisterShortcut(currentSettings.value[shortcutName] as string);
    }
  } catch (error) {
    errorCatcher(error);
  }
};

export {
  getCurrentShortcuts,
  registerAllCustomShortcuts,
  registerCustomShortcut,
  unregisterAllCustomShortcuts,
  unregisterShortcut,
};
