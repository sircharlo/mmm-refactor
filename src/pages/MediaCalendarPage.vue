<template>
  <q-page
    :class="
      !(
        sortableAdditionalMediaItems?.length ||
        sortableWtMediaItems.length ||
        sortableTgwMediaItems?.length ||
        sortableAyfmMediaItems?.length ||
        sortableLacMediaItems?.length
      )
        ? 'flex'
        : ''
    "
    @dragenter="dropActive"
    @dragover="dropActive"
    @dragstart="dropActive"
    @drop="dropEnd"
    padding
  >
    <div
      class="col content-center q-py-xl"
      v-if="
        (selectedDateObject?.meeting && !selectedDateObject?.complete) ||
        !(
          sortableAdditionalMediaItems?.length ||
          sortableWtMediaItems?.length ||
          sortableTgwMediaItems?.length ||
          sortableAyfmMediaItems?.length ||
          sortableLacMediaItems?.length
        )
      "
    >
      <div class="row justify-center">
        <div class="col-6 text-center">
          <div class="row items-center justify-center q-my-lg">
            <q-spinner
              color="primary"
              size="lg"
              v-if="
                selectedDateObject?.meeting &&
                !selectedDateObject?.complete &&
                !selectedDateObject?.error
              "
            />
            <q-img
              fit="contain"
              src="images/no-media.svg"
              style="max-height: 30vh"
              v-else
            />
          </div>
          <div
            class="row items-center justify-center text-subtitle1 text-semibold"
          >
            {{
              !selectedDate
                ? $t('noDateSelected')
                : selectedDateObject?.meeting && !selectedDateObject?.error
                  ? $t('please-wait')
                  : $t('there-are-no-media-items-for-the-selected-date')
            }}
          </div>
          <div class="row items-center justify-center text-center">
            {{
              !selectedDate
                ? $t('select-a-date-to-begin')
                : selectedDateObject?.meeting && !selectedDateObject?.error
                  ? $t('currently-loading')
                  : $t(
                      'use-the-import-button-to-add-media-for-this-date-or-select-another-date-to-view-the-corresponding-meeting-media',
                    )
            }}
          </div>
          <div
            class="row items-center justify-center q-mt-lg q-gutter-md"
            v-if="!selectedDateObject?.meeting || selectedDateObject?.error"
          >
            <q-btn @click="goToNextMeeting()" color="primary" outline>
              <q-icon class="q-mr-sm" name="mmm-go-to-date" size="xs" />
              {{ $t('next-meeting') }}
            </q-btn>
            <q-btn @click="openImportMenu()" color="primary">
              <q-icon class="q-mr-sm" name="mmm-import-media" size="xs" />
              {{ $t('import-media') }}
            </q-btn>
          </div>
        </div>
      </div>
    </div>
    <q-list
      class="media-section additional"
      v-show="sortableAdditionalMediaItems?.length"
    >
      <q-item class="text-additional items-center">
        <q-avatar class="text-white bg-additional rounded-borders-sm" size="md">
          <q-icon name="mmm-additional-media" size="md" />
        </q-avatar>
        <div class="text-bold text-uppercase text-spaced">
          {{ $t('imported-media') }}
        </div>
      </q-item>
      <q-list class="list-droppable" ref="additionalList">
        <MediaItem
          :key="media.uniqueId"
          :list="sortableAdditionalMediaItems"
          :media="media"
          v-for="media in sortableAdditionalMediaItems"
        />
      </q-list>
    </q-list>
    <q-list
      class="media-section tgw"
      v-show="
        selectedDateObject?.complete &&
        (sortableTgwMediaItems.length ||
          sortableAyfmMediaItems.length ||
          sortableLacMediaItems.length)
      "
    >
      <q-item class="text-tgw items-center">
        <q-avatar class="text-white bg-tgw jw-icon" size="md"></q-avatar>
        <div class="text-bold text-uppercase text-spaced">
          {{ $t('tgw') }}
        </div>
      </q-item>
      <q-list class="list-droppable" ref="tgwList">
        <MediaItem
          :key="media.uniqueId"
          :list="sortableTgwMediaItems"
          :media="media"
          v-for="media in sortableTgwMediaItems"
        />
      </q-list>
    </q-list>
    <q-list
      class="media-section ayfm"
      v-show="
        selectedDateObject?.complete &&
        (sortableTgwMediaItems.length ||
          sortableAyfmMediaItems.length ||
          sortableLacMediaItems.length)
      "
    >
      <q-item class="text-ayfm items-center">
        <q-avatar class="text-white bg-ayfm jw-icon" size="lg"></q-avatar>
        <div class="text-bold text-uppercase text-spaced">
          {{ $t('ayfm') }}
        </div>
      </q-item>
      <q-list class="list-droppable" ref="ayfmList">
        <MediaItem
          :key="media.uniqueId"
          :list="sortableAyfmMediaItems"
          :media="media"
          v-for="media in sortableAyfmMediaItems"
        />
      </q-list>
    </q-list>
    <q-list
      class="media-section lac"
      v-show="
        selectedDateObject?.complete &&
        (sortableTgwMediaItems.length ||
          sortableAyfmMediaItems.length ||
          sortableLacMediaItems.length)
      "
    >
      <q-item class="text-lac items-center">
        <q-avatar class="text-white bg-lac jw-icon" size="lg"></q-avatar>
        <div class="text-bold text-uppercase text-spaced">
          {{ $t('lac') }}
        </div>
      </q-item>
      <q-list class="list-droppable" ref="lacList">
        <MediaItem
          :key="media.uniqueId"
          :list="sortableLacMediaItems"
          :media="media"
          v-for="media in sortableLacMediaItems"
        />
      </q-list>
    </q-list>
    <q-list
      class="media-section wt"
      v-show="selectedDateObject?.complete && sortableWtMediaItems.length"
    >
      <q-item class="text-wt items-center">
        <q-avatar class="text-white bg-wt jw-icon" size="lg"></q-avatar>
        <div class="text-bold text-uppercase text-spaced">
          {{ $t('wt') }}
        </div>
      </q-item>
      <q-list class="list-droppable" ref="wtList">
        <MediaItem
          :key="media.uniqueId"
          :list="sortableWtMediaItems"
          :media="media"
          v-for="media in sortableWtMediaItems"
        />
      </q-list>
    </q-list>
  </q-page>
  <DragAndDropper
    :files-loading="filesLoading"
    :jwpub-db="jwpubImportDb"
    :jwpub-documents="jwpubImportDocuments"
    @drop="dropEnd"
    v-model="dragging"
  />
</template>

<script setup lang="ts">
import type { DNDPlugin } from '@formkit/drag-and-drop';

import {
  animations,
  multiDrag,
  parents,
  selections,
} from '@formkit/drag-and-drop';
import { useDragAndDrop } from '@formkit/drag-and-drop/vue';
import { Buffer } from 'buffer';
import DOMPurify from 'dompurify';
import { storeToRefs } from 'pinia';
import { date, uid } from 'quasar';
import DragAndDropper from 'src/components/media/DragAndDropper.vue';
import MediaItem from 'src/components/media/MediaItem.vue';
import { electronApi } from 'src/helpers/electron-api';
import { errorCatcher } from 'src/helpers/error-catcher';
import {
  getDurationFromMediaPath,
  getFileUrl,
  getPublicationDirectory,
  getTempDirectory,
  getThumbnailUrl,
} from 'src/helpers/fs';
import {
  addJwpubDocumentMediaToFiles,
  downloadFileIfNeeded,
  fetchMedia,
  getPublicationInfoFromDb,
  sanitizeId,
} from 'src/helpers/jw-media';
import {
  convertImageIfNeeded,
  decompressJwpub,
  findDb,
  getMediaFromJwPlaylist,
  inferExtension,
  isArchive,
  isAudio,
  isImage,
  isImageString,
  isJwPlaylist,
  isJwpub,
  isPdf,
  isRemoteUrl,
  isVideo,
} from 'src/helpers/mediaPlayback';
import { createTemporaryNotification } from 'src/helpers/notifications';
import { sendObsSceneEvent } from 'src/helpers/obs';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { DynamicMediaObject } from 'src/types/media';
import { DocumentItem, TableItem } from 'src/types/sqlite';
import { computed, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const dragging = ref(false);
const jwpubImportDb = ref('');
const jwpubImportDocuments: Ref<DocumentItem[]> = ref([] as DocumentItem[]);

watch(
  () => [jwpubImportDb.value, jwpubImportDocuments.value],
  ([newJwpubImportDb, newJwpubImportDocuments]) => {
    if (!!newJwpubImportDb || newJwpubImportDocuments?.length) {
      dragging.value = true;
    }
  },
);

const { t } = useI18n();

const jwStore = useJwStore();
const { addToAdditionMediaMap, removeFromAdditionMediaMap, updateJwSongs } =
  jwStore;
const { additionalMediaMaps, customDurations, lookupPeriod, mediaSort } =
  storeToRefs(jwStore);
const currentState = useCurrentStateStore();
const {
  currentCongregation,
  currentSettings,
  getDatedAdditionalMediaDirectory,
  mediaPaused,
  mediaPlaying,
  mediaPlayingAction,
  mediaPlayingCurrentPosition,
  mediaPlayingPanzoom,
  mediaPlayingSubtitlesUrl,
  mediaPlayingUniqueId,
  mediaPlayingUrl,
  selectedDate,
  selectedDateObject,
} = storeToRefs(currentState);
updateJwSongs();
const {
  convertPdfToImages,
  decompress,
  executeQuery,
  fs,
  getLocalPathFromFileObject,
  path,
} = electronApi;

const filesLoading = ref(false);

watch(
  () => mediaPlayingUniqueId.value,
  (newMediaUniqueId) => {
    bc.postMessage({ uniqueId: newMediaUniqueId });
  },
);

watch(
  () => mediaPlayingAction.value,
  (newAction, oldAction) => {
    if (newAction !== oldAction) bc.postMessage({ action: newAction });
  },
);

watch(
  () => mediaPlayingSubtitlesUrl.value,
  (newSubtitlesUrl, oldSubtitlesUrl) => {
    if (newSubtitlesUrl !== oldSubtitlesUrl)
      bc.postMessage({ subtitlesUrl: newSubtitlesUrl });
  },
);

watch(
  () => mediaPlayingPanzoom.value,
  (newPanzoom, oldPanzoom) => {
    try {
      if (JSON.stringify(newPanzoom) !== JSON.stringify(oldPanzoom))
        bc.postMessage({
          scale: newPanzoom.scale,
          x: newPanzoom.x,
          y: newPanzoom.y,
        });
    } catch (error) {
      errorCatcher(error);
    }
  },
  { deep: true },
);

watch(
  () => mediaPlayingUrl.value,
  (newUrl, oldUrl) => {
    if (newUrl !== oldUrl) bc.postMessage({ url: newUrl });
  },
);

const datedAdditionalMediaMap = computed(() => {
  return (
    additionalMediaMaps.value[currentCongregation.value]?.[
      selectedDate.value
    ] ?? []
  );
});

const bc = new BroadcastChannel('mediaPlayback');
bc.onmessage = (event) => {
  if (event.data?.state === 'ended') {
    mediaPlayingCurrentPosition.value = 0;
    // mediaPlayingSeekTo.value = 0;
    mediaPlayingUrl.value = '';
    mediaPlayingUniqueId.value = '';
    mediaPlayingAction.value =
      mediaPlayingAction.value === 'backgroundMusicPlay'
        ? 'backgroundMusicCurrentEnded'
        : '';
  }
  // if (event.data?.resetPanzoom) zoomReset(event.data.resetPanzoom, true);
  if ('currentPosition' in event.data) {
    mediaPlayingCurrentPosition.value = event.data.currentPosition;
  }
};

const mapOrder =
  (sortOrder: string | string[] | undefined) =>
  (a: DynamicMediaObject, b: DynamicMediaObject) => {
    try {
      const key = 'uniqueId';
      if (!sortOrder || sortOrder.length === 0) return 0;
      return sortOrder.indexOf(a[key]) > sortOrder.indexOf(b[key]) ? 1 : -1;
    } catch (e) {
      errorCatcher(e);
      return 0;
    }
  };

const updateMediaSortPlugin: DNDPlugin = (parent) => {
  const parentData = parents.get(parent);
  if (!parentData) return;

  const updateMediaSection = (id: string, section: string) => {
    (selectedDateObject.value?.dynamicMedia ?? []).forEach((item) => {
      if (item.uniqueId === id && item.section !== section) {
        item.section = section;
      }
    });
    (
      additionalMediaMaps.value[currentCongregation.value]?.[
        selectedDate.value
      ] ?? []
    ).forEach((item) => {
      if (item.uniqueId === id && item.section !== section) {
        item.section = section;
      }
    });
  };
  function dragover() {
    for (const media of sortableAdditionalMediaItems.value) {
      updateMediaSection(media.uniqueId, 'additional');
    }
    for (const media of sortableTgwMediaItems.value) {
      updateMediaSection(media.uniqueId, 'tgw');
    }
    for (const media of sortableAyfmMediaItems.value) {
      updateMediaSection(media.uniqueId, 'ayfm');
    }
    for (const media of sortableLacMediaItems.value) {
      updateMediaSection(media.uniqueId, 'lac');
    }
    for (const media of sortableWtMediaItems.value) {
      updateMediaSection(media.uniqueId, 'wt');
    }
  }

  function dragend() {
    if (!mediaSort.value[currentCongregation.value])
      mediaSort.value[currentCongregation.value] = {};
    mediaSort.value[currentCongregation.value][selectedDate.value] =
      // sortableMediaItems.value.map((item: DynamicMediaObject) => item.uniqueId);
      [
        ...sortableAdditionalMediaItems.value,
        ...sortableTgwMediaItems.value,
        ...sortableAyfmMediaItems.value,
        ...sortableLacMediaItems.value,
        ...sortableWtMediaItems.value,
      ].map((item: DynamicMediaObject) => item.uniqueId);
  }

  return {
    setupNode(data) {
      data.node.addEventListener('dragover', dragover);
      data.node.addEventListener('dragend', dragend);
    },
    tearDownNode(data) {
      data.node.removeEventListener('dragover', dragover);
      data.node.removeEventListener('dragend', dragend);
    },
  };
};

const sortableMediaItems = ref([] as DynamicMediaObject[]);

const generateMediaList = () => {
  const combinedMediaItems = datedAdditionalMediaMap.value.concat(
    selectedDateObject.value?.dynamicMedia ?? [],
  );
  if (combinedMediaItems && currentCongregation.value) {
    if (!mediaSort.value[currentCongregation.value]) {
      mediaSort.value[currentCongregation.value] = {};
    }
    const seenFileUrls = new Set();
    sortableMediaItems.value = combinedMediaItems
      .sort(
        mapOrder(
          selectedDate.value
            ? mediaSort.value[currentCongregation.value][selectedDate.value]
            : [],
        ),
      )
      .filter((m) => {
        if (!m.fileUrl || seenFileUrls.has(m.fileUrl)) {
          return false;
        }
        seenFileUrls.add(m.fileUrl);
        return true;
      });
  }
};

watch(
  () => [
    selectedDateObject.value?.date,
    datedAdditionalMediaMap.value?.length,
    selectedDateObject.value?.dynamicMedia?.length,
  ],
  (
    [newSelectedDate, newAdditionalMediaListLength, newDynamicMediaListLength],
    [oldSelectedDate, oldAdditionalMediaListLength, oldDynamicMediaListLength],
  ) => {
    try {
      if (
        newSelectedDate !== oldSelectedDate ||
        newAdditionalMediaListLength !== oldAdditionalMediaListLength ||
        newDynamicMediaListLength !== oldDynamicMediaListLength
      ) {
        generateMediaList();
      }
    } catch (e) {
      errorCatcher(e);
    }
  },
);

watch(
  () => mediaSort.value?.[currentCongregation.value]?.[selectedDate.value],
  (newMediaSort) => {
    try {
      if (newMediaSort && newMediaSort.length === 0) {
        generateMediaList();
      }
    } catch (e) {
      errorCatcher(e);
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => [mediaPlaying.value, mediaPaused.value, mediaPlayingUrl.value],
  ([newMediaPlaying, newMediaPaused]) => {
    sendObsSceneEvent(
      newMediaPaused ? 'camera' : newMediaPlaying ? 'media' : 'camera',
    );
  },
);

watch(
  () =>
    lookupPeriod.value[currentCongregation.value]
      ?.filter((d) => d.error)
      .map((d) => date.formatDate(d.date, 'YYYY/MM/DD')),
  (newVal) => {
    newVal.forEach(() => {
      createTemporaryNotification({
        caption: !currentSettings.value?.langFallback
          ? t('tryConfiguringFallbackLanguage')
          : '',
        group: 'meetingMediaDownloadError',
        icon: 'mmm-error',
        message: t('errorDownloadingMeetingMedia'),
        timeout: 15000,
        type: 'negative',
      });
    });
  },
);

const startDragging = () => {
  resetDragging();
  dragging.value = true;
};

const goToNextMeeting = () => {
  try {
    if (
      currentCongregation.value &&
      lookupPeriod.value[currentCongregation.value]
    ) {
      selectedDate.value = date.formatDate(
        lookupPeriod.value[currentCongregation.value]
          ?.filter((day) => day.meeting)
          .map((day) => day.date)[0],
        'YYYY/MM/DD',
      );
    }
  } catch (e) {
    errorCatcher(e);
  }
};

const openImportMenu = () => {
  window.dispatchEvent(new CustomEvent('openImportMenu'));
};

onMounted(async () => {
  window.addEventListener('draggingSomething', startDragging);
  window.addEventListener('localFiles-browsed', localFilesBrowsedListener);
  window.addEventListener('remote-video-loading', remoteVideoLoading);

  watch(selectedDate, (newVal) => {
    try {
      if (!currentCongregation.value || !newVal) {
        return;
      }
      const durations = (customDurations.value[currentCongregation.value] ||=
        {});
      durations[newVal] ||= {};
    } catch (e) {
      errorCatcher(e);
    }
  });
  generateMediaList();
  goToNextMeeting();
  sendObsSceneEvent('camera');
  fetchMedia();
});

const [tgwList, sortableTgwMediaItems] = useDragAndDrop(
  [] as DynamicMediaObject[],
  {
    group: 'sortableMedia',
    plugins: [
      updateMediaSortPlugin,
      animations(),
      multiDrag({
        plugins: [
          selections({
            // selectedClass: 'selected-to-drag',
          }),
        ],
      }),
    ],
  },
);

const [ayfmList, sortableAyfmMediaItems] = useDragAndDrop(
  [] as DynamicMediaObject[],
  {
    group: 'sortableMedia',
    plugins: [
      updateMediaSortPlugin,
      animations(),
      multiDrag({
        plugins: [
          selections({
            // selectedClass: 'selected-to-drag',
          }),
        ],
      }),
    ],
  },
);

const [lacList, sortableLacMediaItems] = useDragAndDrop(
  [] as DynamicMediaObject[],
  {
    group: 'sortableMedia',
    plugins: [
      updateMediaSortPlugin,
      animations(),
      multiDrag({
        plugins: [
          selections({
            // selectedClass: 'selected-to-drag',
          }),
        ],
      }),
    ],
  },
);

const [wtList, sortableWtMediaItems] = useDragAndDrop(
  [] as DynamicMediaObject[],
  {
    group: 'sortableMedia',
    plugins: [
      updateMediaSortPlugin,
      animations(),
      multiDrag({
        plugins: [
          selections({
            // selectedClass: 'selected-to-drag',
          }),
        ],
      }),
    ],
  },
);

const [additionalList, sortableAdditionalMediaItems] = useDragAndDrop(
  [] as DynamicMediaObject[],
  {
    group: 'sortableMedia',
    plugins: [
      updateMediaSortPlugin,
      animations(),
      multiDrag({
        plugins: [
          selections({
            // selectedClass: 'selected-to-drag',
          }),
        ],
      }),
    ],
  },
);
watch(
  () => sortableMediaItems.value,
  (newVal) => {
    sortableTgwMediaItems.value = newVal.filter((m) => m.section === 'tgw');
    sortableAyfmMediaItems.value = newVal.filter((m) => m.section === 'ayfm');
    sortableLacMediaItems.value = newVal.filter((m) => m.section === 'lac');
    sortableWtMediaItems.value = newVal.filter((m) => m.section === 'wt');
    sortableAdditionalMediaItems.value = newVal.filter(
      (m) => m.section === 'additional',
    );
  },
  { deep: true, immediate: true },
);

const copyToDatedAdditionalMedia = async (files: string[]) => {
  const datedAdditionalMediaDir = getDatedAdditionalMediaDirectory.value;
  fs.ensureDirSync(datedAdditionalMediaDir);

  const trimFilepathAsNeeded = (filepath: string) => {
    let filepathSize = new Blob([filepath]).size;
    while (filepathSize > 230) {
      const overBy = filepathSize - 230;
      const baseName = path
        .basename(filepath)
        .slice(0, -path.extname(filepath).length);
      const newBaseName = baseName.slice(0, -overBy);
      filepath = path.join(
        datedAdditionalMediaDir,
        newBaseName + path.extname(filepath),
      );
      filepathSize = new Blob([filepath]).size;
    }
    return filepath;
  };
  for (const filepathToCopy of files) {
    try {
      if (!filepathToCopy || !fs.existsSync(filepathToCopy)) continue;
      let datedAdditionalMediaPath = path.join(
        datedAdditionalMediaDir,
        path.basename(filepathToCopy),
      );
      datedAdditionalMediaPath = trimFilepathAsNeeded(datedAdditionalMediaPath);
      const uniqueId = sanitizeId(
        date.formatDate(selectedDate.value, 'YYYYMMDD') +
          '-' +
          getFileUrl(datedAdditionalMediaPath),
      );
      if (fs.existsSync(datedAdditionalMediaPath)) {
        if (filepathToCopy !== datedAdditionalMediaPath) {
          fs.removeSync(datedAdditionalMediaPath);
          removeFromAdditionMediaMap(uniqueId);
        }
      }
      if (filepathToCopy !== datedAdditionalMediaPath)
        fs.copySync(filepathToCopy, datedAdditionalMediaPath);
      await addToAdditionMediaMapFromPath(datedAdditionalMediaPath, uniqueId);
    } catch (error) {
      errorCatcher(filepathToCopy);
      errorCatcher(error);
    }
  }
};

const addToAdditionMediaMapFromPath = async (
  additionalFilePath: string,
  uniqueId?: string,
  stream?: {
    duration: number;
    song?: string;
    thumbnailUrl: string;
    title?: string;
    url: string;
  },
) => {
  try {
    if (!additionalFilePath) return;
    const isVideoFile = isVideo(additionalFilePath);
    const isAudioFile = isAudio(additionalFilePath);
    let duration = 0;
    if (isVideoFile || isAudioFile) {
      duration =
        stream?.duration ??
        (await getDurationFromMediaPath(additionalFilePath));
    }
    if (!uniqueId) {
      uniqueId = sanitizeId(
        date.formatDate(selectedDate.value, 'YYYYMMDD') +
          '-' +
          getFileUrl(additionalFilePath),
      );
    }
    addToAdditionMediaMap([
      {
        duration,
        fileUrl: getFileUrl(additionalFilePath),
        isAdditional: true,
        isAudio: isAudioFile,
        isImage: isImage(additionalFilePath),
        isVideo: isVideoFile,
        section: 'additional',
        sectionOriginal: 'additional',
        song: stream?.song,
        streamUrl: stream?.url,
        thumbnailUrl:
          stream?.thumbnailUrl ??
          (await getThumbnailUrl(additionalFilePath, true)),
        title: stream?.title ?? path.basename(additionalFilePath),
        uniqueId,
      },
    ]);
  } catch (error) {
    errorCatcher(additionalFilePath);
    errorCatcher(error);
  }
};

const addToFiles = async (
  files: { filetype?: string; path: string }[] | FileList,
) => {
  if (!files) return;
  filesLoading.value = true;
  for (let i = 0; i < files.length; i++) {
    let filepath = files[i]?.path;
    try {
      if (!filepath) continue;
      // Check if file is remote URL; if so, download it
      if (isRemoteUrl(filepath)) {
        const baseFileName = path.basename(new URL(filepath).pathname);
        filepath = (
          await downloadFileIfNeeded({
            dir: getTempDirectory(),
            filename: inferExtension(
              baseFileName,
              (files[i] as { filetype?: string }).filetype,
            ),
            url: filepath,
          })
        ).path;
      } else if (isImageString(filepath)) {
        const [preamble, data] = filepath.split(';base64,');
        const ext = preamble.split('/')[1];
        const tempFilename = uid() + '.' + ext;
        const tempFilepath = path.join(getTempDirectory(), tempFilename);
        fs.writeFileSync(tempFilepath, Buffer.from(data, 'base64'));
        filepath = tempFilepath;
      }
      filepath = await convertImageIfNeeded(filepath);
      if (isImage(filepath) || isVideo(filepath) || isAudio(filepath)) {
        copyToDatedAdditionalMedia([filepath]);
      } else if (isPdf(filepath)) {
        const convertedImages = (
          await convertPdfToImages(filepath, getTempDirectory())
        ).map((path) => {
          return { path };
        });
        await addToFiles(convertedImages);
      } else if (isJwpub(filepath)) {
        // TODO: only decompress the db in memory using adm-zip, to get the publication info
        const tempUnzipDir = await decompressJwpub(filepath);
        console.log(tempUnzipDir);
        const tempDb = findDb(tempUnzipDir);
        console.log(tempDb);
        if (!tempDb) return;
        const publication = getPublicationInfoFromDb(tempDb);
        console.log(publication);
        const publicationDirectory = getPublicationDirectory(publication);
        console.log(publicationDirectory);
        if (!publicationDirectory) return;
        const unzipDir = await decompressJwpub(filepath, publicationDirectory);
        console.log(unzipDir);
        const db = findDb(unzipDir);
        console.log(db);
        if (!db) return;
        jwpubImportDb.value = db;
        if (executeQuery(db, 'SELECT * FROM Multimedia;').length === 0) {
          createTemporaryNotification({
            caption: path.basename(filepath),
            icon: 'mmm-jwpub',
            message: t('jwpubNoMultimedia'),
            type: 'warning',
          });
          jwpubImportDb.value = '';
        } else {
          const documentMultimediaTableExists =
            (
              executeQuery(
                db,
                'PRAGMA table_info(DocumentMultimedia);',
              ) as TableItem[]
            ).length > 0;
          const mmTable = documentMultimediaTableExists
            ? 'DocumentMultimedia'
            : 'Multimedia';
          jwpubImportDocuments.value = executeQuery(
            db,
            `SELECT DISTINCT Document.DocumentId, Title FROM Document JOIN ${mmTable} ON Document.DocumentId = ${mmTable}.DocumentId;`,
          ) as DocumentItem[];
          console.log(jwpubImportDocuments.value.length);
          // if (jwpubImportDocuments.value.length > 1) {
          // } else if (jwpubImportDocuments.value.length === 1) {
          if (jwpubImportDocuments.value.length === 1) {
            const errors = await addJwpubDocumentMediaToFiles(
              jwpubImportDb.value,
              jwpubImportDocuments.value[0],
            );
            jwpubImportDb.value = '';
            jwpubImportDocuments.value = [];
            if (errors?.length)
              errors.forEach((e) =>
                createTemporaryNotification({
                  caption: t('file-not-available'),
                  icon: 'mmm-error',
                  message: [
                    e.pub,
                    e.issue,
                    e.track,
                    e.langwritten,
                    e.fileformat,
                  ]
                    .filter(Boolean)
                    .join('_'),
                  timeout: 15000,
                  type: 'negative',
                }),
              );
          } else {
            filesLoading.value = false;
          }
        }
        // jwpubImportLoading.value = false;
      } else if (isJwPlaylist(filepath)) {
        getMediaFromJwPlaylist(
          filepath,
          selectedDateObject.value?.date,
          getDatedAdditionalMediaDirectory.value,
        )
          .then((additionalMedia) => {
            addToAdditionMediaMap(additionalMedia);
          })
          .catch((error) => {
            errorCatcher(error);
          })
          .finally(() => {
            filesLoading.value = false;
            dragging.value = false;
          });
      } else if (isArchive(filepath)) {
        const unzipDirectory = path.join(
          getTempDirectory(),
          path.basename(filepath),
        );
        if (fs.existsSync(unzipDirectory)) fs.removeSync(unzipDirectory);
        decompress(filepath, unzipDirectory)
          .then(() => {
            addToFiles(
              fs.readdirSync(unzipDirectory).map((file) => {
                return {
                  path: path.join(unzipDirectory, file),
                };
              }),
            )
              .then(() => fs.removeSync(unzipDirectory))
              .catch((error) => {
                errorCatcher(error);
              })
              .finally(() => {
                filesLoading.value = false;
                dragging.value = false;
              });
          })
          .catch((error) => {
            errorCatcher(error);
            filesLoading.value = false;
            dragging.value = false;
          });
      } else {
        createTemporaryNotification({
          caption: filepath ? path.basename(filepath) : filepath,
          icon: 'mmm-local-media',
          message: t('filetypeNotSupported'),
          type: 'negative',
        });
      }
      filesLoading.value = false;
      dragging.value = false;
    } catch (error) {
      createTemporaryNotification({
        caption: filepath ? path.basename(filepath) : filepath,
        icon: 'mmm-error',
        message: t('fileProcessError'),
        type: 'negative',
      });
      errorCatcher(error);
    }
  }
};

const dropActive = (event: DragEvent) => {
  event.preventDefault();
  // event.stopPropagation();
  if (!event?.relatedTarget && event?.dataTransfer?.effectAllowed === 'all') {
    dragging.value = true;
  }
};
const dropEnd = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  try {
    if (event.dataTransfer?.files.length) {
      const droppedStuff = Array.from(event.dataTransfer.files).map((file) => {
        return {
          path: getLocalPathFromFileObject(file),
          type: file.type,
        };
      });
      let noLocalDroppedFiles =
        droppedStuff.filter((file) => file.path).length === 0;
      if (noLocalDroppedFiles && droppedStuff.length > 0) {
        let html = event.dataTransfer.getData('text/html');
        let sanitizedHtml = DOMPurify.sanitize(html);
        let src = new DOMParser()
          .parseFromString(sanitizedHtml, 'text/html')
          .querySelector('img')?.src;
        const type =
          Array.from(event.dataTransfer.items).find(
            (item) => item.kind === 'file',
          )?.type ?? '';
        if (src) droppedStuff[0] = { path: src, type };
      }
      addToFiles(droppedStuff).catch((error) => {
        errorCatcher(error);
      });
      // .then(() => {
      //   resetDragging();
      // });
    }
  } catch (error) {
    errorCatcher(error);
  }
};
// const dropIgnore = (event: DragEvent) => {
//   event.preventDefault();
//   event.stopPropagation();
// };

const resetDragging = () => {
  dragging.value = false;
  jwpubImportDb.value = '';
  jwpubImportDocuments.value = [];
};

const localFilesBrowsedListener = (event: CustomEventInit) => {
  addToFiles(event.detail).catch((error) => {
    errorCatcher(error);
  });
};

const remoteVideoLoading = (event: CustomEventInit) => {
  addToAdditionMediaMapFromPath(event.detail.path, undefined, {
    duration: event.detail.duration,
    song: event.detail.song,
    thumbnailUrl: event.detail.thumbnailUrl,
    title: event.detail.title,
    url: event.detail.url,
  });
};

onUnmounted(() => {
  window.removeEventListener('draggingSomething', startDragging);
  window.removeEventListener('localFiles-browsed', localFilesBrowsedListener);
  window.removeEventListener('remote-video-loading', remoteVideoLoading);
});
</script>
