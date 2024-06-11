import { Buffer } from 'buffer';
import { electronApi } from 'src/helpers/electron-api';
import { JwPlaylistItem, MultimediaItem, PlaylistTagItem } from 'src/types/sqlite';
import { Ref } from 'vue';

import { FULL_HD } from './converters';
import { getFileUrl, getTempDirectory } from './fs';
import { dynamicMediaMapper, processMissingMediaInfo } from './jw-media';

const { convert, decompress, executeQuery, fs, path } = electronApi;

const formatTime = (time: number) => {
  if (!time) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

const isImage = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.webp',
    // '.svg',
    '.webm',
  ];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
};

const isHeic = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = ['.heic'];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
};

const isSvg = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = ['.svg'];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
};

const isVideo = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
};

const isAudio = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = ['.mp3', '.wav', '.ogg', '.flac'];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
};

const isPdf = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = ['.pdf'];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
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

const isArchive = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = ['.zip'];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
};

const isJwpub = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = ['.jwpub'];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
};

const isJwPlaylist = (filepath: string) => {
  if (!filepath) return false;
  const validExtensions = ['.jwlplaylist'];
  const fileExtension = path.parse(filepath).ext.toLowerCase();
  return validExtensions.includes(fileExtension);
};

const isRemoteUrl = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

const isImageString = (url: string) => {
  return url.startsWith('data:image');
};

const decompressJwpub = async (jwpubPath: string, outputPath?: string) => {
  if (!isJwpub(jwpubPath)) return jwpubPath;
  if (!outputPath)
    outputPath = path.join(getTempDirectory(), path.basename(jwpubPath));
  await decompress(jwpubPath, outputPath);
  await decompress(path.join(outputPath, 'contents'), outputPath);
  return outputPath;
};

const getMediaFromJwPlaylist = async (jwPlaylistPath: string, selectedDateValue: Date, destPath: string) => {
  const outputPath = path.join(
    destPath,
    path.basename(jwPlaylistPath)
  );
  await decompress(jwPlaylistPath, outputPath);
  const dbFile = findDb(outputPath);
  if (!dbFile) return [];
  const playlistName = (executeQuery(dbFile, 'SELECT Name FROM Tag ORDER BY TagId ASC LIMIT 1;') as PlaylistTagItem[])[0].Name;
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
        Location l ON plm.LocationId = l.LocationId`
  ) as JwPlaylistItem[];
  const playlistMediaItems = playlistItems.map((item) => {
    item.ThumbnailFilePath = path.join(outputPath, item.ThumbnailFilePath)
    if (fs.existsSync(item.ThumbnailFilePath) && !item.ThumbnailFilePath.includes('.jpg')) {
      fs.renameSync(item.ThumbnailFilePath, item.ThumbnailFilePath + '.jpg');
      item.ThumbnailFilePath += '.jpg';
    }
    return {
      FilePath: item.IndependentMediaFilePath ? path.join(outputPath, item.IndependentMediaFilePath) : '',
      IssueTagNumber: item.IssueTagNumber,
      KeySymbol: item.KeySymbol,
      Label: playlistName + ' - ' + item.Label,
      MimeType: item.MimeType,
      ThumbnailFilePath: item.ThumbnailFilePath || '',
      Track: item.Track,
    };
  }) as MultimediaItem[];

  await processMissingMediaInfo(playlistMediaItems);
  const dynamicPlaylistMediaItems = await dynamicMediaMapper(playlistMediaItems, selectedDateValue, true);
  return dynamicPlaylistMediaItems;
};

const findDb = (publicationDirectory: string) => {
  if (!fs.existsSync(publicationDirectory)) return '';
  return fs
    .readdirSync(publicationDirectory)
    .map((filename) => path.join(publicationDirectory, filename))
    .find((filename) => {
      return filename.includes('.db');
    });
};

const convertHeicToJpg = async (filepath: string) => {
  if (!isHeic(filepath)) return filepath;
  const buffer = fs.readFileSync(filepath);
  const output = await convert({
    buffer,
    format: 'JPEG',
  });
  const existingPath = path.parse(filepath);
  const newPath = `${existingPath.dir}/${existingPath.name}.jpg`;
  fs.writeFileSync(newPath, Buffer.from(output));
  return newPath;
};

const convertSvgToJpg = async (
  filepath: string,
  canvas: Ref<HTMLCanvasElement>
): Promise<string> => {
  if (!isSvg(filepath) || !canvas.value) return filepath;

  canvas.value.width = FULL_HD.width * 2;
  canvas.value.height = FULL_HD.height * 2;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return filepath;

  const img = new Image();
  img.src = getFileUrl(filepath);

  return new Promise((resolve, reject) => {
    img.onload = function () {
      const canvasW = canvas.value.width,
        canvasH = canvas.value.height;
      const imgW = img.naturalWidth || canvasW,
        imgH = img.naturalHeight || canvasH;
      const wRatio = canvasW / imgW,
        hRatio = canvasH / imgH;
      if (wRatio < hRatio) {
        canvas.value.height = canvasW * (imgH / imgW);
      } else {
        canvas.value.width = canvasH * (imgW / imgH);
      }
      const ratio = Math.min(wRatio, hRatio);
      ctx.drawImage(img, 0, 0, imgW * ratio, imgH * ratio);
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
      const outputImg = canvas.value.toDataURL('image/png');
      const existingPath = path.parse(filepath);
      const newPath = `${existingPath.dir}/${existingPath.name}.jpg`;
      try {
        fs.writeFileSync(
          newPath,
          Buffer.from(outputImg.split(',')[1], 'base64')
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
};

export {
  convertHeicToJpg,
  convertSvgToJpg,
  decompressJwpub,
  findDb,
  formatTime,
  getMediaFromJwPlaylist,
  isArchive,
  isAudio,
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
};
