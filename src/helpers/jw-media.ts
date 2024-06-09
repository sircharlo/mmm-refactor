import { storeToRefs } from 'pinia';

import { useCurrentStateStore } from 'src/stores/current-state';
const currentState = useCurrentStateStore();
const { getSettingValue } = currentState;
const { downloads, downloadProgress, totalDownloadProgress, lookupPeriod, currentSongbook, currentCongregation, nonCompleteItems, currentSettings } =
  storeToRefs(currentState);
const { removeCompletedDownloadProgress } = currentState
import { LocalStorage, Notify, date } from 'quasar';
import {
  MediaImages,
  MediaLink,
  Publication,
  PublicationFetcher,
} from 'src/types/publications';
import {
  getDurationFromMediaPath,
  getFileUrl,
  getPublicationDirectory,
  getThumbnailUrl,
} from './fs';
import { electronApi } from 'src/helpers/electron-api';
import {
  DatedTextItem,
  // DocumentItem,
  MultimediaExtractItem,
  MultimediaItem,
  MultimediaItemsFetcher,
  // PublicationIssuePropertyItem,
  PublicationItem,
  // PublicationItem,
  TableItem,
  VideoMarker,
} from 'src/types/sqlite';
import { dateFromString, getSpecificWeekday, isCoWeek } from './date';
import { get, urlWithParamsToString } from 'src/boot/axios';

import {
  createTemporaryNotification,
  createUpdatableNotification,
  updateNotification,
} from 'src/helpers/notifications';
import {
  DownloadedFile,
  DynamicMediaObject,
  FileDownloader,
} from 'src/types/media';
import {
  isImage,
  isVideo,
  isSong,
  decompressJwpub,
  findDb,
  isAudio,
} from './mediaPlayback';
const { path, fs, executeQuery, klawSync } = electronApi;

import { Buffer } from 'buffer';
import axios from 'axios';

import { isMwMeetingDay, isWeMeetingDay } from 'src/helpers/date';
import mepslangs from 'src/defaults/mepslangs';
import sanitize from 'sanitize-filename';
import { watch } from 'vue';
import { MAX_SONGS } from 'src/stores/jw';

const FEB_2023 = 20230200;
const FOOTNOTE_TAR_PAR = 9999;

const downloadFile = async ({
  url,
  dir,
  filename,
  size,
  // notify,
}: FileDownloader) => {
  fs.ensureDirSync(dir);
  if (!filename) filename = path.basename(url);
  filename = sanitize(filename);
  const destinationPath = path.join(dir, filename);
  const remoteSize: number =
    size ||
    (await axios({ url, method: 'HEAD' }).then(
      (response) => +response.headers['content-length'] || 0
    ));
  if (fs.existsSync(destinationPath)) {
    const stat = fs.statSync(destinationPath);
    const localSize = stat.size;
    if (localSize === remoteSize) {
      return {
        path: destinationPath,
        new: false,
      };
    }
  }

  const downloadedDataRequest = await axios
    .get(url, {
      responseType: 'arraybuffer',
      onDownloadProgress: (progressEvent) => {
        const downloadDone = downloadProgress.value[url]?.complete || false;
        if (!downloadDone) downloadProgress.value[url] = {
          loaded: progressEvent.loaded,
          total: (progressEvent.total || progressEvent.loaded),
          complete: false
        };
      },
    })
    .catch((error) => {
      console.error(error);
      downloads.value.delete(url);
      delete downloadProgress.value[url]
      return { data: '' };
    });
  const downloadedData = downloadedDataRequest.data;
  const byteLength = Buffer.byteLength(downloadedData)
  downloadProgress.value[url] = {
    loaded: byteLength,
    total: byteLength,
    complete: true
  };
  if (!downloadedData) {
    createTemporaryNotification({
      message: 'Error downloading file',
      caption: filename,
      type: 'negative',
      icon: 'mdi-cloud-off',
    });
    return {
      path: destinationPath,
      error: true,
    };
  }
  fs.writeFileSync(destinationPath, Buffer.from(downloadedData));
  return {
    path: destinationPath,
    new: true,
  };
};


let fileDownloadNotification: typeof Notify.create | undefined = undefined;

watch(downloadProgress, () => {
  const downloadProgressSize = Object.keys(downloadProgress.value).length;
  if (downloadProgressSize > 0) {
    const nonCompleteUrls = Object.keys(nonCompleteItems.value);
    const nonCompleteCount = nonCompleteUrls.length;
    const percent = totalDownloadProgress.value.percentage;
    const notificationOptions = {
      message: nonCompleteCount === 1 ? path.basename(nonCompleteUrls[0]) : 'Downloading files',
      caption: `${percent.toFixed(0)}%`,
      type: percent === 100 && nonCompleteCount < 2 ? 'positive' : 'ongoing',
      spinner: percent === 100 ? false : true,
      icon: percent === 100 ? 'mdi-cloud-check' : '',
      timeout: percent === 100 ? 5000 : 0,
      onDismiss() {
        fileDownloadNotification = undefined;
        removeCompletedDownloadProgress();
      },
    }
    if (!fileDownloadNotification) {
      fileDownloadNotification = createUpdatableNotification(notificationOptions);
    } else {
      updateNotification(fileDownloadNotification, notificationOptions);
    }
  }
}, { deep: true, immediate: true });

const fetchMedia = async () => {
  const promises = lookupPeriod.value
    .filter((day) => day.meeting)
    .map(async (day) => {
      const dayDate = day.date;
      day.loading = true;
      if (isWeMeetingDay(dayDate)) {
        day.dynamicMedia = await getWeMedia(dayDate);
      } else if (isMwMeetingDay(dayDate)) {
        day.dynamicMedia = await getMwMedia(dayDate);
      }
      day.loading = false;
    });
  await Promise.all(promises);
};

const addToDownloads = (file: FileDownloader) => {
  if (!downloads.value.get(file.url))
    downloads.value.set(file.url, downloadFile(file));
  return downloads.value.get(file.url);
};

const getDbFromJWPUB = async (publication: PublicationFetcher) => {
  const jwpub = await downloadJwpub(publication);
  if (jwpub.error) console.error('JWPUB download error: ' + publication);
  const publicationDirectory = getPublicationDirectory(publication);
  if (jwpub.new || !findDb(publicationDirectory)) {
    await decompressJwpub(jwpub.path, publicationDirectory);
  }
  const dbFile = findDb(publicationDirectory);
  if (!dbFile) {
    console.error('No db file found', publicationDirectory);
    return null;
  } else {
    return dbFile;
  }
};

const getPublicationInfoFromDb = (db: string) => {
  const publication = {} as PublicationFetcher;
  const pubQuery = (
    executeQuery(db, 'SELECT * FROM Publication') as PublicationItem[]
  )[0];
  publication.pub = pubQuery.UndatedSymbol;
  publication.issue = pubQuery.IssueTagNumber;
  publication.langwritten = mepslangs[pubQuery.MepsLanguageIndex];
  return publication as PublicationFetcher;
};

function addFullFilePathToMultimediaItem(
  multimediaItem: MultimediaItem,
  publication: PublicationFetcher
) {
  return {
    ...multimediaItem,
    ...(multimediaItem.FilePath
      ? {
        FilePath: path.join(
          getPublicationDirectory(publication),
          multimediaItem.FilePath
        ),
      }
      : {}),
  };
}

const getMultimediaMepsLangs = (source: MultimediaItemsFetcher) => {
  const multimediaMepsLangs = (
    executeQuery(
      source.db,
      'SELECT KeySymbol, Track, IssueTagNumber, MepsLanguageIndex from ExtractMultimedia ORDER by KeySymbol, IssueTagNumber, Track'
    ) as MultimediaItem[]
  );
  return multimediaMepsLangs;
}

const getMediaVideoMarkers = (source: MultimediaItemsFetcher, mediaId: number) => {
  const mediaVideoMarkers = (
    executeQuery(
      source.db,
      `SELECT * from VideoMarker WHERE MultimediaId = ${mediaId} ORDER by StartTimeTicks`
    ) as VideoMarker[]
  );
  return mediaVideoMarkers;
}

const getDocumentMultimediaItems = (source: MultimediaItemsFetcher) => {
  const DocumentMultimediaTable = (
    executeQuery(
      source.db,
      "SELECT * FROM sqlite_master WHERE type='table' AND name='DocumentMultimedia'"
    ) as TableItem[]
  ).map((item) => item.name);
  const mmTable =
    DocumentMultimediaTable.length === 0
      ? 'Multimedia'
      : (DocumentMultimediaTable[0] as string);
  const columnQueryResult = executeQuery(
    source.db,
    `PRAGMA table_info(${mmTable})`
  ) as TableItem[];

  const ParagraphColumnsExist = columnQueryResult.some(
    (column) => column.name === 'BeginParagraphOrdinal'
  );

  const targetParNrExists = (
    executeQuery(source.db, "PRAGMA table_info('Question')") as TableItem[]
  )
    .map((item) => item.name)
    .includes('TargetParagraphNumberLabel');

  const suppressZoomExists = (
    executeQuery(source.db, "PRAGMA table_info('Multimedia')") as TableItem[]
  )
    .map((item) => item.name)
    .includes('SuppressZoom') as boolean;

  // let select = 'SELECT Multimedia.DocumentId, Multimedia.MultimediaId, ';
  const select = 'SELECT * ';
  let from = 'FROM Multimedia ';
  if (mmTable === 'DocumentMultimedia')
    from +=
      'INNER JOIN DocumentMultimedia ON DocumentMultimedia.MultimediaId = Multimedia.MultimediaId ';
  from += `INNER JOIN Document ON ${mmTable}.DocumentId = Document.DocumentId `;

  let where = ` WHERE ${source.docId || source.docId === 0
    ? `Document.DocumentId = ${source.docId}`
    : `Document.MepsDocumentId = ${source.mepsId}`
    }`;

  const videoString =
    "(Multimedia.MimeType LIKE '%video%' OR Multimedia.MimeType LIKE '%audio%')";
  const imgString = `(Multimedia.MimeType LIKE '%image%' ${getSettingValue('includePrinted')
    ? ''
    : ' AND Multimedia.CategoryType <> 4 AND Multimedia.CategoryType <> 6'
    } AND Multimedia.CategoryType <> 9 AND Multimedia.CategoryType <> 10 AND Multimedia.CategoryType <> 25)`;

  where += ` AND (${videoString} OR ${imgString})`;

  if (
    'BeginParagraphOrdinal' in source &&
    'EndParagraphOrdinal' in source &&
    ParagraphColumnsExist
  ) {
    where += ` AND ${mmTable}.BeginParagraphOrdinal >= ${source.BeginParagraphOrdinal} AND ${mmTable}.EndParagraphOrdinal <= ${source.EndParagraphOrdinal}`;
  }

  const groupAndSort = ParagraphColumnsExist
    ? ` GROUP BY Multimedia.MultimediaId ORDER BY ${mmTable}.BeginParagraphOrdinal`
    : '';

  if (targetParNrExists && ParagraphColumnsExist) {
    from += ` LEFT JOIN Question ON Question.DocumentId = ${mmTable}.DocumentId AND Question.TargetParagraphOrdinal = ${mmTable}.BeginParagraphOrdinal `;
  }
  if (suppressZoomExists) {
    where += ' AND Multimedia.SuppressZoom <> 1';
  }
  const items = executeQuery(
    source.db,
    `${select} ${from} ${where} ${groupAndSort}`
  ) as MultimediaItem[];
  return items;
};

const getDocumentExtractItems = async (db: string, docId: number) => {
  const extracts = executeQuery(
    // ${currentSongbook.value.pub === 'sjjm'
    //   ? "AND NOT UniqueEnglishSymbol = 'sjj' "
    //   : ''
    // }
    db,
    `SELECT DocumentExtract.BeginParagraphOrdinal,DocumentExtract.EndParagraphOrdinal,DocumentExtract.DocumentId,
      Extract.RefMepsDocumentId,Extract.RefPublicationId,Extract.RefMepsDocumentId,UniqueEnglishSymbol,IssueTagNumber,
      Extract.RefBeginParagraphOrdinal,Extract.RefEndParagraphOrdinal, Extract.Link
    FROM DocumentExtract
      INNER JOIN Extract ON DocumentExtract.ExtractId = Extract.ExtractId
      INNER JOIN RefPublication ON Extract.RefPublicationId = RefPublication.RefPublicationId
      INNER JOIN Document ON DocumentExtract.DocumentId = Document.DocumentId
    WHERE DocumentExtract.DocumentId = ${docId}
    AND NOT UniqueEnglishSymbol LIKE 'mwbr%'
    AND NOT UniqueEnglishSymbol = 'sjj'
    ${(getSettingValue('excludeTh') as boolean)
      ? "AND NOT UniqueEnglishSymbol = 'th' "
      : ''
    }
      ORDER BY DocumentExtract.BeginParagraphOrdinal`
  ) as MultimediaExtractItem[];

  // AND NOT RefPublication.PublicationCategorySymbol = 'web'
  // TODO: add toggle to enable/disable web publication multimedia
  // Right now, enabled

  const allExtractItems = [];
  for (const extract of extracts) {
    extract.Lang = getSettingValue('lang') as string;
    if (extract.Link) {
      try {
        const matches = extract.Link.match(/\/(.*)\//);
        if (matches && matches.length > 0) {
          extract.Lang = (matches.pop() as string).split(':')[0];
        }
      } catch (e: unknown) {
        console.error(e);
      }
    }

    const symbol = /[^a-zA-Z0-9]/.test(extract.UniqueEnglishSymbol)
      ? extract.UniqueEnglishSymbol
      : extract.UniqueEnglishSymbol.replace(/\d/g, '');

    if (symbol === 'snnw') return []; // That's the "old new songs" songbook; we don't need images from that
    let extractLang = extract.Lang ?? (getSettingValue('lang') as string);
    let extractDb = await getDbFromJWPUB({
      pub: symbol,
      issue: extract.IssueTagNumber,
      langwritten: extractLang,
    });
    const fallbackLang = getSettingValue('fallbackLang') as string;
    if (!extractDb && fallbackLang) {
      extractDb = await getDbFromJWPUB({
        pub: symbol,
        issue: extract.IssueTagNumber,
        langwritten: fallbackLang,
      });
      extractLang = fallbackLang;
    }

    if (!extractDb) return [];

    const extractItems = getDocumentMultimediaItems({
      db: extractDb,
      mepsId: extract.RefMepsDocumentId,
      lang: extractLang,
      ...(extract.RefBeginParagraphOrdinal
        ? { BeginParagraphOrdinal: extract.RefBeginParagraphOrdinal }
        : {}),
      ...(extract.RefEndParagraphOrdinal
        ? { EndParagraphOrdinal: extract.RefEndParagraphOrdinal }
        : {}),
    })
      .map((extractItem) => {
        return {
          ...extractItem,
          BeginParagraphOrdinal: extract.BeginParagraphOrdinal,
          EndParagraphOrdinal: extract.EndParagraphOrdinal,
        };
      })
      .map((extractItem) =>
        addFullFilePathToMultimediaItem(extractItem, {
          pub: symbol,
          issue: extract.IssueTagNumber,
          langwritten: extractLang,
        })
      );
    allExtractItems.push(...extractItems);
  }
  return allExtractItems;
};

const getWtIssue = async (monday: Date, weeksInPast: number) => {
  const issue = date.subtractFromDate(monday, {
    days: weeksInPast * 7,
  });
  const issueString = date.formatDate(issue, 'YYYYMM') + '00';
  if (!(getSettingValue('lang') as string)) {
    console.error('No language selected');
    return {
      db: '',
      docId: -1,
      issueString,
      weekNr: -1,
      publication: {
        pub: '',
        langwritten: '',
      },
    };
  }
  const publication = {
    pub: 'w',
    issue: issueString,
    langwritten: getSettingValue('lang') as string,
  };
  const db = await getDbFromJWPUB(publication);

  if (!db) return { db: '', docId: -1, issueString, weekNr: -1, publication };
  const datedTexts = executeQuery(
    db,
    'SELECT * FROM DatedText'
  ) as DatedTextItem[];
  const weekNr = datedTexts.findIndex((weekItem) => {
    const mondayAsNumber = parseInt(date.formatDate(monday, 'YYYYMMDD'));
    return weekItem.FirstDateOffset === mondayAsNumber;
  });
  if (weekNr === -1) {
    console.warn('No week found');
    return { db: '', docId: -1, issueString, weekNr, publication };
  }
  const docId = (
    executeQuery(
      db,
      `SELECT Document.DocumentId FROM Document WHERE Document.Class=40 LIMIT 1 OFFSET ${weekNr}`
    ) as { DocumentId: number }[]
  )[0]?.DocumentId;
  return { db, docId, issueString, weekNr, publication };
};

const dynamicMediaMapper = async (
  allMedia: MultimediaItem[],
  lookupDate: Date,
  additional?: boolean
): Promise<DynamicMediaObject[]> => {
  let middleSongParagraphOrdinal = 0;
  if (!additional) {
    const songs = allMedia.filter((m) => isSong(m));
    if (songs.length === 3)
      middleSongParagraphOrdinal = songs[1].BeginParagraphOrdinal;

    if (isCoWeek(lookupDate)) {
      // The last songs for both MW and WE meeting get replaced during the CO visit
      const lastParagraphOrdinal =
        allMedia[allMedia.length - 1].BeginParagraphOrdinal || 0;
      allMedia.pop();
      if (isMwMeetingDay(lookupDate)) {
        // Also remove CBS media if it's the MW meeting, since the CBS is skipped during the CO visit
        allMedia = allMedia.filter(
          (m) => m.BeginParagraphOrdinal < lastParagraphOrdinal - 2
        );
      }
    }
  }
  const mediaPromises = allMedia
    .filter((m) => m.FilePath)
    .map(async (m) => {
      const mediaIsSong = isSong(m);
      const thumbnailUrl = await getThumbnailUrl(
        m.ThumbnailFilePath || m.FilePath
      );
      const video = isVideo(m.FilePath);
      const audio = isAudio(m.FilePath);
      let duration = 0;
      if (video || audio) {
        duration = await getDurationFromMediaPath(m.FilePath);
      }
      let section = additional ? 'additional' : 'wt';
      if (middleSongParagraphOrdinal > 0) {
        //this is a meeting with 3 songs
        if (m.BeginParagraphOrdinal >= middleSongParagraphOrdinal) {
          // LAC
          section = 'lac';
        } else if (m.BeginParagraphOrdinal >= 18) {
          // AYFM
          section = 'ayfm';
        } else {
          // TGW
          section = 'tgw';
        }
        // iscoweek
      }
      return {
        fileUrl: getFileUrl(m.FilePath),
        thumbnailUrl,
        title: mediaIsSong ? m.Label.replace(/^\d+\.\s*/, '') : m.Label,
        uniqueId: sanitizeId(
          date.formatDate(lookupDate, 'YYYYMMDD') + '-' + getFileUrl(m.FilePath)
        ),
        isImage: isImage(m.FilePath),
        isVideo: video,
        isAudio: audio,
        duration: duration,
        song: mediaIsSong,
        paragraph: m.TargetParagraphNumberLabel,
        section, // if is we: wt; else, if >= middle song: LAC; >= (middle song - 8???): AYFM; else: TGW
        isAdditional: !!additional,
        markers: m.VideoMarkers
      } as DynamicMediaObject;
    });
  return Promise.all(mediaPromises);
};

const getWeMedia = async (lookupDate: Date) => {
  lookupDate = dateFromString(lookupDate.toISOString());
  try {
    const monday = getSpecificWeekday(lookupDate, 0);
    let { db, docId, issueString, weekNr, publication } = await getWtIssue(
      monday,
      8
    );
    if (db?.length === 0)
      ({ db, docId, issueString, weekNr, publication } = await getWtIssue(
        monday,
        10
      ));

    if (!db || docId < 0) {
      console.error('No suitable db or docid found');
      return [];
    }
    // const magazine = executeQuery(
    //   db,
    //   'SELECT Title FROM PublicationIssueProperty LIMIT 1'
    // )[0] as PublicationIssuePropertyItem;
    // const article = executeQuery(
    //   db,
    //   `SELECT Title FROM Document WHERE DocumentId = ${docId}`
    // )[0] as DocumentItem;
    // const displayTitle = `${magazine.Title} - ${article.Title}`;
    // console.log('displayTitle', displayTitle);

    const videos = executeQuery(
      db,
      `SELECT DocumentMultimedia.MultimediaId, DocumentMultimedia.DocumentId, MepsDocumentId, CategoryType, KeySymbol, Track, IssueTagNumber, MimeType, BeginParagraphOrdinal, TargetParagraphNumberLabel
         FROM DocumentMultimedia
         INNER JOIN Multimedia
           ON DocumentMultimedia.MultimediaId = Multimedia.MultimediaId
         LEFT JOIN Question
           ON Question.DocumentId = DocumentMultimedia.DocumentId
           AND Question.TargetParagraphOrdinal = DocumentMultimedia.BeginParagraphOrdinal
         WHERE DocumentMultimedia.DocumentId = ${docId}
           AND CategoryType = -1
         GROUP BY DocumentMultimedia.MultimediaId`
    ) as MultimediaItem[];
    const videosInParagraphs = videos.filter(
      (video) => !!video.TargetParagraphNumberLabel
    );
    const videosNotInParagraphs = videos.filter(
      (video) => !video.TargetParagraphNumberLabel
    );

    const media = (
      executeQuery(
        db,
        `SELECT DocumentMultimedia.MultimediaId, DocumentMultimedia.DocumentId, *
       FROM DocumentMultimedia
         INNER JOIN Multimedia
           ON DocumentMultimedia.MultimediaId = Multimedia.MultimediaId
         LEFT JOIN Question
           ON Question.DocumentId = DocumentMultimedia.DocumentId
           AND Question.TargetParagraphOrdinal = DocumentMultimedia.BeginParagraphOrdinal
         WHERE DocumentMultimedia.DocumentId = ${docId}
           AND CategoryType <> 9
           AND CategoryType <> -1
           AND (KeySymbol != '${currentSongbook.value.pub}' OR KeySymbol IS NULL)
         GROUP BY DocumentMultimedia.MultimediaId
         ORDER BY BeginParagraphOrdinal` // pictures
      ) as MultimediaItem[]
    )
      .map((multimediaItem) =>
        addFullFilePathToMultimediaItem(multimediaItem, publication)
      )
      .concat(videosInParagraphs)
      .concat(
        // exclude the first two videos if wt is after FEB_2023, since these are the songs
        videosNotInParagraphs
          .slice(+issueString < FEB_2023 ? 0 : 2)
          .map((mediaObj) =>
            mediaObj.TargetParagraphNumberLabel === null
              ? { ...mediaObj, TargetParagraphNumberLabel: FOOTNOTE_TAR_PAR } // assign special number so we know videos are referenced by a footnote
              : mediaObj
          )
          .filter((v) => {
            return (
              !(getSettingValue('excludeFootnotes') as boolean) ||
              v.TargetParagraphNumberLabel < FOOTNOTE_TAR_PAR
            );
          })
      ) as MultimediaItem[];

    const updatedMedia = media.map((item) => {
      if (item.MultimediaId !== null && item.LinkMultimediaId !== null) {
        const linkedItem = media.find(
          (i) => i.MultimediaId === item.LinkMultimediaId
        );
        if (linkedItem && linkedItem.FilePath) {
          item.FilePath = linkedItem.FilePath;
          item.LinkMultimediaId = null;
          linkedItem.LinkMultimediaId = linkedItem.MultimediaId;
        }
      }
      return item;
    });

    const finalMedia = updatedMedia.filter(
      (item) => item.LinkMultimediaId === null
    );

    let songs: MultimediaItem[] = [];

    // Watchtowers before Feb 2023 don't include songs in DocumentMultimedia
    if (+issueString < FEB_2023) {
      songs = executeQuery(
        db,
        `SELECT *
            FROM Multimedia
            INNER JOIN DocumentMultimedia
              ON Multimedia.MultimediaId = DocumentMultimedia.MultimediaId
            WHERE DataType = 2
            ORDER BY BeginParagraphOrdinal
            LIMIT 2 OFFSET ${2 * weekNr}`
      ) as MultimediaItem[];
    } else {
      songs = videosNotInParagraphs.slice(0, 2); // after FEB_2023, the first two videos from DocumentMultimedia are the songs
    }
    let songLangs: string[] = [];
    try {
      songLangs = (
        executeQuery(
          db,
          `SELECT Extract.ExtractId, Extract.Link, DocumentExtract.BeginParagraphOrdinal
        FROM Extract
        INNER JOIN DocumentExtract ON Extract.ExtractId = DocumentExtract.ExtractId
        WHERE Extract.RefMepsDocumentClass = 31
        ORDER BY Extract.ExtractId
        LIMIT 2
        OFFSET ${2 * weekNr}`
        ) as MultimediaExtractItem[]
      )
        .sort((a, b) => a.BeginParagraphOrdinal - b.BeginParagraphOrdinal)
        .map((item) => {
          const match = item.Link.match(/\/(.*)\//);
          let langOverride = '';
          if (match) {
            langOverride = match.pop()?.split(':')[0] ?? '';
          }
          if (langOverride === (getSettingValue('lang') as string))
            langOverride = '';
          return langOverride;
        });
    } catch (e: unknown) {
      console.error(e);
      songLangs = songs.map(() => getSettingValue('lang') as string);
    }
    const mergedSongs = songs.map((song, index) => ({
      ...song,
      ...(songLangs[index] ? { LangOverride: songLangs[index] } : {}),
    }));

    const allMedia = finalMedia
      .concat(mergedSongs)
      .sort((a, b) => a.BeginParagraphOrdinal - b.BeginParagraphOrdinal);

    const multimediaMepsLangs = getMultimediaMepsLangs({ db, docId });
    for (const media of allMedia) {
      const mediaKeySymbol = media.KeySymbol === 'sjjm' ? currentSongbook.value.pub : media.KeySymbol;
      const multimediaMepsLangItem = multimediaMepsLangs.find((item) => item.KeySymbol === mediaKeySymbol && item.Track === media.Track && item.IssueTagNumber === media.IssueTagNumber);
      if (multimediaMepsLangItem?.MepsLanguageIndex) {
        const mepsLang = mepslangs[multimediaMepsLangItem.MepsLanguageIndex];
        if (mepsLang) media.AlternativeLanguage = mepsLang;
      }
      const videoMarkers = getMediaVideoMarkers({ db, docId }, media.MultimediaId);
      if (videoMarkers) media.VideoMarkers = videoMarkers;
    }

    await processMissingMediaInfo(allMedia);

    const dynamicMediaForDay = await dynamicMediaMapper(allMedia, lookupDate);

    const dynamicMedia: Record<
      string,
      Record<string, DynamicMediaObject[]>
    > = LocalStorage.getItem('dynamicMedia') || {};
    if (!dynamicMedia[currentCongregation.value])
      dynamicMedia[currentCongregation.value] = {} as Record<
        string,
        DynamicMediaObject[]
      >;

    dynamicMedia[currentCongregation.value][
      date.formatDate(lookupDate, 'YYYYMMDD')
    ] = dynamicMediaForDay;
    LocalStorage.set('dynamicMedia', dynamicMedia);

    return dynamicMediaForDay;
  } catch (e) {
    console.error('getWeMedia', e);
    const dynamicMedia: Record<
      string,
      Record<string, DynamicMediaObject[]>
    > = LocalStorage.getItem('dynamicMedia') || {};
    const returnVal = dynamicMedia[currentCongregation.value]?.[date.formatDate(lookupDate, 'YYYYMMDD')] ?? [];
    return returnVal;
  }
};

function sanitizeId(id: string) {
  const regex = /[a-zA-Z0-9\-_:.]/g;
  const sanitizedString = id.replace(regex, function (match) {
    return match;
  });
  return sanitizedString;
}

const getMwMedia = async (lookupDate: Date) => {
  lookupDate = dateFromString(lookupDate.toISOString());
  try {
    // if not monday, get the previous monday
    const monday = getSpecificWeekday(lookupDate, 0);

    const issue = date.subtractFromDate(monday, {
      months: (monday.getMonth() + 1) % 2 === 0 ? 1 : 0,
    });
    const issueString = date.formatDate(issue, 'YYYYMM') + '00';
    if (!(getSettingValue('lang') as string))
      throw new Error('No language selected');
    const publication = {
      pub: 'mwb',
      issue: issueString,
      langwritten: getSettingValue('lang') as string,
    };
    const db = await getDbFromJWPUB(publication);
    if (!db) {
      createTemporaryNotification({
        message: 'error.downloadMedia',
        caption: 'mwMeeting',
        type: 'negative',
        group: 'error.downloadMedia.mwMeeting',
      })
      throw new Error('No db found');
    }
    const docId = (
      executeQuery(
        db,
        `SELECT DocumentId FROM DatedText WHERE FirstDateOffset = ${date.formatDate(
          monday,
          'YYYYMMDD'
        )}`
      ) as { DocumentId: number }[]
    )[0]?.DocumentId;

    if (!docId)
      throw new Error('No document id found for ' + monday + ' ' + issueString);

    // const treasures = executeQuery(
    //   db,
    //   'SELECT FeatureTitle FROM Document WHERE Class = 21'
    // )[0] as DocumentItem;
    // const apply = executeQuery(
    //   db,
    //   'SELECT FeatureTitle FROM Document WHERE Class = 94'
    // )[0] as DocumentItem;
    // const living = executeQuery(
    //   db,
    //   'SELECT FeatureTitle FROM Document WHERE Class = 10 ORDER BY FeatureTitle'
    // ) as DocumentItem[];
    // let livingTitle = living[0]?.FeatureTitle;
    // if (living.length > 1) {
    //   livingTitle = living[Math.floor(living.length / 2)]?.FeatureTitle;
    // }

    // look into maybe extracting titles from something like this: https://wol.jw.org/wol/d/r1/lp-e/202023001

    // if (treasures?.FeatureTitle && apply?.FeatureTitle && livingTitle) {
    // }
    const mms = await getDocumentMultimediaItems({ db, docId }).map(
      (multimediaItem) => {
        const videoMarkers = getMediaVideoMarkers({ db, docId }, multimediaItem.MultimediaId);
        if (videoMarkers) multimediaItem.VideoMarkers = videoMarkers;
        return addFullFilePathToMultimediaItem(multimediaItem, publication)
      }
    );

    const extracts = await getDocumentExtractItems(db, docId);

    const allMedia: MultimediaItem[] = mms
      .concat(extracts)
      .sort((a, b) => a.BeginParagraphOrdinal - b.BeginParagraphOrdinal);

    const multimediaMepsLangs = getMultimediaMepsLangs({ db, docId });
    for (const media of allMedia) {
      const mediaKeySymbol = media.KeySymbol === 'sjjm' ? currentSongbook.value.pub : media.KeySymbol;
      const multimediaMepsLangItem = multimediaMepsLangs.find((item) => item.KeySymbol === mediaKeySymbol && item.Track === media.Track && item.IssueTagNumber === media.IssueTagNumber);
      if (multimediaMepsLangItem?.MepsLanguageIndex) {
        const mepsLang = mepslangs[multimediaMepsLangItem.MepsLanguageIndex];
        if (mepsLang) media.AlternativeLanguage = mepsLang;
      }
    }


    await processMissingMediaInfo(allMedia);

    const dynamicMediaForDay = await dynamicMediaMapper(allMedia, lookupDate);

    const dynamicMedia: Record<
      string,
      Record<string, DynamicMediaObject[]>
    > = LocalStorage.getItem('dynamicMedia') || {};
    if (!dynamicMedia[currentCongregation.value])
      dynamicMedia[currentCongregation.value] = {} as Record<
        string,
        DynamicMediaObject[]
      >;

    dynamicMedia[currentCongregation.value][
      date.formatDate(lookupDate, 'YYYYMMDD')
    ] = dynamicMediaForDay;

    LocalStorage.set('dynamicMedia', dynamicMedia);
    return dynamicMediaForDay;
  } catch (e) {
    console.error('getMwMedia', e);
    const dynamicMedia: Record<
      string,
      Record<string, DynamicMediaObject[]>
    > = LocalStorage.getItem('dynamicMedia') || {};
    // return (
    // dynamicMedia[currentCongregation.value][
    // date.formatDate(lookupDate, 'YYYYMMDD')
    // ] || ([] as DynamicMediaObject[])
    // );
    const returnVal = dynamicMedia[currentCongregation.value]?.[date.formatDate(lookupDate, 'YYYYMMDD')] ?? [];
    return returnVal;
  }
};

async function processMissingMediaInfo(allMedia: MultimediaItem[]) {
  for (const media of allMedia.filter(
    (m) => m.KeySymbol && (!m.Label || (!m.FilePath || !fs.existsSync(m.FilePath)))
  )) {
    if (!media.KeySymbol) {
      console.log('MISSING media.KeySymbol', media);
      continue;
    }
    const langwritten = media.AlternativeLanguage ?? getSettingValue('lang') as string;
    const publicationFetcher = {
      pub: media.KeySymbol,
      issue: media.IssueTagNumber,
      langwritten,
      fileformat: media.MimeType?.includes('audio') ? 'MP3' : 'MP4',
      ...(typeof media.Track === 'number' &&
        media.Track > 0 && { track: media.Track }),
    }
    if (!media.FilePath || !fs.existsSync(media.FilePath)) {
      media.FilePath = await downloadMissingMedia(publicationFetcher);
    }
    if (!media.Label) {
      media.Label =
        media.Label ||
        media.Caption ||
        (
          await getJwMediaInfo(publicationFetcher)
        ).title;
    }
  }
}

const getPubMediaLinks = async (publication: PublicationFetcher) => {
  const url = 'https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS';
  if (!publication.fileformat) publication.fileformat = '';
  if (publication.pub === 'sjjm') {
    publication.pub = currentSongbook.value.pub;
    // publication.fileformat = currentSongbook.value.fileformat;
  }
  publication.fileformat = publication.fileformat.toUpperCase();
  const params = {
    output: 'json',
    pub: publication.pub,
    fileformat: publication.fileformat,
    issue: publication.issue?.toString() || '',
    track: publication.track?.toString() || '',
    alllangs: '0',
    langwritten: publication.langwritten,
    txtCMSLang: 'E',
  };
  const response = await get(urlWithParamsToString(url, params));
  if (!response) {
    createTemporaryNotification({
      message: 'error.pubNotFound',
      caption: [publication.pub, publication.langwritten, publication.issue, publication.track, publication.fileformat].filter(Boolean).join('_'),
      type: 'negative',
    })
  }
  return response;
};

export function findBestResolution(mediaLinks: MediaLink[]) {
  let bestItem = null;
  let bestHeight = 0;
  const maxRes = parseInt(
    (getSettingValue('maxRes') as string).replace(/\D/g, '')
  );
  if (mediaLinks.some((m) => !m.subtitled))
    mediaLinks = mediaLinks.filter((m) => !m.subtitled);
  for (const mediaLink of mediaLinks) {
    if (mediaLink.frameHeight <= maxRes && mediaLink.frameHeight > bestHeight) {
      bestItem = mediaLink;
      bestHeight = mediaLink.frameHeight;
    }
  }
  return bestItem;
}

const downloadMissingMedia = async (publication: PublicationFetcher) => {
  const pubDir = getPublicationDirectory(publication);
  const responseObject = await getPubMediaLinks(publication);
  if (!responseObject?.files) {
    if (!fs.existsSync(pubDir)) return ''; // Publication not found
    const files = klawSync(pubDir, {
      nodir: true,
      filter: (file) => {
        let match = true;
        const params = [publication.issue, publication.track, publication.pub]
          .filter((i) => i !== undefined)
          .map((i) => i?.toString()) as string[];
        for (const test of params) {
          if (!path.basename(file.path).includes(test)) match = false;
        }
        if (
          !publication.fileformat ||
          !path
            .extname(file.path)
            .toLowerCase()
            .includes(publication.fileformat?.toLowerCase())
        )
          match = false;
        return match;
      },
    });
    console.warn(
      'No response, falling back to cache',
      publication,
      pubDir,
      files
    );
    return files.length > 0 ? files[0].path : '';
  }
  if (!publication.fileformat)
    publication.fileformat = Object.keys(
      responseObject.files[publication.langwritten]
    )[0];
  const mediaItemLinks: MediaLink[] =
    responseObject.files[publication.langwritten][publication.fileformat];
  const bestItem = findBestResolution(mediaItemLinks);
  if (!bestItem) {
    return '';
  }
  const downloadedFile = (await addToDownloads({
    url: bestItem.file.url,
    dir: pubDir,
    size: bestItem.filesize,
  })) as DownloadedFile;

  // Save thumbnail if available but not present on disk
  const { thumbnail } = await getJwMediaInfo(publication);
  const thumbnailFilename =
    path.basename(bestItem.file.url).split('.')[0] + path.extname(thumbnail);
  if (
    thumbnail &&
    bestItem.file?.url &&
    (downloadedFile?.new ||
      !fs.existsSync(path.join(pubDir, thumbnailFilename)))
  ) {
    await addToDownloads({
      url: thumbnail,
      dir: pubDir,
      filename: thumbnailFilename,
    });
  }
  return downloadedFile?.path;
};

function getBestImageUrl(images: MediaImages) {
  const preferredOrder = ['wss', 'lsr', 'sqr', 'pnr'];
  for (const key of preferredOrder) {
    if (images.hasOwnProperty(key)) {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      for (const size of sizes) {
        if (images[key].hasOwnProperty(size)) {
          return images[key][size];
        }
      }
      // If none of the preferred sizes are found, return any other size
      const otherSizes = Object.keys(images[key]).filter(
        (size) => !sizes.includes(size)
      );
      if (otherSizes.length > 0) {
        return images[key][otherSizes[0]];
      }
    }
  }
  return '';
}

const getJwMediaInfo = async (publication: PublicationFetcher) => {
  try {
    let url = 'https://b.jw-cdn.org/apis/mediator/v1/media-items/';
    url += publication.langwritten + '/';
    url += 'pub-' + publication.pub;
    let issue = publication.issue?.toString();
    if (issue && issue.endsWith('00')) issue = issue.slice(0, -2);
    if (issue && issue !== '0') url += '_' + issue;
    if (publication.track) url += '_' + publication.track;
    if (publication.fileformat?.includes('MP4')) url += '_VIDEO';
    else if (publication.fileformat?.includes('MP3')) url += '_AUDIO';
    const responseObject = await get(url);
    if (!responseObject.media || responseObject.media.length === 0) {
      console.warn('No thumbnail found:' + url);
      return { thumbnail: '', title: '' };
    }
    return {
      thumbnail: getBestImageUrl(responseObject.media[0].images),
      title: responseObject.media[0].title,
    };
  } catch (error) {
    console.error(error);
    return { thumbnail: '', title: '' };
  }
};

const downloadPubMediaFiles = async (publication: PublicationFetcher) => {
  const publicationInfo: Publication = await getPubMediaLinks(publication);
  if (!publication.fileformat) return;
  if (!publicationInfo.files) {
    createTemporaryNotification({
      message: 'Error downloading publication',
      caption: publication.pub,
      icon: 'mdi-cloud-off',
      type: 'negative',
    });
    return;
  }

  const mediaLinks: MediaLink[] = publicationInfo.files[
    publication.langwritten
  ][publication.fileformat].filter(
    (mediaLink) =>
      !publication.maxTrack || mediaLink.track < publication.maxTrack
  );

  const dir = getPublicationDirectory(publication, true);
  const filteredMediaItemLinks = [] as MediaLink[]
  for (const mediaItemLink of mediaLinks) {
    const currentTrack = mediaItemLink.track
    if (!filteredMediaItemLinks.some(m => m.track === currentTrack)) {
      const bestItem = findBestResolution(mediaLinks.filter(m => m.track === currentTrack));
      if (bestItem) filteredMediaItemLinks.push(bestItem)
    }
  }

  await addToDownloadsWithLimit(filteredMediaItemLinks, dir)
};

const downloadBackgroundMusic = () => {
  if (!currentSongbook.value || !currentSettings.value?.lang) return;
  downloadPubMediaFiles({
    pub: currentSongbook.value.pub,
    langwritten: currentSettings.value.lang,
    fileformat: currentSongbook.value.fileformat,
    maxTrack: MAX_SONGS,
  })
}

async function addToDownloadsWithLimit(mediaLinks: MediaLink[], dir: string, limit = 10) {
  const queue = [];
  const results = [];

  for (const mediaLink of mediaLinks) {
    const downloadPromise = addToDownloads({
      url: mediaLink.file.url,
      dir,
      size: mediaLink.filesize,
    });

    queue.push(downloadPromise);

    // When the queue is at the limit, wait for one to finish
    if (queue.length >= limit) {
      const finishedPromise: Promise<DownloadedFile> = Promise.race(queue) as Promise<DownloadedFile>;
      results.push(await finishedPromise);
      // Remove the finished promise from the queue
      queue.splice(queue.indexOf(finishedPromise), 1);
    }
  }

  // Wait for the remaining promises in the queue
  results.push(...await Promise.all(queue));

  return results;
}

const downloadJwpub = async (
  publication: PublicationFetcher
): Promise<DownloadedFile> => {
  publication.fileformat = 'JWPUB';
  const publicationInfo: Publication = await getPubMediaLinks(publication);
  if (!publicationInfo.files) {
    console.error('No JWPUB file found from JSON');
    return {
      path: '',
      new: false,
    };
  }
  const mediaLinks: MediaLink[] = publicationInfo.files[
    publication.langwritten
  ][publication.fileformat].filter(
    (mediaLink) =>
      !publication.maxTrack || mediaLink.track < publication.maxTrack
  );
  if (!mediaLinks.length) {
    console.error('No JWPUB file found from JSON');
    return {
      path: '',
      new: false,
    };
  }

  return (await addToDownloads({
    url: mediaLinks[0].file.url,
    dir: getPublicationDirectory(publication),
    size: mediaLinks[0].filesize,
  })) as DownloadedFile;
};

export {
  getMwMedia,
  getWeMedia,
  getPubMediaLinks,
  downloadPubMediaFiles,
  fetchMedia,
  sanitizeId,
  getDocumentMultimediaItems,
  processMissingMediaInfo,
  dynamicMediaMapper,
  getPublicationInfoFromDb,
  addFullFilePathToMultimediaItem,
  downloadFile,
  downloadBackgroundMusic,
};
