import { Buffer } from 'buffer';
import mime from 'mime';
import { storeToRefs } from 'pinia';
import { format } from 'quasar';
import { FULL_HD } from 'src/helpers/converters';
import { electronApi } from 'src/helpers/electron-api';
import { getFileUrl, getTempDirectory } from 'src/helpers/fs';
import {
  dynamicMediaMapper,
  processMissingMediaInfo,
} from 'src/helpers/jw-media';
import { useCurrentStateStore } from 'src/stores/current-state';
import {
  JwPlaylistItem,
  MultimediaItem,
  PlaylistTagItem,
} from 'src/types/sqlite';

const { convert, decompress, executeQuery, fs, path, toggleMediaWindow } =
  electronApi;
const { pad } = format;

const formatTime = (time: number) => {
  try {
    if (!time) return '00:00';
    if (Number.isNaN(time)) return '..:..';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${pad(minutes.toString(), 2, '0')}:${pad(seconds.toString(), 2)}`;
  } catch (error) {
    return '..:..';
  }
};

const isFileOfType = (filepath: string, validExtensions: string[]) => {
  try {
    if (!filepath) return false;
    const fileExtension = path.parse(filepath).ext.toLowerCase();
    return validExtensions.includes(fileExtension);
  } catch (error) {
    return false;
  }
};

const isImage = (filepath: string) => {
  return isFileOfType(filepath, [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.webp',
    '.webm',
  ]);
};

const isHeic = (filepath: string) => {
  return isFileOfType(filepath, ['.heic']);
};

const isSvg = (filepath: string) => {
  return isFileOfType(filepath, ['.svg']);
};

const isVideo = (filepath: string) => {
  return isFileOfType(filepath, ['.mp4', '.mov', '.mkv', '.avi', '.webm']);
};

const isAudio = (filepath: string) => {
  return isFileOfType(filepath, ['.mp3', '.wav', '.ogg', '.flac']);
};

const isPdf = (filepath: string) => {
  return isFileOfType(filepath, ['.pdf']);
};

const isArchive = (filepath: string) => {
  return isFileOfType(filepath, ['.zip']);
};

const isJwpub = (filepath: string) => {
  return isFileOfType(filepath, ['.jwpub']);
};

const isJwPlaylist = (filepath: string) => {
  return isFileOfType(filepath, ['.jwlplaylist']);
};

const isSong = (multimediaItem: MultimediaItem) => {
  if (
    !multimediaItem.FilePath ||
    !isVideo(multimediaItem.FilePath) ||
    !multimediaItem.Track ||
    !multimediaItem.KeySymbol?.includes('sjj')
  )
    return '';
  return multimediaItem.Track.toString();
};

const isRemoteUrl = (url: string) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

const isFileUrl = (url: string) => {
  if (!url) return false;
  return url.startsWith('file://');
};

const inferExtension = (filename: string, filetype?: string) => {
  if (!filetype) return filename;
  const extension = mime.extension(filetype);
  if (!extension) {
    console.warn(
      'Could not determine the file extension from the provided file type',
    );
    return filename;
  }
  const hasExtension = /\.[0-9a-z]+$/i.test(filename);
  if (hasExtension) {
    return filename;
  }
  return `${filename}.${extension}`;
};

const isImageString = (url: string) => {
  if (!url) return false;
  return url.startsWith('data:image');
};

const jwpubDecompressor = async (jwpubPath: string, outputPath: string) => {
  try {
    await decompress(jwpubPath, outputPath);
    await decompress(path.join(outputPath, 'contents'), outputPath);
    return outputPath;
  } catch (error) {
    console.error(error);
    return jwpubPath;
  }
};

const decompressJwpub = async (jwpubPath: string, outputPath?: string) => {
  try {
    const { extractedFiles } = storeToRefs(useCurrentStateStore());
    if (!isJwpub(jwpubPath)) return jwpubPath;
    if (!outputPath)
      outputPath = path.join(getTempDirectory(), path.basename(jwpubPath));
    if (!extractedFiles.value[outputPath])
      extractedFiles.value[outputPath] = jwpubDecompressor(
        jwpubPath,
        outputPath,
      );
    return extractedFiles.value[outputPath];
  } catch (error) {
    console.error(error);
    return jwpubPath;
  }
};

const getMediaFromJwPlaylist = async (
  jwPlaylistPath: string,
  selectedDateValue: Date,
  destPath: string,
) => {
  try {
    if (!jwPlaylistPath) return [];
    const outputPath = path.join(destPath, path.basename(jwPlaylistPath));
    await decompress(jwPlaylistPath, outputPath);
    const dbFile = findDb(outputPath);
    if (!dbFile) return [];
    const playlistName = (
      executeQuery(
        dbFile,
        'SELECT Name FROM Tag ORDER BY TagId ASC LIMIT 1;',
      ) as PlaylistTagItem[]
    )[0].Name;
    const playlistItems = executeQuery(
      dbFile,
      `SELECT
        pi.PlaylistItemId,
        pi.Label,
        pi.StartTrimOffsetTicks,
        pi.EndTrimOffsetTicks,
        pi.Accuracy,
        pi.EndAction,
        pi.ThumbnailFilePath,
        pim.DurationTicks,
        im.OriginalFilename,
        im.FilePath AS IndependentMediaFilePath,
        im.MimeType,
        im.Hash,
        l.LocationId,
        l.BookNumber,
        l.ChapterNumber,
        l.DocumentId,
        l.Track,
        l.IssueTagNumber,
        l.KeySymbol,
        l.MepsLanguage,
        l.Type,
        l.Title
      FROM
        PlaylistItem pi
      LEFT JOIN
        PlaylistItemIndependentMediaMap pim ON pi.PlaylistItemId = pim.PlaylistItemId
      LEFT JOIN
        IndependentMedia im ON pim.IndependentMediaId = im.IndependentMediaId
      LEFT JOIN
        PlaylistItemLocationMap plm ON pi.PlaylistItemId = plm.PlaylistItemId
      LEFT JOIN
        Location l ON plm.LocationId = l.LocationId`,
    ) as JwPlaylistItem[];
    const playlistMediaItems = playlistItems.map((item) => {
      item.ThumbnailFilePath = path.join(outputPath, item.ThumbnailFilePath);
      if (
        fs.existsSync(item.ThumbnailFilePath) &&
        !item.ThumbnailFilePath.includes('.jpg')
      ) {
        fs.renameSync(item.ThumbnailFilePath, item.ThumbnailFilePath + '.jpg');
        item.ThumbnailFilePath += '.jpg';
      }
      return {
        FilePath: item.IndependentMediaFilePath
          ? path.join(outputPath, item.IndependentMediaFilePath)
          : '',
        IssueTagNumber: item.IssueTagNumber,
        KeySymbol: item.KeySymbol,
        Label: playlistName + ' - ' + item.Label,
        MimeType: item.MimeType,
        ThumbnailFilePath: item.ThumbnailFilePath || '',
        Track: item.Track,
      };
    }) as MultimediaItem[];

    await processMissingMediaInfo(playlistMediaItems);
    const dynamicPlaylistMediaItems = await dynamicMediaMapper(
      playlistMediaItems,
      selectedDateValue,
      true,
    );
    return dynamicPlaylistMediaItems;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const findDb = (publicationDirectory: string) => {
  if (!fs.existsSync(publicationDirectory)) return '';
  try {
    return fs
      .readdirSync(publicationDirectory)
      .map((filename) => path.join(publicationDirectory, filename))
      .find((filename) => {
        return filename.includes('.db');
      });
  } catch (error) {
    console.error(error);
    return '';
  }
};

const convertHeicToJpg = async (filepath: string) => {
  if (!isHeic(filepath)) return filepath;
  try {
    const buffer = fs.readFileSync(filepath);
    const output = await convert({
      buffer,
      format: 'JPEG',
    });
    const existingPath = path.parse(filepath);
    const newPath = `${existingPath.dir}/${existingPath.name}.jpg`;
    fs.writeFileSync(newPath, Buffer.from(output));
    return newPath;
  } catch (error) {
    console.error(error);
    return filepath;
  }
};

const convertSvgToJpg = async (filepath: string): Promise<string> => {
  try {
    if (!isSvg(filepath)) return filepath;

    const canvas = document.createElement('canvas');
    canvas.width = FULL_HD.width * 2;
    canvas.height = FULL_HD.height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return filepath;

    const img = new Image();
    img.src = getFileUrl(filepath);

    return new Promise((resolve, reject) => {
      img.onload = function () {
        const canvasW = canvas.width,
          canvasH = canvas.height;
        const imgW = img.naturalWidth || canvasW,
          imgH = img.naturalHeight || canvasH;
        const wRatio = canvasW / imgW,
          hRatio = canvasH / imgH;
        if (wRatio < hRatio) {
          canvas.height = canvasW * (imgH / imgW);
        } else {
          canvas.width = canvasH * (imgW / imgH);
        }
        const ratio = Math.min(wRatio, hRatio);
        ctx.drawImage(img, 0, 0, imgW * ratio, imgH * ratio);
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const outputImg = canvas.toDataURL('image/png');
        const existingPath = path.parse(filepath);
        const newPath = `${existingPath.dir}/${existingPath.name}.jpg`;
        try {
          fs.writeFileSync(
            newPath,
            Buffer.from(outputImg.split(',')[1], 'base64'),
          );
          resolve(newPath);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = function (error) {
        reject(error);
      };
    });
  } catch (error) {
    console.error(error);
    return filepath;
  }
};

const showMediaWindow = (state: boolean) => {
  try {
    const currentState = useCurrentStateStore();
    const { mediaPlayer } = storeToRefs(currentState);
    mediaPlayer.value.windowVisible = state;
    toggleMediaWindow(state ? 'show' : 'hide');
  } catch (error) {
    console.error(error);
  }
};

export {
  convertHeicToJpg,
  convertSvgToJpg,
  decompressJwpub,
  findDb,
  formatTime,
  getMediaFromJwPlaylist,
  inferExtension,
  isArchive,
  isAudio,
  isFileUrl,
  isHeic,
  isImage,
  isImageString,
  isJwPlaylist,
  isJwpub,
  isPdf,
  isRemoteUrl,
  isSong,
  isSvg,
  isVideo,
  showMediaWindow,
};
