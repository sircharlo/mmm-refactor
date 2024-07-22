import { PathLike } from 'fs';
import { IAudioMetadata, IOptions } from 'music-metadata';
import { QueryResponseItem } from 'src/types/sqlite';

export interface ElectronFileFilter {
  extensions: string[];
  name: string;
}

export interface ElectronApi {
  convert: typeof import('heic-convert');
  convertPdfToImages: (
    pdfPath: string,
    outputFolder: string,
  ) => Promise<string[]>;
  decompress: typeof import('decompress');
  executeQuery: (dbPath: string, query: string) => QueryResponseItem[];
  fileUrlToPath: (url: PathLike) => string;
  fs: typeof import('fs-extra');
  getAllScreens: (
    type?: string,
  ) => ({ mainWindow?: boolean; mediaWindow?: boolean } & Electron.Display)[];
  getAppDataPath: () => string;
  getAppVersion: () => string;
  getUserDataPath: () => string;
  klawSync: typeof import('klaw-sync');
  moveMediaWindow: (
    targetScreenNumber?: number,
    windowedMode?: boolean,
    noEvent?: boolean,
  ) => void;
  openExternalWebsite: (url: string) => void;
  openFileDialog: (single?: boolean) => Promise<Electron.OpenDialogReturnValue>;
  openFolderDialog: () => string[];
  parseFile: (filePath: string, options?: IOptions) => Promise<IAudioMetadata>;
  path: typeof import('path');
  pathToFileURL: (path: string) => string;
  registerShortcut: (shortcut: string, callback: () => void) => void;
  setAutoStartAtLogin: (value: boolean) => void;
  toggleMediaWindow: (action: string) => void;
  unregisterShortcut: (shortcut: string) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const electronApi: ElectronApi = (window as { electronApi: ElectronApi })
  .electronApi;
