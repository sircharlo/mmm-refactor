import { Buffer } from 'buffer';
import { Item } from 'klaw-sync';
import { FULL_HD } from 'src/helpers/converters';
import { electronApi } from 'src/helpers/electron-api';
import { downloadFileIfNeeded, getJwMediaInfo } from 'src/helpers/jw-media';
import { isImage, isVideo } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { PublicationFetcher } from 'src/types/publications';
import { MultimediaItem } from 'src/types/sqlite';

const { fs, getUserDataPath, klawSync, path } = electronApi;

const getPublicationsPath = () => path.join(getUserDataPath(), 'Publications');

const getAdditionalMediaPath = () =>
  path.join(getUserDataPath(), 'Additional Media');

const getTempDirectory = () => {
  return path.join(getUserDataPath(), 'Temp');
};

const getPublicationDirectory = (
  publication: PublicationFetcher,
  create?: boolean,
) => {
  const dir = path.join(
    getPublicationsPath(),
    publication.pub +
      '_' +
      publication.langwritten +
      (publication.issue ? '_' + publication.issue.toString() : ''),
  );
  if (create) fs.ensureDirSync(dir);
  return dir;
};
const getPublicationDirectoryContents = (
  publication: PublicationFetcher,
  filter?: string,
) => {
  const dir = getPublicationDirectory(publication);
  if (!fs.existsSync(dir)) return [];
  const files = klawSync(dir, {
    filter: (file) => {
      if (!filter || !file.path) return true;
      return path
        .basename(file.path.toLowerCase())
        .includes(filter.toLowerCase());
    },
    nodir: true,
  });
  return files as Item[];
};

const getFileUrl = (path: string) => {
  if (!path || !fs.existsSync(path)) return '';
  return new URL(path).href;
};

const getDurationFromMediaPath: (mediaPath: string) => Promise<number> = (
  mediaPath: string,
) => {
  return new Promise((resolve, reject) => {
    if (!mediaPath) {
      reject(new Error('No media path provided'));
      return;
    }

    const mediaRef = document.createElement(
      isVideo(mediaPath) ? 'video' : 'audio',
    );
    mediaRef.src = getFileUrl(mediaPath);
    mediaRef.load();

    mediaRef.addEventListener('loadeddata', () => {
      mediaRef.remove();
      resolve(mediaRef.duration);
    });

    mediaRef.addEventListener('error', (err) => {
      mediaRef.remove();
      reject(new Error('Error loading media: ' + err));
    });
  });
};

const getThumbnailFromVideoPath: (
  videoPath: string,
  thumbnailPath: string,
) => Promise<string> = (videoPath: string, thumbnailPath: string) => {
  return new Promise((resolve, reject) => {
    if (!videoPath) {
      reject(new Error('No video path provided'));
      return;
    }

    if (!fs.existsSync(videoPath)) {
      reject(new Error('Video path does not exist: ' + videoPath));
      return;
    }

    const videoRef = document.createElement('video');
    videoRef.src = getFileUrl(videoPath);
    videoRef.load();

    videoRef.addEventListener('loadeddata', () => {
      videoRef.addEventListener(
        'seeked',
        () => {
          const canvas = document.createElement('canvas');
          canvas.width = FULL_HD.width;
          canvas.height = FULL_HD.height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL('image/jpeg');
            // save to file
            fs.writeFileSync(
              thumbnailPath,
              Buffer.from(imageUrl.split(',')[1], 'base64'),
            );

            // Cleanup
            canvas.remove();
            videoRef.remove();

            resolve(thumbnailPath);
          } else {
            // Cleanup in case of error
            canvas.remove();
            videoRef.remove();
            reject(new Error('Failed to get canvas context'));
          }
        },
        { once: true },
      );
      videoRef.currentTime = 5;
    });

    videoRef.addEventListener('error', (err) => {
      // Cleanup in case of error
      videoRef.remove();
      reject(
        new Error('Error loading video: ' + err.message + ' ' + videoPath),
      );
    });
  });
};

const getThumbnailUrl = async (filepath: string, forceRefresh?: boolean) => {
  let thumbnailUrl = '';
  if (isImage(filepath)) {
    thumbnailUrl = getFileUrl(filepath);
  } else if (isVideo(filepath)) {
    const thumbnailPath = filepath.split('.')[0] + '.jpg';
    if (fs.existsSync(thumbnailPath)) {
      thumbnailUrl = getFileUrl(thumbnailPath);
    } else {
      thumbnailUrl = await getThumbnailFromVideoPath(filepath, thumbnailPath);
    }
  }
  return thumbnailUrl + (forceRefresh ? '?timestamp=' + Date.now() : '');
};

const getSubtitlesUrl = async (
  multimediaItem: MultimediaItem,
  comparisonDuration: number,
) => {
  const currentState = useCurrentStateStore();
  const { getSettingValue } = currentState;
  if (!getSettingValue('enableSubtitles')) return '';
  let subtitlesUrl = '';
  if (
    isVideo(multimediaItem.FilePath) &&
    multimediaItem.KeySymbol &&
    multimediaItem.Track
  ) {
    let subtitlesPath = multimediaItem.FilePath.split('.')[0] + '.vtt';
    const subtitleLang = getSettingValue('langSubtitles') as string;
    const subtitleFetcher: PublicationFetcher = {
      fileformat: 'mp4',
      issue: multimediaItem.IssueTagNumber,
      langwritten: subtitleLang ?? (getSettingValue('lang') as string),
      pub: multimediaItem.KeySymbol,
      track: multimediaItem.Track,
    };
    const { duration, subtitles } = await getJwMediaInfo(subtitleFetcher);
    if (!subtitles) return '';
    console.log('DURATION DEBUG', duration, comparisonDuration);
    if (duration && Math.abs(duration - comparisonDuration) > 10) return '';
    const subtitlesFilename = path.basename(subtitles);
    const subDirectory = getPublicationDirectory(subtitleFetcher);
    await downloadFileIfNeeded({
      dir: subDirectory,
      filename: subtitlesFilename,
      url: subtitles,
    });
    subtitlesPath = path.join(subDirectory, subtitlesFilename);
    if (fs.existsSync(subtitlesPath)) {
      subtitlesUrl = getFileUrl(subtitlesPath);
    } else {
      return '';
    }
  } else {
    return '';
  }
  return subtitlesUrl;
};

export {
  getAdditionalMediaPath,
  getDurationFromMediaPath,
  getFileUrl,
  getPublicationDirectory,
  getPublicationDirectoryContents,
  getSubtitlesUrl,
  getTempDirectory,
  getThumbnailUrl,
};
