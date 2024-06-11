import { QueryResponseItem } from 'src/types/sqlite';

export interface ElectronFileFilter {
  extensions: string[];
  name: string;
}

export interface ElectronApi {
  convert: typeof import('heic-convert');
  decompress: typeof import('decompress');
  executeQuery: (dbPath: string, query: string) => QueryResponseItem[];
  fileUrlToPath: (url: string) => string;
  fs: typeof import('fs-extra');
  getUserDataPath: () => string;
  klawSync: typeof import('klaw-sync');
  openFolderDialog: () => string[];
  path: typeof import('path');
  toggleMediaWindow: (action: string) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const electronApi: ElectronApi = (window as { electronApi: ElectronApi })
  .electronApi;
