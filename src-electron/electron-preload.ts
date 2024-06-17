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
import { Point, contextBridge } from 'electron';
import fs from 'fs-extra';
import convert from 'heic-convert';
import klawSync from 'klaw-sync';
import { LocalStorage } from 'quasar';
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

const getAllScreens = (type?: string) => {
  let displays = getScreens();
  const winMidpoints: { main?: Point; media?: Point } = {};
  const mainWindow = getMainWindow();
  const mediaWindow = getMediaWindow();
  if (mainWindow) {
    try {
      let posSize = mainWindow.getPosition().concat(mainWindow.getSize());
      winMidpoints.main = {
        x: posSize[0] + posSize[2] / 2,
        y: posSize[1] + posSize[3] / 2,
      };
      if (mediaWindow) {
        posSize = mediaWindow.getPosition().concat(mainWindow.getSize());
        winMidpoints.media = {
          x: posSize[0] + posSize[2] / 2,
          y: posSize[1] + posSize[3] / 2,
        };
      }
      if (type === 'other') {
        displays = displays.filter(
          (display) =>
            display.id !==
            screen.getDisplayNearestPoint(winMidpoints.main as Point).id,
        );
      } else {
        const mainWindowScreen = displays.find(
          (display) =>
            display.id ===
            screen.getDisplayNearestPoint(winMidpoints.media as Point).id,
        ) as { mainWindow?: boolean } & Electron.Display;
        if (mainWindowScreen) mainWindowScreen.mainWindow = true;
      }
    } catch (err) {
      console.error(err);
    }
  }
  return displays;
};

const moveMediaWindow = () => {
  const otherScreens = getAllScreens('other');
  const mediaWindow = getMediaWindow();
  if (otherScreens.length > 0) {
    // One or more other screens found
    const { preferWindowed, preferredScreenNumber } = (LocalStorage.getItem(
      'screenPreferences',
    ) || {}) as ScreenPreferences;
    let targetScreen = 0;
    if (otherScreens.length > 1) {
      // More than one other screen found, so get user preferences for screen selection
      targetScreen = preferredScreenNumber ?? 0;
    }
    mediaWindow?.setPosition(
      otherScreens[targetScreen].workArea.x + 50,
      otherScreens[targetScreen].workArea.y + 50,
    );
    mediaWindow?.setFullScreen(!preferWindowed);
    mediaWindow?.setAlwaysOnTop(!preferWindowed);
  } else {
    // Only one screen found, so media window is windowed and not always on top
    mediaWindow?.setFullScreen(false);
    mediaWindow?.setAlwaysOnTop(false);
  }
};

getMainWindow()?.on('move', moveMediaWindow);

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
  if (action === 'show') {
    moveMediaWindow();
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
  // pdfToImg: require('pdf-to-img'),
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
  fileUrlToPath: (fileurl: string) => {
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
