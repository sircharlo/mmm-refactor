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
import fs from 'fs-extra';
import convert from 'heic-convert';
import klawSync from 'klaw-sync';
import { RenderParameters } from 'pdfjs-dist/types/src/display/api';
import { throttle } from 'quasar';
import { FULL_HD } from 'src/helpers/converters';
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
  if (!window) return 0;
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
  try {
    if (!targetWindow) return;
    const allScreens = getAllScreens();
    const currentMediaScreenNumber = getWindowScreen(targetWindow);
    const targetScreen = allScreens[targetScreenNumber ?? 0];
    if (!targetScreen) return;
    const targetScreenBounds = targetScreen.bounds;
    if (!targetScreenBounds) return;
    if (windowedMode) {
      if (targetWindow.isAlwaysOnTop()) targetWindow.setAlwaysOnTop(false);
      if (targetWindow.isFullScreen()) targetWindow.setFullScreen(false);
      if (targetScreenNumber === currentMediaScreenNumber) return;
      const newBounds = {
        height: 720,
        width: 1280,
        x: targetScreenBounds.x + 50,
        y: targetScreenBounds.y + 50,
      };
      const currentBounds = targetWindow.getBounds();
      if (
        currentBounds.height !== newBounds.height ||
        currentBounds.width !== newBounds.width ||
        currentBounds.x !== newBounds.x ||
        currentBounds.y !== newBounds.y
      ) {
        targetWindow.setBounds(newBounds);
      }
    } else {
      if (
        targetScreenNumber === currentMediaScreenNumber &&
        targetWindow.isAlwaysOnTop()
      )
        return;
      targetWindow.setPosition(targetScreenBounds.x, targetScreenBounds.y);
      if (!targetWindow.isAlwaysOnTop()) targetWindow.setAlwaysOnTop(true);
      if (!targetWindow.isFullScreen()) targetWindow.setFullScreen(true);
    }
    if (!noEvent)
      window.dispatchEvent(
        new CustomEvent('windowScreen-update', {
          detail: { targetScreenNumber, windowedMode },
        }),
      );
  } catch (err) {
    console.error(err);
  }
};

const moveMediaWindow = (
  targetScreenNumber = 0,
  windowedMode = false,
  noEvent = false,
) => {
  try {
    const allScreens = getAllScreens();
    const otherScreens = allScreens.filter((screen) => !screen.mainWindow);
    const mainWindow = getMainWindow();
    const mediaWindow = getMediaWindow();
    if (!mediaWindow || !mainWindow) return;
    if (targetScreenNumber === undefined || windowedMode === undefined) {
      try {
        const screenPreferences = JSON.parse(
          window.localStorage
            .getItem('screenPreferences')
            ?.replace('__q_objt|', '') ?? '{}', // This is a hack, we need to replace the string __q_objt| with an empty string due to Quasar's implementation of LocalStorage
        ) as ScreenPreferences;
        targetScreenNumber = screenPreferences.preferredScreenNumber;
        windowedMode = screenPreferences.preferWindowed;
      } catch (err) {
        console.error(err);
      }
    }
    if (otherScreens.length > 0) {
      if (windowedMode === undefined)
        windowedMode = !mediaWindow.isFullScreen();
      const currentMediaScreenNumber = getWindowScreen(mediaWindow);
      if (targetScreenNumber === undefined || otherScreens.length === 1) {
        targetScreenNumber = allScreens.findIndex((s) => !s.mainWindow);
        if (otherScreens.length > 1) {
          targetScreenNumber = currentMediaScreenNumber;
        }
      }
    } else {
      targetScreenNumber = 0;
      windowedMode = true;
    }
    setWindowPosition(mediaWindow, targetScreenNumber, windowedMode, noEvent);
  } catch (err) {
    console.error(err);
  }
};

const moveMediaWindowThrottled = throttle(() => moveMediaWindow(), 100);

getMainWindow()?.on('move', moveMediaWindowThrottled);

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
  const ret = globalShortcut.register(keySequence, callback);
  if (!ret) {
    console.error('registration failed');
  }
};

const unregisterShortcut = (keySequence: string) => {
  if (!keySequence) return;
  if (globalShortcut.isRegistered(keySequence))
    globalShortcut.unregister(keySequence);
};

const convertPdfToImages = async (pdfPath: string, outputFolder: string) => {
  const outputImages: string[] = [];
  try {
    const data = [];
    const { getDocument } = (await import(
      'pdfjs-dist/webpack.mjs'
    )) as typeof import('pdfjs-dist');

    const loadingTask = getDocument(pdfPath);
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        const scale = Math.min(
          (2 * FULL_HD.width) / viewport.width,
          (2 * FULL_HD.height) / viewport.height,
        );
        const scaledViewport = page.getViewport({ scale: scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const renderContext: RenderParameters = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;

        const pngData = canvas.toDataURL('image/png');
        data.push(pngData);

        const base64Data = pngData.replace(/^data:image\/png;base64,/, '');
        fs.ensureDirSync(outputFolder);
        const outputPath = path.join(
          outputFolder,
          `${path.basename(pdfPath)}_${i}.png`,
        );
        fs.writeFileSync(outputPath, base64Data, 'base64');
        outputImages.push(outputPath);
      } catch (error) {
        console.error(error);
      }
    }
    return outputImages;
  } catch (error) {
    console.error(error);
    return outputImages;
  }
};

contextBridge.exposeInMainWorld('electronApi', {
  convert,
  convertPdfToImages,
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
  fileUrlToPath: (fileurl: string) => {
    const url: typeof import('url') = require('node:url');
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
  openFileDialog: (single?: boolean) => {
    return dialog.showOpenDialog({
      properties: single ? ['openFile'] : ['openFile', 'multiSelections'],
    });
  },

  openFolderDialog: () => {
    return dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    });
  },
  path,
  pathToFileURL: (path: string) => {
    const url: typeof import('url') = require('node:url');
    return url.pathToFileURL(path).href;
  },
  registerShortcut,
  setAutoStartAtLogin: (value: boolean) => {
    try {
      app.setLoginItemSettings({
        openAtLogin: value,
      });
    } catch (error) {
      console.error(error);
    }
  },
  setMediaWindowPosition: (x: number, y: number) => {
    try {
      const mediaWindow = getMediaWindow();
      if (mediaWindow) {
        mediaWindow.setPosition(x, y);
      }
    } catch (error) {
      console.error(error);
    }
  },
  toggleMediaWindow,
  unregisterShortcut,
});
