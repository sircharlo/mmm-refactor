import type { ShortcutDetails } from 'electron';
import type { PathLike } from 'fs';
import type fs from 'fs-extra';
import type heicConvert from 'heic-convert';
import type klawSync from 'klaw-sync';
import type { IAudioMetadata, IOptions } from 'music-metadata';
import type path from 'path';
import type { QueryResponseItem } from 'src/types';

export interface ElectronFileFilter {
  extensions: string[];
  name: string;
}

export interface ElectronApi {
  closeWebsiteWindow: () => void;
  convert: typeof heicConvert;
  convertPdfToImages: (
    pdfPath: string,
    outputFolder: string,
  ) => Promise<string[]>;
  decompress: (inputZip: string, outputFolder: string) => Promise<void>;
  executeQuery: (dbPath: string, query: string) => QueryResponseItem[];
  fileUrlToPath: (url: PathLike) => string;
  fs: typeof fs;
  getAllScreens: (
    type?: string,
  ) => ({ mainWindow?: boolean; mediaWindow?: boolean } & Electron.Display)[];
  getAppDataPath: () => string;
  getAppVersion: () => string;
  getLocalPathFromFileObject: (fileObject: File) => string;
  getUserDataPath: () => string;
  getUserDesktopPath: () => string;
  isFileUrl: (url: string) => boolean;
  klawSync: typeof klawSync;
  moveMediaWindow: (
    targetScreenNumber?: number,
    windowedMode?: boolean,
    noEvent?: boolean,
  ) => void;
  navigateWebsiteWindow: (action: string) => void;
  openExternalWebsite: (url: string) => void;
  openFileDialog: (
    single?: boolean,
    filter?: string[],
  ) => Promise<Electron.OpenDialogReturnValue>;
  openWebsiteWindow: () => void;
  parseFile: (filePath: string, options?: IOptions) => Promise<IAudioMetadata>;
  path: typeof path;
  pathToFileURL: (path: string) => string;
  readShortcutLink: (shortcutPath: string) => ShortcutDetails;
  registerShortcut: (shortcut: string, callback: () => void) => void;
  setAutoStartAtLogin: (value: boolean) => void;
  toggleMediaWindow: (action: string) => void;
  unregisterShortcut: (shortcut: string) => void;
  writeShortcutLink: (shortcutPath: string, details: ShortcutDetails) => void;
  zoomWebsiteWindow: (action: string) => void;
}

export const electronApi: ElectronApi = window.electronApi;
