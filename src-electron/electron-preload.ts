/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import {
  BrowserWindow,
  app,
  dialog,
  globalShortcut,
  screen,
} from '@electron/remote';
import * as sqlite3 from 'better-sqlite3';
import decompress from 'decompress';
import { contextBridge } from 'electron';
import { PathLike } from 'fs';
import fs from 'fs-extra';
import convert from 'heic-convert';
import klawSync from 'klaw-sync';
import { debounce } from 'quasar';
import { ScreenPreferences } from 'src/types/settings';
import path from 'upath';

const getMainWindow = () =>
  BrowserWindow.getAllWindows().find(
    (w) => !w.webContents.getURL().includes('media-player'),
  );
const getMediaWindow = () =>
  BrowserWindow.getAllWindows().find((w) =>
    w.webContents.getURL().includes('media-player'),
  );

const getScreens = () =>
  screen
    .getAllDisplays()
    .sort((a, b) => a.bounds.x + a.bounds.y - (b.bounds.x + b.bounds.y));

const getAllScreens = () => {
  const displays = getScreens();
  const mainWindow = getMainWindow();
  if (mainWindow) {
    try {
      const mainWindowScreen = displays.find(
        (display) =>
          display.id === screen.getDisplayMatching(mainWindow.getBounds()).id,
      ) as { mainWindow?: boolean } & Electron.Display;
      if (mainWindowScreen) mainWindowScreen.mainWindow = true;
    } catch (err) {
      console.error(err);
    }
  }
  return displays as ({ mainWindow?: boolean } & Electron.Display)[];
};

const getWindowScreen = (window: Electron.BrowserWindow) => {
  const allScreens = getAllScreens();
  const windowDisplay = screen.getDisplayMatching(window.getBounds());
  return allScreens.findIndex((display) => display.id === windowDisplay.id);
};

const setWindowPosition = (
  targetWindow: Electron.BrowserWindow,
  targetScreenNumber: number | undefined,
  windowedMode = false,
  noEvent?: boolean,
) => {
  if (!targetWindow) return;
  const allScreens = getAllScreens();
  console.log('allScreens', allScreens);
  const currentMediaScreenNumber = getWindowScreen(targetWindow);
  console.log(
    'targetScreen, currentMediaScreenNumber',
    targetScreenNumber,
    currentMediaScreenNumber,
  );
  const targetScreen = allScreens[targetScreenNumber ?? 0];
  console.log('targetScreen', targetScreen);
  if (!targetScreen) return;
  const targetScreenBounds = targetScreen.bounds;
  console.log('targetScreenBounds', targetScreenBounds);
  if (!targetScreenBounds) return;
  if (windowedMode) {
    if (targetWindow.isAlwaysOnTop()) targetWindow.setAlwaysOnTop(false);
    if (targetWindow.isFullScreen()) targetWindow.setFullScreen(false);
    const newBounds = {
      height: 720,
      width: 1280,
      x: targetScreenBounds.x + 50,
      y: targetScreenBounds.y + 50,
    };
    const currentBounds = targetWindow.getBounds();
    console.log(
      'currentBounds, newBounds',
      currentBounds.height,
      newBounds.height,
      currentBounds.width,
      newBounds.width,
      currentBounds.x,
      newBounds.x,
      currentBounds.y,
      newBounds.y,
      currentBounds.height !== newBounds.height,
      currentBounds.width !== newBounds.width,
      currentBounds.x !== newBounds.x,
      currentBounds.y !== newBounds.y,
    );
    if (
      currentBounds.height !== newBounds.height ||
      currentBounds.width !== newBounds.width ||
      currentBounds.x !== newBounds.x ||
      currentBounds.y !== newBounds.y
    ) {
      targetWindow.setBounds(newBounds);
    }
  } else {
    targetWindow.setPosition(
      targetScreenBounds.x + 50,
      targetScreenBounds.y + 50,
    );
    if (!targetWindow.isAlwaysOnTop()) targetWindow.setAlwaysOnTop(true);
    if (!targetWindow.isFullScreen()) targetWindow.setFullScreen(true);
  }
  if (!noEvent)
    window.dispatchEvent(
      new CustomEvent('windowScreen-update', {
        detail: { targetScreen, windowedMode },
      }),
    );
};

const moveMediaWindow = (jsonString?: string) => {
  let targetScreen: number | undefined;
  let windowedMode = false;
  let noEvent = false;
  if (jsonString) {
    try {
      [noEvent, targetScreen, windowedMode] = JSON.parse(jsonString);
    } catch (err) {
      console.error(err);
    }
  }
  console.log('moveMediaWindow', targetScreen, windowedMode);
  const allScreens = getAllScreens();
  const otherScreens = allScreens.filter((screen) => !screen.mainWindow);
  const mainWindow = getMainWindow();
  const mediaWindow = getMediaWindow();
  if (!mediaWindow || !mainWindow) return;
  if (targetScreen === undefined || windowedMode === undefined) {
    try {
      const screenPreferences = JSON.parse(
        window.localStorage
          .getItem('screenPreferences')
          ?.replace('__q_objt|', '') ?? '{}', // This is a hack, we need to replace the string __q_objt| with an empty string due to Quasar's implementation of LocalStorage
      ) as ScreenPreferences;
      console.log('screenPreferences from LocalStorage', screenPreferences);
      targetScreen = screenPreferences.preferredScreenNumber;
      windowedMode = screenPreferences.preferWindowed;
    } catch (err) {
      console.error(err);
    }
  }
  if (otherScreens.length > 0) {
    console.log('otherScreens.length > 0', otherScreens.length);
    if (windowedMode === undefined) windowedMode = !mediaWindow.isFullScreen();
    if (targetScreen === undefined) {
      targetScreen = allScreens.findIndex((s) => !s.mainWindow);
      if (otherScreens.length > 1) {
        const currentMediaScreenNumber = getWindowScreen(mediaWindow);
        targetScreen =
          getWindowScreen(mainWindow) === currentMediaScreenNumber
            ? 0
            : currentMediaScreenNumber;
      }
    }
  } else {
    targetScreen = 0;
    windowedMode = true;
  }
  setWindowPosition(mediaWindow, targetScreen, windowedMode, noEvent);
};

const moveMediaWindowDebounced = debounce(moveMediaWindow, 100);

getMainWindow()?.on('move', moveMediaWindowDebounced);

window.addEventListener('beforeunload', () => {
  getMainWindow()?.removeAllListeners('move');
});

screen.removeAllListeners('display-metrics-changed');
screen.removeAllListeners('display-added');
screen.removeAllListeners('display-removed');

screen.on('display-metrics-changed', () => {
  moveMediaWindow();
});

screen.on('display-added', () => {
  moveMediaWindow();
});

screen.on('display-removed', () => {
  moveMediaWindow();
});

const isWritable = (filePath: fs.PathLike) => {
  let fileAccess = false;
  try {
    fs.closeSync(fs.openSync(filePath, 'r+'));
    fileAccess = true;
  } catch (err) {
    console.error('can not open file:' + filePath, 'error:' + err);
  }
  return fileAccess;
};

function sleepSync(ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // Busy wait
  }
}

const toggleMediaWindow = (action: string) => {
  const mediaWindow = getMediaWindow();
  if (!mediaWindow) return;
  if (action === 'show') {
    moveMediaWindow();
    if (!mediaWindow.isVisible()) {
      mediaWindow.show();
    }
  } else if (action === 'hide') {
    mediaWindow.hide();
  }
};

const registerShortcut = (keySequence: string, callback: () => void) => {
  if (!keySequence) return;
  console.log('registering shortcut', keySequence, callback);
  const ret = globalShortcut.register(keySequence, callback);
  if (!ret) {
    console.error('registration failed');
  }
  console.log(globalShortcut.isRegistered(keySequence));
};

const unregisterShortcut = (keySequence: string) => {
  if (!keySequence) return;
  console.log('unregistering shortcut', keySequence);
  if (globalShortcut.isRegistered(keySequence))
    globalShortcut.unregister(keySequence);
};

contextBridge.exposeInMainWorld('electronApi', {
  convert,
  decompress,
  executeQuery: (dbPath: string, query: string) => {
    try {
      let attempts = 0;
      const maxAttempts = 10;
      const delay = 250;

      while (attempts < maxAttempts) {
        if (isWritable(dbPath)) {
          const db = sqlite3.default(dbPath);
          return db.prepare(query).all();
        }
        attempts++;
        sleepSync(delay);
      }

      return {};
    } catch (error) {
      console.error(error + '\n' + query + '\n' + dbPath);
      return {};
    }
  },
  fileUrlToPath: (fileurl: PathLike) => {
    const url = require('node:url');
    return url.fileURLToPath(fileurl);
  },
  fs,
  getAllScreens,
  getAppDataPath: () => {
    return app.getPath('appData');
  },
  getUserDataPath: () => {
    return app.getPath('userData');
  },
  klawSync,
  moveMediaWindow,
  openFileDialog: async () => {
    return await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    });
  },
  openFolderDialog: () => {
    return dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    });
  },
  path,
  registerShortcut,
  setAutoStartAtLogin: (value: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: value,
    });
  },
  setMediaWindowPosition: (x: number, y: number) => {
    const mediaWindow = getMediaWindow();
    if (mediaWindow) {
      mediaWindow.setPosition(x, y);
    }
  },
  toggleMediaWindow,
  unregisterShortcut,
});
