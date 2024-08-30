// import { storeToRefs } from 'pinia';
// import { date, LocalStorage } from 'quasar';
// import { isInPast } from 'src/helpers/date';
// import { electronApi } from 'src/helpers/electron-api';
// import { useJwStore } from 'src/stores/jw';
// import { DynamicMediaObject } from 'src/types/media';
import { errorCatcher } from './error-catcher';
// import { getAdditionalMediaPath, removeEmptyDirs } from './fs';

// const { fileUrlToPath, fs, klawSync, path } = electronApi;

const cleanLocalStorage = () => {
  try {
    for (const storageElementName of [
      'additionalMediaMaps',
      'customDurations',
      'mediaSort',
    ]) {
      // TODO: Implement correct and safe cleanup here
      console.log('Checking:', storageElementName);
      //   const storageElement = LocalStorage.getItem(storageElementName);
      //   let changesMade = false;
      //   if (storageElement) {
      //     for (const congregation of Object.keys(storageElement)) {
      //       // @ts-expect-error LocalStorage typing mishap here
      //       console.log('Checking:', congregation, storageElementName, storageElement[congregation]);
      //       // @ts-expect-error LocalStorage typing mishap here
      //       for (const dateKey of Object.keys(storageElement[congregation])) {
      //         console.log('Checking:', congregation, dateKey);
      //         // if (!key) delete storageElement[key];
      //         const strippedDateKey = dateKey.replace(/\D/g, '');
      //         console.log(strippedDateKey);
      //         // strippedKey = YYYYMMDD
      //         const strippedDateKeyAsDate = date.buildDate(
      //           {
      //             day: Number(strippedDateKey.slice(6, 8)),
      //             hours: 0,
      //             minutes: 0,
      //             month: Number(strippedDateKey.slice(4, 6)),
      //             seconds: 0,
      //             year: Number(strippedDateKey.slice(0, 4)),
      //           },
      //           false,
      //         );
      //         console.log(strippedDateKeyAsDate);
      //         if (isInPast(strippedDateKeyAsDate)) {
      //           console.log('Removing from localStorage:', congregation, storageElementNamedateKey);
      //           // @ts-expect-error LocalStorage typing mishap here
      //           delete storageElement[congregation][dateKey];
      //           changesMade = true;
      //         }
      //       }
      //     }
      //   }
      //   if (changesMade) LocalStorage.set(storageElementName, storageElement);
    }
  } catch (error) {
    errorCatcher(error);
  }
};

const cleanAdditionalMediaFolder = () => {
  // TODO: Implement correct and safe cleanup here
  // try {
  //   const jwStore = useJwStore();
  //   const { additionalMediaMaps } = storeToRefs(jwStore);
  //   const additionalMediaPath = getAdditionalMediaPath();
  //   if (!fs.existsSync(additionalMediaPath)) {
  //     additionalMediaMaps.value = {};
  //     return;
  //   }
  //   const flattenedFilePaths = (
  //     data: Record<string, Record<string, DynamicMediaObject[]>>,
  //   ) => {
  //     return Object.values(data).flatMap((dateObj) =>
  //       Object.values(dateObj).flatMap((files) =>
  //         files.map((file) => path.resolve(fileUrlToPath(file.fileUrl))),
  //       ),
  //     );
  //   };
  //   // Check for files present on the filesystem that are not present in the additional media maps
  //   const filesReferencedInAdditionalMediaMaps = flattenedFilePaths(
  //     additionalMediaMaps.value,
  //   );
  //   const dirListing = klawSync(additionalMediaPath, { nodir: true });
  //   for (const file of dirListing) {
  //     const additionalMediaFilePath = path.resolve(file.path);
  //     if (
  //       !filesReferencedInAdditionalMediaMaps.includes(additionalMediaFilePath)
  //     ) {
  //       console.log(
  //         'Removing orphaned file from filesystem:',
  //         additionalMediaFilePath,
  //       );
  //       fs.rmSync(additionalMediaFilePath);
  //     }
  //   }
  //   //Check for files present in the additional media maps that are not present on the filesystem
  //   for (const [congregation, additionalMediaMap] of Object.entries(
  //     additionalMediaMaps.value,
  //   )) {
  //     for (const [dateKey, mediaObjects] of Object.entries(
  //       additionalMediaMap,
  //     )) {
  //       for (const mediaObject of mediaObjects) {
  //         const filePath = path.resolve(fileUrlToPath(mediaObject.fileUrl));
  //         if (!fs.existsSync(filePath)) {
  //           additionalMediaMaps.value[congregation][dateKey] =
  //             mediaObjects.filter((obj) => obj.fileUrl !== mediaObject.fileUrl);
  //         }
  //       }
  //     }
  //   }
  //   removeEmptyDirs(additionalMediaPath);
  // } catch (error) {
  //   errorCatcher(error);
  // }
};

export { cleanAdditionalMediaFolder, cleanLocalStorage };
