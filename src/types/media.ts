import { VideoMarker } from './sqlite';

export interface DynamicMediaObject {
  fileUrl: string;
  thumbnailUrl: string;
  title: string;
  uniqueId: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  duration: number;
  customDuration?: { min: number; max: number };
  section: string;
  paragraph?: number;
  footnote?: boolean
  song?: boolean | string
  isAdditional?: boolean
  markers?: VideoMarker[]
}

export interface DownloadedFile {
  path: string;
  new?: boolean;
  error?: boolean;
}

export interface FileDownloader {
  url: string;
  dir: string;
  filename?: string;
  size?: number;
  notify?: boolean;
}
