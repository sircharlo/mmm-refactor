import { Buffer } from 'buffer';
import { PathLike } from 'fs-extra';
import { Item } from 'klaw-sync';
import { storeToRefs } from 'pinia';
import { FULL_HD } from 'src/helpers/converters';
import { electronApi } from 'src/helpers/electron-api';
import { downloadFileIfNeeded, getJwMediaInfo } from 'src/helpers/jw-media';
import { isImage, isVideo } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { PublicationFetcher } from 'src/types/publications';
import { MultimediaItem } from 'src/types/sqlite';

import { errorCatcher } from './error-catcher';

const {
  fileUrlToPath,
  fs,
  getUserDataPath,
  isFileUrl,
  klawSync,
  parseFile,
  path,
  pathToFileURL,
} = electronApi;

const getPublicationsPath = () => path.join(getUserDataPath(), 'Publications');

const getAdditionalMediaPath = () =>
  path.join(getUserDataPath(), 'Additional Media');

const getTempDirectory = () => {
  const tempDirectory = path.join(getUserDataPath(), 'Temp');
  fs.ensureDirSync(tempDirectory);
  return tempDirectory;
};

const getPublicationDirectory = (publication: PublicationFetcher) => {
  try {
    const dir = path.join(
      getPublicationsPath(),
      publication.pub +
        '_' +
        publication.langwritten +
        (publication.issue !== undefined
          ? '_' + publication.issue.toString()
          : ''),
    );
    fs.ensureDirSync(dir);
    return dir;
  } catch (error) {
    errorCatcher(error);
    return path.resolve('./');
  }
};

const getParentDirectory = (filepath: string) => {
  if (!filepath) return '';
  if (isFileUrl(filepath)) filepath = fileUrlToPath(filepath);
  return path.dirname(filepath);
};

const getPublicationDirectoryContents = (
  publication: PublicationFetcher,
  filter?: string,
) => {
  try {
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
  } catch (error) {
    errorCatcher(error);
    return [];
  }
};

const getFileUrl = (path: string) => {
  if (!path) return '';
  if (isFileUrl(path)) return path;
  return pathToFileURL(path);
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

    mediaRef.addEventListener('error', () => {
      mediaRef.remove();
      reject(new Error('Error loading media: ' + mediaPath));
    });
  });
};

const getThumbnailFromMetadata = async (mediaPath: string) => {
  try {
    const metadata = await parseFile(fileUrlToPath(mediaPath));
    if (metadata?.common?.picture?.length) {
      return URL.createObjectURL(
        new Blob([metadata.common.picture[0].data], {
          type: metadata.common.picture[0].format,
        }),
      );
    } else {
      return '';
    }
  } catch (error) {
    errorCatcher(mediaPath + ': ' + error);
    return '';
  }
};

const getThumbnailFromVideoPath: (
  videoPath: string,
  thumbnailPath: string,
) => Promise<string> = (videoPath: string, thumbnailPath: string) => {
  return new Promise((resolve, reject) => {
    if (!videoPath) {
      reject();
      return;
    }
    const videoFileUrl = videoPath;
    videoPath = fileUrlToPath(videoPath);
    thumbnailPath = fileUrlToPath(thumbnailPath);
    if (!fs.existsSync(videoPath)) {
      reject();
      return;
    }

    getThumbnailFromMetadata(videoFileUrl).then((url) => {
      if (url) {
        resolve(url);
      } else {
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
      }
    });
  });
};

const getThumbnailUrl = async (filepath: string, forceRefresh?: boolean) => {
  try {
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
  } catch (error) {
    errorCatcher(error);
    return '';
  }
};

const getSubtitlesUrl = async (
  multimediaItem: MultimediaItem,
  comparisonDuration: number,
) => {
  try {
    const currentState = useCurrentStateStore();
    const { currentSettings } = storeToRefs(currentState);
    let subtitlesUrl = '';
    if (currentSettings.value?.enableSubtitles) {
      if (
        isVideo(multimediaItem.FilePath) &&
        multimediaItem.KeySymbol &&
        multimediaItem.Track
      ) {
        let subtitlesPath = multimediaItem.FilePath.split('.')[0] + '.vtt';
        const subtitleLang = currentSettings.value?.langSubtitles;
        const subtitleFetcher: PublicationFetcher = {
          fileformat: 'mp4',
          issue: multimediaItem.IssueTagNumber,
          langwritten: subtitleLang ?? currentSettings.value?.lang,
          pub: multimediaItem.KeySymbol,
          track: multimediaItem.Track,
        };
        const { duration, subtitles } = await getJwMediaInfo(subtitleFetcher);
        if (!subtitles) throw new Error('No subtitles found');
        if (duration && Math.abs(duration - comparisonDuration) > 10)
          throw new Error('Duration mismatch');
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
          throw new Error('Subtitles file not found: ' + subtitlesPath);
        }
      } else {
        console.log('No subtitles available for: ' + multimediaItem.FilePath);
        return '';
      }
    }
    return subtitlesUrl;
  } catch (error) {
    errorCatcher(error);
    return '';
  }
};

const isEmptyDir = (directory: PathLike) => {
  try {
    return fs.readdirSync(directory).length === 0;
  } catch (error) {
    errorCatcher(error);
    return false;
  }
};
const removeEmptyDirs = (rootDir: string) => {
  try {
    const dirs = klawSync(rootDir, {
      depthLimit: -1,
      nodir: false,
      nofile: true,
    })
      .map((item) => item.path)
      .sort((a, b) => b.length - a.length);
    dirs.forEach((dir) => {
      if (isEmptyDir(dir)) {
        console.log(`Removing empty directory: ${dir}`);
        fs.rmdirSync(dir);
      }
    });
  } catch (error) {
    errorCatcher(error);
  }
};

export {
  getAdditionalMediaPath,
  getDurationFromMediaPath,
  getFileUrl,
  getParentDirectory,
  getPublicationDirectory,
  getPublicationDirectoryContents,
  getPublicationsPath,
  getSubtitlesUrl,
  getTempDirectory,
  getThumbnailUrl,
  removeEmptyDirs,
};
