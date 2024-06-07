<template>
  <q-page padding @dragover="dropActive" @dragenter="dropActive">
    <canvas style="display: none" ref="canvas"></canvas>

    <q-list ref="mediaList" class="shadow-2 rounded-borders">
      <q-banner inline-actions rounded class="bg-orange text-white" v-if="sortableMediaItems.length === 0">
        <template v-slot:avatar>
          <q-icon name="mdi-exclamation-thick" />
        </template>
        There are no media items for the selected date. Use the <strong>Import media</strong> menu to add some.
      </q-banner>

      <template v-else v-for="media in sortableMediaItems" :key="media.uniqueId">
        <q-item draggable="false" :class="'meeting-section meeting-section-' + media.section">
          <!-- <q-item-section horizontal class="q-pa-none"> -->
          <q-item-section side class="q-pr-none">
            <div class="rounded-borders bg-grey-9 text-white flex flex-center" style="width: 150px; height: 84px"
              v-if="media.isAudio">
              <q-icon name="mdi-music" size="lg" />
            </div>
            <q-img :ratio="16 / 9" :id="media.uniqueId" @load="media.isImage && initiatePanzoom(media.uniqueId)"
              width="150px" fit="contain" :src="media.thumbnailUrl" class="rounded-borders" v-else>
              <q-badge style="padding: 5px !important" v-if="media.isVideo" :color="customDurations[currentCongregation][selectedDate][
                media.uniqueId
              ] &&
                (customDurations[currentCongregation][selectedDate][
                  media.uniqueId
                ].min > 0 ||
                  customDurations[currentCongregation][selectedDate][
                    media.uniqueId
                  ].max < media.duration)
                ? 'negative'
                : 'black'
                " @click="showMediaDurationPopup(media)">
                <q-icon name="mdi-play" color="white" class="q-mr-xs" />
                {{
                  ((customDurations[currentCongregation][selectedDate][
                    media.uniqueId
                  ] &&
                    (customDurations[currentCongregation][selectedDate][
                      media.uniqueId
                    ].min > 0 ||
                      customDurations[currentCongregation][selectedDate][
                        media.uniqueId
                      ].max < media.duration) && formatTime(customDurations[currentCongregation][selectedDate][
                        media.uniqueId].min) + ' - ') || '') + formatTime(
                          (customDurations[currentCongregation][selectedDate][media.uniqueId] &&
                            customDurations[currentCongregation][selectedDate][media.uniqueId].max) || media.duration) }}
                  </q-badge>
                  <q-dialog persistent v-model="mediaDurationPopups[media.uniqueId]">
                    <q-card style="width: 300px">
                      <q-card-section>
                        <div class="text-h6">{{ media.title }}</div>
                      </q-card-section>
                      <q-card-section class="q-py-none" padding>
                        <p class="q-my-none">
                          Use the slider below to adjust the start and end time of
                          this media item.
                        </p>
                      </q-card-section>
                      <q-card-section horizontal class="q-pr-sm">
                        <q-card-section class="full-width q-pl-lg q-pt-none q-pb-lg">
                          <!-- {{ media.duration }} -->
                          <q-range class="q-pt-lg" v-model="customDurations[currentCongregation][selectedDate][
                            media.uniqueId
                          ]
                            " label label-always :min="0" :max="media.duration" :step="0" switch-label-side
                            :left-label-value="formatTime(
                              customDurations[currentCongregation][selectedDate][
                                media.uniqueId
                              ].min
                            )
                              " :right-label-value="formatTime(
                                customDurations[currentCongregation][selectedDate][
                                  media.uniqueId
                                ].max
                              )
                                " />
                        </q-card-section>
                        <q-card-section class="q-px-sm q-pt-lg">
                          <q-btn round color="negative" icon="fas fa-arrows-rotate" size="sm"
                            @click="resetMediaDuration(media)" />
                        </q-card-section>
                      </q-card-section>
                      <q-card-actions align="right">
                        <q-btn flat label="OK" color="primary" @click="mediaDurationPopups[media.uniqueId] = false" />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>
            </q-img>
          </q-item-section>
          <q-item-section side class="q-pl-xs" v-if="mediaPlayer.url === media.fileUrl && media.isImage">
            <div class="column">
              <div class="col">
                <q-btn size="xs" flat round color="primary" icon="mdi-magnify-plus" @click="zoomIn(media.uniqueId)">
                  <q-tooltip>Zoom in</q-tooltip>
                </q-btn>
              </div>
              <div class="col">
                <q-btn size="xs" flat round color="primary" icon="mdi-magnify-minus" @click="zoomOut(media.uniqueId)">
                  <q-tooltip>Zoom out</q-tooltip>
                </q-btn>
              </div>
              <!-- <div class="col">
                <q-btn size="xs" flat round color="primary" icon="mdi-refresh" @click="zoomReset(media.uniqueId, true)">
                  <q-tooltip>Reset image zoom</q-tooltip>
                </q-btn>
              </div> -->
              <div class="col" v-if="obsConnected">
                <q-btn size="xs" flat round color="negative" icon="mdi-grid-off" v-if="currentScene === 'media'"
                  @click="setObsScene('camera')">
                  <q-tooltip>Hide image for Zoom participants</q-tooltip>
                </q-btn>
                <q-btn size="xs" flat round color="positive" icon="mdi-grid" v-else @click="setObsScene('media')">
                  <q-tooltip>Show image for Zoom participants</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-item-section>
          <q-item-section class="q-px-sm" side v-if="media.paragraph">
            <q-chip square :clickable="false" icon="fas fa-paragraph" :label="media.paragraph" />
          </q-item-section>
          <q-item-section class="q-px-sm" side v-else-if="media.song">
            <q-chip square color="secondary" :clickable="false" icon="mdi-music-clef-treble"
              :label="media.song.toString()" />
          </q-item-section>
          <q-item-section class="q-px-sm">
            <div class="ellipsis-3-lines">
              {{ media.title || basename(media.fileUrl || '') }}
            </div>
          </q-item-section>
          <q-item-section side v-if="media.isAdditional">
            <q-btn round flat color="negative" icon="mdi-delete" @click="mediaToDelete = media.uniqueId" />
          </q-item-section>
          <q-item-section side>
            <div class="row">
              <div class="col" v-if="mediaPlayer.url !== media.fileUrl">
                <template v-if="!media.markers || media.markers.length === 0">
                  <q-btn round color="primary" icon="mdi-play" @click="
                    mediaPlayer.url = media.fileUrl;
                  mediaPlayer.uniqueId = media.uniqueId;
                  " :disable="mediaPlayer.url !== '' && isVideo(mediaPlayer.url)" />
                </template>
                <template v-else>
                  <q-btn push color="primary" label="Handles click">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item v-for="marker in media.markers" :key="marker.VideoMarkerId" clickable @click="
                        if (!customDurations[currentCongregation][selectedDate][media.uniqueId]) customDurations[currentCongregation][selectedDate][media.uniqueId] = {
                          min: 0,
                          max: media.duration
                        };
                          customDurations[currentCongregation][selectedDate][media.uniqueId].min = (marker.StartTimeTicks / 10000 / 1000);
                        customDurations[currentCongregation][selectedDate][media.uniqueId].max = (marker.StartTimeTicks + marker.DurationTicks - marker.EndTransitionDurationTicks) / 10000 / 1000;
                        mediaPlayer.action = 'play'; mediaPlayer.url = media.fileUrl;
                        mediaPlayer.uniqueId = media.uniqueId;
                        " :disable="mediaPlayer.url !== '' && isVideo(mediaPlayer.url)">
                          <q-item-section>{{ marker.Label }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                    <!-- <q-popup-proxy>
                      <q-card>
                        <q-card-section>
                          <q-markup-table dense>
                            <thead>
                              <tr>
                                <th class=" text-left">Start</th>
                          <th class="text-left">End</th>
                          <th class="text-left">Duration</th>
                          </tr>
                          </thead>
                          <tbody>
                            <tr v-for="marker in media.markers" :key="marker.DurationTicks">
                              <td class="text-left">{{ formatTime(marker.StartTimeTicks / 10000 / 1000) }}</td>
                              <td class="text-left">{{ formatTime((marker.StartTimeTicks + marker.DurationTicks) /
                                10000 / 1000)
                                }}</td>
                              <td class="text-left">{{ formatTime(marker.DurationTicks / 10000 / 1000) }}</td>
                            </tr>
                          </tbody>
                          </q-markup-table>
                          </q-card-section>
                          </q-card>
                          </q-popup-proxy> -->
                  </q-btn>

                </template>
              </div>
              <template v-else>
                <div class="col">
                  <!-- <transition name="fade" mode="out-in" appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut"> -->
                  <q-btn round color="warning" icon="mdi-play" @click="mediaPlayer.action = 'play'"
                    v-if="mediaPlayer.action === 'pause'" />
                  <q-btn round color="warning" icon="mdi-pause" v-else-if="mediaPlayer.action === 'play'"
                    @click="mediaPlayer.action = 'pause'" />
                  <!-- </transition> -->
                </div>
                <q-btn round color="negative" icon="mdi-stop" class="q-ml-sm"
                  v-if="mediaPlayer.action !== '' || mediaPlayer.action === ''" @click="
                    media.isVideo
                      ? (mediaToStop = media.uniqueId)
                      : stopMedia(media.uniqueId)
                    " />
              </template>
            </div>
          </q-item-section>
        </q-item>
        <q-item>
          <q-markup-table>
            <q-tr>
              <q-th>Start</q-th>
              <q-th>End</q-th>
              <q-th>Duration</q-th>
            </q-tr>
            <q-tr v-for="marker in media.markers" :key="marker.VideoMarkerId">
              <q-td>{{ formatTime(marker.StartTimeTicks / 10000 / 1000) }}</q-td>
              <q-td>{{ formatTime((marker.StartTimeTicks + marker.DurationTicks) / 10000 / 1000) }}</q-td>
              <q-td>{{ formatTime(marker.DurationTicks / 10000 / 1000) }}</q-td>
              <q-td>{{ marker.Label }}</q-td>
            </q-tr>
          </q-markup-table>
        </q-item>
        <transition name="fade" mode="out-in" appear enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut">
          <q-item class="q-pa-none" v-if="
            mediaPlayer.url === media.fileUrl &&
            (media.isVideo || media.isAudio)
          ">
            <q-item-section>
              <q-slider :disable="mediaPlayer.action !== 'pause'" :step="0" v-model="mediaPlayer.currentPosition"
                :min="0" :max="media.duration" />
            </q-item-section>
          </q-item>
        </transition>
      </template>
      <q-inner-loading :showing="!selectedDateObject ||
        selectedDateObject?.loading
        " />
    </q-list>
    <q-dialog persistent v-model="mediaStopPending">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="mdi-alert" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to stop the video?</span>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="mediaToStop = ''" />
          <q-btn flat label="Stop" @click="stopMedia(mediaToStop)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog persistent v-model="mediaDeletePending">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="mdi-alert" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete
            <strong>{{
              sortableMediaItems.find((m) => m.uniqueId === mediaToDelete)
                ?.title
            }}</strong>?</span>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="mediaToDelete = ''" />
          <q-btn flat label="Delete" @click="deleteMedia()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
  <q-dialog v-model="jwpubImportInProgress">
    <q-spinner-hourglass v-if="jwpubImportLoading" size="10vh" color="white" />
    <template v-if="!jwpubImportLoading">
      <q-card>
        <q-card-section class="row items-center">
          <q-list>
            <q-item v-for="jwpubImportDocument in jwpubImportDocuments" :key="jwpubImportDocument.DocumentId" clickable
              @click="addJwpubDocumentMediaToFiles(jwpubImportDocument)">
              <q-item-section>
                {{ jwpubImportDocument.Title }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </template>
  </q-dialog>
  <q-dialog v-model="dragging" @drop="dropIgnore">
    <q-card @drop="dropEnd">
      <q-card-section>
        <div class="text-h6">Drop area</div>
      </q-card-section>

      <q-card-section class="q-pt-none"> Drop here! </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- <embed ref="pdfObject" type="application/pdf" width="500px" height="600px"> -->
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { storeToRefs } from 'pinia';

import {
  convertHeicToJpg,
  convertSvgToJpg,
  decompressJwpub,
  findDb,
  isArchive,
  isHeic,
  isImage,
  isImageString,
  isJwPlaylist,
  isJwpub,
  isPdf,
  isRemoteUrl,
  isSvg,
  isVideo,
  getMediaFromJwPlaylist,
  formatTime,
  isAudio,
} from 'src/helpers/mediaPlayback';

import { useCurrentStateStore } from 'stores/current-state';
const currentState = useCurrentStateStore();
const {
  mediaPlayer,
  selectedDate,
  lookupPeriod,
  currentCongregation,
  mediaPlaying,
  getDatedAdditionalMediaDirectory,
  selectedDateObject
} = storeToRefs(currentState);

import { useJwStore } from 'stores/jw';
const jwStore = useJwStore();
const { updateJwSongs, removeFromAdditionMediaMap, addToAdditionMediaMap } =
  jwStore;
const { mediaSort, additionalMediaMaps, customDurations } =
  storeToRefs(jwStore);

import { useObsStateStore } from 'stores/obs-state';
const obsState = useObsStateStore();
const { currentScene, obsConnected } = storeToRefs(obsState);

updateJwSongs();

import { date, uid } from 'quasar';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import {
  addFullFilePathToMultimediaItem,
  downloadFile,
  dynamicMediaMapper,
  fetchMedia,
  getDocumentMultimediaItems,
  getPublicationInfoFromDb,
  processMissingMediaInfo,
  sanitizeId,
} from 'src/helpers/jw-media';

const panzooms: { [key: string]: PanzoomObject } = {};

const mediaToStop = ref('');
const mediaStopPending = computed(() => {
  return !!mediaToStop.value;
});

const mediaToDelete = ref('');
const mediaDeletePending = computed(() => {
  return !!mediaToDelete.value;
});

import { electronApi } from 'src/helpers/electron-api';
const { path, fs, decompress, executeQuery } = electronApi;

import { animations } from '@formkit/drag-and-drop';
import { dragAndDrop } from '@formkit/drag-and-drop/vue';
import { DynamicMediaObject } from 'src/types/media';

const zoomReset = (elemId: string, forced = false) => {
  if (panzooms[elemId]?.getScale() <= 1.25 || forced) panzooms[elemId]?.reset();
};
function stopMedia(elemId: string) {
  zoomReset(elemId, true);
  mediaPlayer.value.action = 'stop';
  mediaPlayer.value.url = '';
  mediaPlayer.value.uniqueId = '';
  mediaPlayer.value.action = '';
  mediaPlayer.value.currentPosition = 0;
  mediaToStop.value = '';
}

function zoomIn(elemId: string) {
  panzooms[elemId].zoomIn();
}

function zoomOut(elemId: string) {
  panzooms[elemId].zoomOut();
  zoomReset(elemId);
}

const initiatePanzoom = (elemId: string) => {
  const elem = document.getElementById(elemId);
  const width = elem?.clientWidth || 0;
  const height = elem?.clientHeight || 0;
  if (!elem) return;
  panzooms[elemId] = Panzoom(elem, {
    minScale: 1,
    maxScale: 5,
    animate: true,
    // contain: 'outside',
    panOnlyWhenZoomed: true,
  });

  elem.addEventListener('panzoomend', () => {
    zoomReset(elemId);
  });
  // elem.addEventListener('wheel', (e) => {
  //   panzooms[elemId].zoomWithWheel(e)
  //   resetZoom(elemId)
  // })
  elem.addEventListener(
    'panzoomchange',
    (e: HTMLElementEventMap['panzoomchange']) => {
      mediaPlayer.value.scale = e.detail.scale;
      if (width > 0) mediaPlayer.value.x = e.detail.x / width;
      if (height > 0) mediaPlayer.value.y = e.detail.y / height;
    }
  );
};

import type { DNDPlugin } from '@formkit/drag-and-drop';
import {
  parents,
  multiDrag,
  selections,
  updateConfig,
} from '@formkit/drag-and-drop';
import {
  getTempDirectory,
  getFileUrl,
  getThumbnailUrl,
  getDurationFromMediaPath,
} from 'src/helpers/fs';
import { DocumentItem, TableItem } from 'src/types/sqlite';
import { createTemporaryNotification } from 'src/helpers/notifications';

const dragging = ref(false);

const jwpubImportDb = ref('');
const jwpubImportInProgress = computed(() => {
  return !!jwpubImportDb.value;
});
const jwpubImportLoading = ref(false);
const jwpubImportDocuments = ref([] as DocumentItem[]);

const canvas = ref();
import { Buffer } from 'buffer';
import mime from 'mime';

import { setObsScene } from 'src/helpers/obs';
// const selectedDateObject = ref(lookupPeriod.value[0])

export default defineComponent({
  setup() {
    const mediaList = ref();
    const sortableMediaItems = ref([] as DynamicMediaObject[]);
    const datedAdditionalMediaMap = computed(() => {
      if (!currentCongregation.value || !selectedDate.value) return [];
      return (
        additionalMediaMaps.value[currentCongregation.value]?.[
        selectedDate.value
        ] || []
      );
    });

    function deleteMedia() {
      if (!mediaToDelete.value) return;
      removeFromAdditionMediaMap(mediaToDelete.value);
      mediaToDelete.value = '';
    }

    const mapOrder =
      (sortOrder: string | string[] | undefined) =>
        (a: DynamicMediaObject, b: DynamicMediaObject) => {
          // if (!mediaSort.value[currentCongregation.value]) mediaSort.value[currentCongregation.value] = {}
          // const sortOrder = mediaSort.value[currentCongregation.value][selectedDate.value]
          const key = 'uniqueId';
          if (!sortOrder) return 0;
          return sortOrder.indexOf(a[key]) > sortOrder.indexOf(b[key]) ? 1 : -1;
        };
    const mediaItems = computed(() => {
      return datedAdditionalMediaMap.value
        .concat(selectedDateObject.value?.dynamicMedia)
        .filter((mediaItem) => mediaItem.fileUrl) as DynamicMediaObject[]
    });
    watch(mediaItems, (newValue) => {
      if (newValue)
        if (!mediaSort.value[currentCongregation.value]) mediaSort.value[currentCongregation.value] = {};
      sortableMediaItems.value = newValue.sort(
        mapOrder(
          mediaSort.value[currentCongregation.value][selectedDate.value]
        )
      );
    });
    watch(
      mediaSort,
      (newVal) => {
        if (
          newVal[currentCongregation.value][selectedDate.value]?.length === 0
        ) {
          newVal[currentCongregation.value][selectedDate.value] =
            datedAdditionalMediaMap.value
              .concat(selectedDateObject.value?.dynamicMedia)
              .filter((mediaItem) => mediaItem.fileUrl)
              .map((item: DynamicMediaObject) => item.uniqueId);
        }
        sortableMediaItems.value.sort(
          mapOrder(newVal[currentCongregation.value][selectedDate.value])
        );
      },
      { deep: true }
    );

    const updateMediaSortPlugin: DNDPlugin = (parent) => {
      const parentData = parents.get(parent);
      if (!parentData) return;
      function dragend() {
        if (!mediaSort.value[currentCongregation.value])
          mediaSort.value[currentCongregation.value] = {};
        mediaSort.value[currentCongregation.value][selectedDate.value] =
          sortableMediaItems.value.map(
            (item: DynamicMediaObject) => item.uniqueId
          );
      }
      return {
        setupNode(data) {
          data.node.addEventListener('dragend', dragend);
        },
        tearDownNode(data) {
          data.node.removeEventListener('dragend', dragend);
        },
      };
    };

    dragAndDrop({
      parent: mediaList,
      values: sortableMediaItems,
      plugins: [
        updateMediaSortPlugin,
        animations(),
        multiDrag({
          plugins: [
            selections({
              selectedClass: 'bg-blue-2 text-grey-10',
            }),
          ],
        }),
      ],
    });

    watch(mediaPlaying, (newValue) => {
      setObsScene(!newValue ? 'camera' : 'media');
      updateConfig(mediaList.value, { disabled: !!newValue });
    });
    onMounted(() => {
      watch(selectedDate, (newVal) => {
        console.log('selectedDate changed', newVal)
        if (!currentCongregation.value) return;
        if (!customDurations.value[currentCongregation.value])
          customDurations.value[currentCongregation.value] = {};
        if (!customDurations.value[currentCongregation.value][selectedDate.value])
          customDurations.value[currentCongregation.value][newVal] = {};
      });

      selectedDate.value = date.formatDate(
        lookupPeriod.value
          .filter((day) => day.meeting)
          .map((day) => day.date)[0],
        'YYYY/MM/DD'
      );
      fetchMedia();
      setObsScene('camera');
    });
    onUnmounted(() => {
      Object.keys(panzooms).forEach((key) => {
        panzooms[key].destroy();
      });
    });

    function inferExtension(filename: string, filetype?: string) {
      if (!filetype) return filename;
      const extension = mime.extension(filetype);
      if (!extension) {
        console.warn(
          'Could not determine the file extension from the provided file type'
        );
        return filename;
      }
      const hasExtension = /\.[0-9a-z]+$/i.test(filename);
      if (hasExtension) {
        return filename;
      }
      return `${filename}.${extension}`;
    }

    const addToFiles = async (
      files: FileList | { path: string; filetype?: string }[]
    ) => {
      if (!files) return;
      for (let i = 0; i < files.length; i++) {
        let filepath = files[i].path;
        try {
          console.log('file', files[i]);

          // Check if file is remote URL; if so, download it
          if (isRemoteUrl(filepath)) {
            const baseFileName = path.basename(new URL(filepath).pathname);
            filepath = (
              await downloadFile({
                url: filepath,
                dir: getTempDirectory(),
                filename: inferExtension(
                  baseFileName,
                  (files[i] as { filetype?: string }).filetype
                ),
              })
            ).path;
            console.log('filepath', filepath);
          } else if (isImageString(filepath)) {
            const [preamble, data] = filepath.split(';base64,');
            const ext = preamble.split('/')[1];
            const tempFilename = uid() + '.' + ext;
            const tempFilepath = path.join(getTempDirectory(), tempFilename);
            fs.writeFileSync(tempFilepath, Buffer.from(data, 'base64'));
            filepath = tempFilepath;
          }

          // Check if file is HEIC or SVG first; if so, convert to JPG
          if (isHeic(filepath)) {
            filepath = await convertHeicToJpg(filepath);
          } else if (isSvg(filepath)) {
            filepath = await convertSvgToJpg(filepath, canvas);
          }
          if (isImage(filepath) || isVideo(filepath) || isAudio(filepath)) {
            copyToDatedAdditionalMedia([filepath]);
          } else if (isPdf(filepath)) {
            createTemporaryNotification({
              message: 'PDF files are not supported yet',
              type: 'warning',
              icon: 'mdi-file-pdf-box',
            });
            // todo: eventually support PDF import
          } else if (isJwpub(filepath)) {
            jwpubImportLoading.value = true;
            const unzipDir = await decompressJwpub(filepath);
            const db = findDb(unzipDir);
            if (!db) return;
            jwpubImportDb.value = db;
            if (executeQuery(db, 'SELECT * FROM Multimedia;').length === 0) {
              createTemporaryNotification({
                message: 'The JWPUB file does not contain any multimedia',
                caption: path.basename(filepath),
                type: 'warning',
                icon: 'mdi-multimedia',
              });
              jwpubImportDb.value = '';
            } else {
              const documentMultimediaTableExists =
                (
                  executeQuery(
                    db,
                    'PRAGMA table_info(DocumentMultimedia);'
                  ) as TableItem[]
                ).length > 0;
              const mmTable = documentMultimediaTableExists
                ? 'DocumentMultimedia'
                : 'Multimedia';
              jwpubImportDocuments.value = executeQuery(
                db,
                `SELECT DISTINCT Document.DocumentId, Title FROM Document JOIN ${mmTable} ON Document.DocumentId = ${mmTable}.DocumentId;`
              ) as DocumentItem[];
              // } else {
            }
            jwpubImportLoading.value = false;
          } else if (isJwPlaylist(filepath)) {
            const additionalMedia = await getMediaFromJwPlaylist(filepath, selectedDateObject.value?.date, getDatedAdditionalMediaDirectory.value);
            addToAdditionMediaMap(additionalMedia);
          } else if (isArchive(filepath)) {
            const unzipDirectory = path.join(
              getTempDirectory(),
              path.basename(filepath)
            );
            if (fs.existsSync(unzipDirectory)) fs.removeSync(unzipDirectory);
            await decompress(filepath, unzipDirectory);
            await addToFiles(
              fs.readdirSync(unzipDirectory).map((file) => {
                return {
                  path: path.join(unzipDirectory, file),
                };
              })
            );
            fs.removeSync(unzipDirectory);
          } else {
            createTemporaryNotification({
              message: 'This file type is not yet supported',
              caption: path.basename(filepath),
              type: 'error',
              icon: 'mdi-file',
            });
          }
        } catch (error) {
          createTemporaryNotification({
            message: 'Failed to process this file',
            caption: path.basename(filepath),
            type: 'error',
            icon: 'mdi-file',
          });
        }
      }
    };

    const addJwpubDocumentMediaToFiles = async (document: DocumentItem) => {
      jwpubImportDocuments.value = [];
      jwpubImportLoading.value = true;
      const publication = getPublicationInfoFromDb(jwpubImportDb.value);
      let multimediaItems = getDocumentMultimediaItems({
        db: jwpubImportDb.value,
        docId: document.DocumentId,
      }).map((multimediaItem) =>
        addFullFilePathToMultimediaItem(multimediaItem, publication)
      );
      await processMissingMediaInfo(multimediaItems);
      const dynamicMediaItems = await dynamicMediaMapper(
        multimediaItems,
        selectedDateObject.value?.date
      );
      addToAdditionMediaMap(dynamicMediaItems);
      jwpubImportDb.value = '';
      jwpubImportLoading.value = false;
    };

    const copyToDatedAdditionalMedia = async (files: string[]) => {
      fs.ensureDirSync(getDatedAdditionalMediaDirectory.value);
      for (const filepath of files) {
        const datedAdditionalMediaPath = path.join(
          getDatedAdditionalMediaDirectory.value,
          path.basename(filepath)
        );
        try {
          if (fs.existsSync(datedAdditionalMediaPath))
            fs.removeSync(datedAdditionalMediaPath);
          fs.copySync(filepath, datedAdditionalMediaPath);
          const video = isVideo(datedAdditionalMediaPath);
          const audio = isAudio(datedAdditionalMediaPath);
          let duration = 0;
          if (video || audio) {
            duration = await getDurationFromMediaPath(datedAdditionalMediaPath);
          }
          addToAdditionMediaMap([
            {
              fileUrl: getFileUrl(datedAdditionalMediaPath),
              thumbnailUrl: await getThumbnailUrl(datedAdditionalMediaPath),
              uniqueId: sanitizeId(
                date.formatDate(selectedDate.value, 'YYYYMMDD') +
                '-' +
                getFileUrl(datedAdditionalMediaPath)
              ),
              title: path.basename(datedAdditionalMediaPath),
              isImage: isImage(datedAdditionalMediaPath),
              isVideo: video,
              isAudio: audio,
              duration: duration,
              isAdditional: true,
              section: 'additional',
            },
          ]);
        } catch (error) {
          console.error(error, filepath, datedAdditionalMediaPath);
        }
      }
    };

    const dropActive = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!event.relatedTarget && event.dataTransfer?.effectAllowed === 'all') {
        dragging.value = true;
      }
    };
    const dropEnd = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer?.files.length) {
        const droppedStuff = Array.from(event.dataTransfer.files) as {
          path: string;
          filetype?: string;
        }[];
        let noLocalDroppedFiles =
          droppedStuff.filter((file) => file.path).length === 0;
        if (noLocalDroppedFiles && droppedStuff.length > 0) {
          // maybe its a drag and drop from a web browser?
          let html = event.dataTransfer.getData('text/html');
          let src = new DOMParser()
            .parseFromString(html, 'text/html')
            .querySelector('img')?.src;
          const filetype = Array.from(event.dataTransfer.items).find(
            (item) => item.kind === 'file'
          )?.type;
          if (src) droppedStuff[0] = { path: src, filetype };
        }
        addToFiles(droppedStuff);
      }
      dragging.value = false;
    };
    const dropIgnore = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const mediaDurationPopups = ref({} as { [key: string]: boolean });

    return {
      mediaPlayer,
      isVideo,
      initiatePanzoom,
      stopMedia,
      zoomIn,
      zoomOut,
      zoomReset,
      mediaToStop,
      mediaStopPending,
      mediaDeletePending,
      mediaToDelete,
      deleteMedia,
      basename: path.basename,
      mediaList,
      sortableMediaItems,
      selectedDateObject,
      dropActive,
      dropEnd,
      dropIgnore,
      dragging,
      selectedDate,
      mediaItems,
      jwpubImportInProgress,
      jwpubImportLoading,
      jwpubImportDocuments,
      addJwpubDocumentMediaToFiles,
      jwpubImportDb,
      // pdfObject
      canvas,
      mediaDurationPopups,
      customDurations,
      currentCongregation,
      showMediaDurationPopup: (media: DynamicMediaObject) => {
        if (!currentCongregation.value) return;
        if (!customDurations.value[currentCongregation.value])
          customDurations.value[currentCongregation.value] = {};
        if (
          !customDurations.value[currentCongregation.value][selectedDate.value]
        )
          customDurations.value[currentCongregation.value][selectedDate.value] =
            {};
        if (
          !customDurations.value[currentCongregation.value][selectedDate.value][
          media.uniqueId
          ]
        ) {
          customDurations.value[currentCongregation.value][selectedDate.value][
            media.uniqueId
          ] = {
            min: 0,
            max: media.duration,
          };
        }
        mediaDurationPopups.value[media.uniqueId] = true;
      },
      formatTime,
      resetMediaDuration: (media: DynamicMediaObject) => {
        customDurations.value[currentCongregation.value][selectedDate.value][
          media.uniqueId
        ] = {
          min: 0,
          max: media.duration,
        };
      },
      setObsScene,
      currentScene,
      obsConnected,
    };
  },
});
</script>

<style scoped>
.meeting-section {
  border-left: 10px solid;
}

.meeting-section-tgw {
  border-color: rgb(60, 127, 139);
}

.meeting-section-ayfm {
  border-color: rgb(214, 143, 0);
}

.meeting-section-lac {
  border-color: rgb(191, 47, 19);
}

.meeting-section-wt {
  border-color: rgb(214, 143, 0);
}

.meeting-section-additional {
  border-color: rgb(91, 60, 136);
}
</style>
