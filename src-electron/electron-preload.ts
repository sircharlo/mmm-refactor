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

import { BrowserWindow, app, dialog, screen } from '@electron/remote';
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
          display.id === screen.getDisplayMatching(mainWindow?.getBounds()).id,
      ) as { mainWindow?: boolean } & Electron.Display;
      if (mainWindowScreen) mainWindowScreen.mainWindow = true;
    } catch (err) {
      console.error(err);
    }
  }
  return displays as ({ mainWindow?: boolean } & Electron.Display)[];
};

const moveMediaWindow = ({
  noEvent,
  targetScreen,
  windowedMode,
}: {
  noEvent?: boolean;
  targetScreen?: number;
  windowedMode?: boolean;
}) => {
  console.log('moveMediaWindow', targetScreen, windowedMode);
  const allScreens = getAllScreens();
  const otherScreens = allScreens.filter((screen) => !screen.mainWindow);
  const mainWindow = getMainWindow();
  const mediaWindow = getMediaWindow();
  if (!mediaWindow || !mainWindow) return;
  if (targetScreen === undefined || windowedMode === undefined) {
    try {
      const screenPreferences = JSON.parse(
        localStorage.getItem('screenPreferences') ?? '{}',
      ) as ScreenPreferences;
      // todo: fix this, not reading right values
      console.log('screenPreferences', screenPreferences);
      targetScreen = screenPreferences.preferredScreenNumber;
      windowedMode = screenPreferences.preferWindowed;
    } catch (err) {
      console.error(err);
    }
  }
  const getWindowScreen = (window: Electron.BrowserWindow) => {
    const windowDisplay = screen.getDisplayMatching(window.getBounds());
    return allScreens.findIndex((display) => display.id === windowDisplay.id);
  };
  const setPosition = (targetScreen = 0) => {
    const currentMediaScreenNumber = getWindowScreen(mediaWindow);
    if (targetScreen !== currentMediaScreenNumber) {
      mediaWindow?.setPosition(
        allScreens[targetScreen].workArea.x + 50,
        allScreens[targetScreen].workArea.y + 50,
      );
    }
    if (!mediaWindow?.isFullScreen()) mediaWindow?.setSize(1280, 720, true);
    if (!noEvent)
      window.dispatchEvent(
        new CustomEvent('targetScreen-update', {
          detail: targetScreen,
        }),
      );
  };
  const setFullScreen = (enabled: boolean) => {
    if (enabled) {
      // Make media window fullscreen if it's not already
      if (!mediaWindow?.isFullScreen()) mediaWindow?.setFullScreen(true);
      if (!mediaWindow?.isAlwaysOnTop()) mediaWindow?.setAlwaysOnTop(true);
    } else {
      // Make media window windowed if it's not already
      if (mediaWindow?.isFullScreen()) mediaWindow?.setFullScreen(false);
      if (mediaWindow?.isAlwaysOnTop()) mediaWindow?.setAlwaysOnTop(false);
    }
    if (!noEvent)
      window.dispatchEvent(
        new CustomEvent('windowedMode-update', {
          detail: !enabled,
        }),
      );
  };
  if (otherScreens.length > 0) {
    if (windowedMode === undefined) windowedMode = !mediaWindow?.isFullScreen();
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
    setFullScreen(!windowedMode);
  } else {
    setFullScreen(false);
  }
  setPosition(targetScreen);
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
  moveMediaWindow({});
});

screen.on('display-added', () => {
  moveMediaWindow({});
});

screen.on('display-removed', () => {
  moveMediaWindow({});
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
  if (action === 'show') {
    moveMediaWindow({});
    if (!mediaWindow?.isVisible()) {
      mediaWindow?.show();
    }
  } else if (action === 'hide') {
    mediaWindow?.hide();
  }
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
});
