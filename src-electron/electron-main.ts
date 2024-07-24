import { enable, initialize } from '@electron/remote/main';
import { app, BrowserWindow, Menu, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import os from 'os';
import path from 'path';

initialize();
autoUpdater.checkForUpdatesAndNotify();

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();
let mainWindow: BrowserWindow | null | undefined;
let mediaWindow: BrowserWindow | null | undefined;

const allowedHostnames = [
  'jw.org',
  'jw-cdn.org',
  'akamaihd.net',
  'cloudfront.net',
];

const isValidHostname = (hostname: string) => {
  // Check if the hostname is exactly one of the allowed hostnames
  if (allowedHostnames.includes(hostname)) {
    return true;
  }

  // Check for subdomain matches
  return allowedHostnames.some((allowedHostname) => {
    return (
      hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`)
    );
  });
};

function createMediaWindow() {
  const window = new BrowserWindow({
    alwaysOnTop: true,
    backgroundColor: 'black',
    frame: false,
    // roundedCorners: windowOpts.fullscreen,
    fullscreen: false,
    height: 720,
    icon: path.resolve(path.join(__dirname, 'icons', 'media-player.png')),
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
    if (isValidHostname(parsedUrl.hostname)) {
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
    if (isValidHostname(parsedUrl.hostname)) {
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
    backgroundColor: 'grey',
    height: 600,
    show: false,
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

  mainWindow?.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (!mediaWindow) {
    mediaWindow = createMediaWindow();
    mediaWindow.on('close', (/* e */) => {
      // if (!authorizedCloseMediaWin) e.preventDefault();
      // e.preventDefault();
    });
    enable(mediaWindow.webContents);
  }
  mainWindow.loadURL(
    process.env.APP_URL + '?page=initial-congregation-selector',
  );
  mediaWindow.loadURL(process.env.APP_URL + '?page=media-player');
}

app
  .whenReady()
  .then(createWindow)
  .catch((err) => console.error(err));

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
