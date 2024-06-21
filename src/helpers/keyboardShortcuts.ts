import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { showMediaWindow } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { SettingsValues } from 'src/types/settings';
const { registerShortcut, unregisterShortcut } = electronApi;

const shortcutCallbacks: Partial<Record<keyof SettingsValues, () => void>> = {
  shortcutMediaWindow: () => {
    const currentState = useCurrentStateStore();
    const { mediaPlayer } = storeToRefs(currentState);
    showMediaWindow(!mediaPlayer.value.windowVisible);
  },
};

const registerCustomShortcut = (
  shortcutName: Partial<keyof SettingsValues>,
  keySequence?: string,
) => {
  const currentState = useCurrentStateStore();
  const { currentSettings } = storeToRefs(currentState);
  console.log(
    'Registering custom keyboardShortcuts',
    shortcutName,
    keySequence,
    currentSettings.value[shortcutName],
    currentSettings.value.enableKeyboardShortcuts,
  );
  if (
    !shortcutCallbacks[shortcutName] ||
    !currentSettings.value ||
    !currentSettings.value[shortcutName] ||
    !currentSettings.value.enableKeyboardShortcuts
  )
    return;
  if (!keySequence) keySequence = currentSettings.value[shortcutName] as string;
  registerShortcut(keySequence, shortcutCallbacks[shortcutName]!);
  console.log('Registered shortcut', keySequence, shortcutName);
};

const registerAllCustomShortcuts = () => {
  for (const shortcutName of Object.keys(shortcutCallbacks)) {
    registerCustomShortcut(shortcutName as keyof SettingsValues);
  }
};

const unregisterAllCustomShortcuts = () => {
  const currentState = useCurrentStateStore();
  const { currentSettings } = storeToRefs(currentState);
  console.log('Unregistering all shortcuts');
  for (const shortcutName of Object.keys(
    shortcutCallbacks,
  ) as (keyof SettingsValues)[]) {
    if (shortcutName || !currentSettings.value[shortcutName]) continue;
    console.log('Unregistering shortcut', shortcutName);
    unregisterShortcut(shortcutName);
  }
};

export {
  registerAllCustomShortcuts,
  registerCustomShortcut,
  unregisterAllCustomShortcuts,
  unregisterShortcut,
};
