import type { ShortcutDetails } from 'electron';
import type { PathLike } from 'fs';
import type { IAudioMetadata, IOptions } from 'music-metadata';
import type { QueryResponseItem } from 'src/types';

export interface ElectronFileFilter {
  extensions: string[];
  name: string;
}

export interface ElectronApi {
  closeWebsiteWindow: () => void;
  convert: typeof import('heic-convert');
  convertPdfToImages: (
    pdfPath: string,
    outputFolder: string,
  ) => Promise<string[]>;
  decompress: (inputZip: string, outputFolder: string) => Promise<void>;
  executeQuery: (dbPath: string, query: string) => QueryResponseItem[];
  fileUrlToPath: (url: PathLike) => string;
  fs: typeof import('fs-extra');
  getAllScreens: (
    type?: string,
  ) => ({ mainWindow?: boolean; mediaWindow?: boolean } & Electron.Display)[];
  getAppDataPath: () => string;
  getAppVersion: () => string;
  getLocalPathFromFileObject: (fileObject: File) => string;
  getUserDataPath: () => string;
  getUserDesktopPath: () => string;
  isFileUrl: (url: string) => boolean;
  klawSync: typeof import('klaw-sync');
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
  path: typeof import('path');
  pathToFileURL: (path: string) => string;
  readShortcutLink: (shortcutPath: string) => ShortcutDetails;
  registerShortcut: (shortcut: string, callback: () => void) => void;
  setAutoStartAtLogin: (value: boolean) => void;
  toggleMediaWindow: (action: string) => void;
  unregisterShortcut: (shortcut: string) => void;
  writeShortcutLink: (shortcutPath: string, details: ShortcutDetails) => void;
  zoomWebsiteWindow: (action: string) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const electronApi: ElectronApi = (window as { electronApi: ElectronApi })
  .electronApi;
