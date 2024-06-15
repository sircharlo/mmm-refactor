import { enable, initialize } from '@electron/remote/main';
import { BrowserWindow, Menu, app, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import os from 'os';
import path from 'path';

initialize();
autoUpdater.checkForUpdatesAndNotify();

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();
let mainWindow: BrowserWindow | null | undefined;
let mediaWindow: BrowserWindow | null | undefined;

function createMediaWindow() {
  const window = new BrowserWindow({
    alwaysOnTop: true,
    backgroundColor: 'black',
    frame: false,
    // roundedCorners: windowOpts.fullscreen,
    fullscreen: false,
    height: 720,
    minHeight: 110,
    minWidth: 195,
    show: false,
    thickFrame: false,
    title: 'Media Window',
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      sandbox: false,
      webSecurity: false,
    },
    width: 1280,
    x: 50,
    y: 50,
  });

  window.setAspectRatio(16 / 9);
  if (platform !== 'darwin') {
    window.setMenuBarVisibility(false);
  }
  if (process.env.DEBUGGING) {
    window.webContents.openDevTools();
    // } else {
    // window.webContents.on('devtools-opened', () => {
    //   mainWindow?.webContents.closeDevTools();
    // });
    // window.webContents.openDevTools();
  }

  return window;
}

function createWindow() {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const parsedUrl = new URL(details.url);
    if (
      parsedUrl.hostname.includes('jw.org') ||
      parsedUrl.hostname.includes('jw-cdn.org') ||
      parsedUrl.hostname.includes('akamaihd') ||
      parsedUrl.hostname.includes('cloudfront.net')
    ) {
      if (details.requestHeaders) {
        const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}/`;
        details.requestHeaders.Referer = baseUrl;
        details.requestHeaders.Origin = baseUrl;
        details.requestHeaders['User-Agent'] = details.requestHeaders[
          'User-Agent'
        ].replace('Electron', '');
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  });
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const parsedUrl = new URL(details.url);
    if (
      parsedUrl.hostname.includes('jw.org') ||
      parsedUrl.hostname.includes('jw-cdn.org') ||
      parsedUrl.hostname.includes('akamaihd') ||
      parsedUrl.hostname.includes('cloudfront.net')
    ) {
      if (details.responseHeaders) {
        if (
          !details.responseHeaders['access-control-allow-origin'] ||
          !details.responseHeaders['access-control-allow-origin'].includes('*')
        ) {
          details.responseHeaders['access-control-allow-origin'] = ['*'];
          details.responseHeaders['access-control-allow-credentials'] = [
            'true',
          ];
        }
      }
    }
    callback({ responseHeaders: details.responseHeaders });
  });
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    // backgroundColor: 'black',
    useContentSize: true,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      sandbox: false,
      webSecurity: false,
    },
    width: 1000,
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate([]));

  enable(mainWindow.webContents);
  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  );

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools();
    // } else {
    // mainWindow.webContents.on('devtools-opened', () => {
    //   mainWindow?.webContents.closeDevTools();
    // });
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
  mediaWindow?.on('closed', () => {
    mediaWindow = undefined;
  });

  mainWindow.on('close', () => {
    mediaWindow?.close();
  });

  if (!mediaWindow) {
    mediaWindow = createMediaWindow();
    mediaWindow.on('close', (/* e */) => {
      // if (!authorizedCloseMediaWin) e.preventDefault();
      // e.preventDefault();
    });
    enable(mediaWindow.webContents);
  }
  mainWindow.loadURL(process.env.APP_URL + '?page=congregation-selector');
  mediaWindow.loadURL(process.env.APP_URL + '?page=media-player');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});
