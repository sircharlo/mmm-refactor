// import { storeToRefs } from 'pinia';
import { PublicationFetcher } from 'src/types/publications';
import { electronApi } from 'src/helpers/electron-api';
import { Item } from 'klaw-sync';
import { isImage, isVideo } from './mediaPlayback';

// import {  date } from 'quasar';
import { FULL_HD } from './converters';

// import { useCurrentStateStore } from 'stores/current-state';
// const currentState = useCurrentStateStore();
// const { currentCongregation, selectedDate } = storeToRefs(currentState);

const { path, fs, getUserDataPath, klawSync } = electronApi;

const getPublicationsPath = () => path.join(getUserDataPath(), 'Publications');

// const getAdditionalMediaDirectory = () => {
//   return path.join(getUserDataPath(), 'Additional Media');
// };

const getTempDirectory = () => {
  return path.join(getUserDataPath(), 'Temp');
};

// const getCongregationAdditionalMediaDirectory = () => {
//   return path.join(getAdditionalMediaDirectory(), currentCongregation.value);
// };

// const getDatedAdditionalMediaDirectory = () => {
//   if (!selectedDate.value) return '';
//   const dateString = date.formatDate(new Date(selectedDate.value), 'YYYYMMDD');
//   return path.join(getCongregationAdditionalMediaDirectory(), dateString);
// };

const getPublicationDirectory = (
  publication: PublicationFetcher,
  create?: boolean
) => {
  const dir = path.join(
    getPublicationsPath(),
    publication.pub +
      '_' +
      publication.langwritten +
      (publication.issue ? '_' + publication.issue.toString() : '')
  );
  if (create) fs.ensureDirSync(dir);
  return dir;
};
const getPublicationDirectoryContents = (
  publication: PublicationFetcher,
  filter?: string
) => {
  const dir = getPublicationDirectory(publication);
  if (!fs.existsSync(dir)) return [];
  const files = klawSync(dir, {
    nodir: true,
    filter: (file) => {
      if (!filter) return true;
      return path.basename(file.path.toLowerCase()).includes(filter.toLowerCase());
    },
  });
  return files as Item[];
};

const getFileUrl = (path: string) => {
  if (!path || !fs.existsSync(path)) return '';
  return new URL(path).href;
};


const getDurationFromMediaPath: (mediaPath: string) => Promise<number> = (mediaPath: string) => {
  return new Promise((resolve, reject) => {
    if (!mediaPath) {
      reject(new Error('No media path provided'));
      return;
    }

    const mediaRef = document.createElement(isVideo(mediaPath) ? 'video' : 'audio');
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

const getThumbnailFromVideoPath: (videoPath: string) => Promise<string> = (videoPath: string) => {
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

            // Cleanup
            canvas.remove();
            videoRef.remove();

            resolve(imageUrl);
          } else {
            // Cleanup in case of error
            canvas.remove();
            videoRef.remove();
            reject(new Error('Failed to get canvas context'));
          }
        },
        { once: true }
      );
      videoRef.currentTime = 5;
    });

    videoRef.addEventListener('error', (err) => {
      // Cleanup in case of error
      videoRef.remove();
      reject(new Error('Error loading video: ' + err.message + ' ' + videoPath));
    });
  });
};

const getThumbnailUrl = async (filepath: string) => {
  let thumbnailUrl = '';
  if (isImage(filepath)) {
    thumbnailUrl = getFileUrl(filepath);
  } else if (isVideo(filepath)) {
    const thumbnailPath = filepath.split('.')[0] + '.jpg';
    if (fs.existsSync(thumbnailPath)) {
      thumbnailUrl = getFileUrl(thumbnailPath);
    } else {
      thumbnailUrl = await getThumbnailFromVideoPath(filepath);
    }
  }
  return thumbnailUrl;
};

export {
  getPublicationDirectory,
  getPublicationDirectoryContents,
  getFileUrl,
  getThumbnailUrl,
  getTempDirectory,
  getDurationFromMediaPath
};
