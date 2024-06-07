import { QueryResponseItem } from 'src/types/sqlite';

export interface ElectronFileFilter {
  name: string;
  extensions: string[];
}

export interface ElectronApi {
  openFolderDialog: () => string[];
  toggleMediaWindow: (action: string) => void;
  getUserDataPath: () => string;
  path: typeof import('path');
  fs: typeof import('fs-extra');
  klawSync: typeof import('klaw-sync');
  decompress: typeof import('decompress');
  convert: typeof import('heic-convert');
  executeQuery: (dbPath: string, query: string) => QueryResponseItem[];
  fileUrlToPath: (url: string) => string;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const electronApi: ElectronApi = (window as { electronApi: ElectronApi })
  .electronApi;
