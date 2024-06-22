import { PathLike } from 'fs';
import { QueryResponseItem } from 'src/types/sqlite';

export interface ElectronFileFilter {
  extensions: string[];
  name: string;
}

export interface ElectronApi {
  convert: typeof import('heic-convert');
  decompress: typeof import('decompress');
  executeQuery: (dbPath: string, query: string) => QueryResponseItem[];
  fileUrlToPath: (url: PathLike) => string;
  fs: typeof import('fs-extra');
  getAllScreens: (
    type?: string,
  ) => ({ mainWindow?: boolean } & Electron.Display)[];
  getAppDataPath: () => string;
  getUserDataPath: () => string;
  klawSync: typeof import('klaw-sync');
  moveMediaWindow: ({
    targetScreen,
    windowedMode,
  }: {
    noEvent: boolean;
    targetScreen?: number;
    windowedMode?: boolean;
  }) => void;
  openFileDialog: () => Promise<Electron.OpenDialogReturnValue>;
  openFolderDialog: () => string[];
  path: typeof import('path');
  registerShortcut: (shortcut: string, callback: () => void) => void;
  setAutoStartAtLogin: (value: boolean) => void;
  toggleMediaWindow: (action: string) => void;
  unregisterShortcut: (shortcut: string) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const electronApi: ElectronApi = (window as { electronApi: ElectronApi })
  .electronApi;
