import { VideoMarker } from 'src/types/sqlite';

export interface DynamicMediaObject {
  customDuration?: { max: number; min: number };
  duration: number;
  fileUrl: string;
  footnote?: boolean;
  isAdditional?: boolean;
  isAudio: boolean;
  isImage: boolean;
  isVideo: boolean;
  markers?: VideoMarker[];
  paragraph?: number;
  section: string;
  song?: boolean | string;
  subtitlesUrl?: string;
  thumbnailUrl: string;
  title: string;
  uniqueId: string;
}

export interface DownloadedFile {
  error?: boolean;
  new?: boolean;
  path: string;
}

export interface DownloadProgressItems {
  [key: string]: {
    complete?: boolean;
    error?: boolean;
    loaded?: number;
    total?: number;
  };
}

export interface FileDownloader {
  dir: string;
  filename?: string;
  lowPriority?: boolean;
  notify?: boolean;
  size?: number;
  url: string;
}

export interface CacheFile {
  orphaned: boolean;
  path: string;
  size: number;
}
