import { PathLike } from 'fs';
import { LocalStorage, date } from 'quasar';
import { isInPast } from 'src/helpers/date';
import { electronApi } from 'src/helpers/electron-api';
import { DynamicMediaObject } from 'src/types/media';

import { getAdditionalMediaPath } from './fs';

const { fileUrlToPath, fs, klawSync, path } = electronApi;

const cleanLocalStorage = () => {
  try {
    for (const storageElementName of [
      'additionalMediaMaps',
      'customDurations',
      'dynamicMedia',
      'mediaSort',
    ]) {
      const storageElement = LocalStorage.getItem(storageElementName);
      let changesMade = false;
      if (storageElement) {
        console.log(storageElementName, storageElement);
        for (const congregation of Object.keys(storageElement)) {
          // @ts-expect-error LocalStorage typing mishap here
          for (const dateKey of Object.keys(storageElement[congregation])) {
            // if (!key) delete storageElement[key];
            const strippedDateKey = dateKey.replace(/\D/g, '');
            // strippedKey = YYYYMMDD
            const strippedDateKeyAsDate = date.buildDate(
              {
                day: Number(strippedDateKey.slice(6, 8)),
                hours: 0,
                minutes: 0,
                month: Number(strippedDateKey.slice(4, 6)),
                seconds: 0,
                year: Number(strippedDateKey.slice(0, 4)),
              },
              false,
            );
            console.log(dateKey);
            if (isInPast(strippedDateKeyAsDate)) {
              console.log('removing', dateKey);
              // @ts-expect-error LocalStorage typing mishap here
              delete storageElement[congregation][dateKey];
              changesMade = true;
            }
          }
        }
      }
      if (changesMade) LocalStorage.set(storageElementName, storageElement);
    }
  } catch (error) {
    console.error(error);
  }
};

function isEmptyDir(directory: PathLike) {
  try {
    return fs.readdirSync(directory).length === 0;
  } catch (error) {
    console.error(error);
    return false;
  }
}
function removeEmptyDirs(rootDir: string) {
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
    console.error(error);
  }
}

const cleanAdditionalMediaFolder = () => {
  try {
    const additionalMediaPath = getAdditionalMediaPath();
    if (!fs.existsSync(additionalMediaPath)) {
      LocalStorage.removeItem('additionalMediaMaps');
      return;
    }
    const additionalMediaMaps = LocalStorage.getItem(
      'additionalMediaMaps',
    ) as Record<string, Record<string, DynamicMediaObject[]>>;
    const flattenedFilePaths = (
      data: Record<string, Record<string, DynamicMediaObject[]>>,
    ) => {
      return Object.values(data).flatMap((dateObj) =>
        Object.values(dateObj).flatMap((files) =>
          files.map((file) => path.resolve(fileUrlToPath(file.fileUrl))),
        ),
      );
    };
    const filePaths = flattenedFilePaths(additionalMediaMaps);
    console.log(filePaths);
    const dirListing = klawSync(additionalMediaPath, { nodir: true });
    for (const file of dirListing) {
      const additionalMediaFile = path.resolve(file.path);
      if (!filePaths.includes(additionalMediaFile)) {
        console.log('removing', additionalMediaFile);
        fs.rmSync(additionalMediaFile);
      }
    }
    removeEmptyDirs(additionalMediaPath);
  } catch (error) {
    console.error(error);
  }
};

export { cleanAdditionalMediaFolder, cleanLocalStorage };
