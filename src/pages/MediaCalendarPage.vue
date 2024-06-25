<template>
  <q-page @dragenter="dropActive" @dragover="dropActive" padding>
    <q-banner
      class="bg-orange-9 text-white"
      inline-actions
      rounded
      v-if="!selectedDate"
    >
      <template v-slot:avatar>
        <q-icon name="mdi-exclamation-thick" />
      </template>
      {{ $t('noDateSelected') }}
    </q-banner>
    <q-list
      class="shadow-2 rounded-borders"
      ref="mediaList"
      v-else-if="selectedDate && currentCongregation"
    >
      <template v-if="additionalLoading">
        <q-item class="meeting-section meeting-section-skeleton">
          <q-item-section avatar class="q-pr-none">
            <q-skeleton style="width: 150px; height: 84px" />
          </q-item-section>
          <q-item-section class="q-pl-md">
            <q-item-label>
              <q-skeleton type="text" />
            </q-item-label>
            <q-item-label caption>
              <q-skeleton type="text" />
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-skeleton type="circle" />
          </q-item-section>
        </q-item>
      </template>
      <q-banner
        class="bg-orange-9 text-white"
        inline-actions
        rounded
        v-if="sortableMediaItems.length === 0 && !selectedDateObject.loading"
      >
        <template v-slot:avatar>
          <q-icon name="mdi-exclamation-thick" />
        </template>
        {{ $t('noMedia') }}
      </q-banner>
      <template v-else-if="selectedDateObject.loading">
        <template :key="i" v-for="i in 5">
          <q-item class="meeting-section meeting-section-skeleton">
            <q-item-section avatar class="q-pr-none">
              <q-skeleton style="width: 150px; height: 84px" />
            </q-item-section>
            <q-item-section class="q-px-sm" side v-if="i % 2 !== 0">
              <q-skeleton style="width: 70px" type="QChip" />
            </q-item-section>
            <q-item-section class="q-pl-md">
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" />
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-skeleton type="circle" />
            </q-item-section>
          </q-item>
        </template>
        <q-inner-loading
          :label="$t('please-wait-downloading-media-for-this-day')"
        />
      </template>
      <template
        :key="media.uniqueId"
        v-else
        v-for="(media, index) in sortableMediaItems"
      >
        <q-item
          :class="
            'meeting-section meeting-section-' +
            media.section +
            ' ' +
            (index === 0 ||
            media.section !== sortableMediaItems[index - 1]?.section
              ? 'meeting-section-begin meeting-section-begin-' + media.section
              : '') +
            ' ' +
            (index !== sortableMediaItems.length &&
            media.section !== sortableMediaItems[index + 1]?.section
              ? 'meeting-section-end meeting-section-end-' + media.section
              : '')
          "
          draggable="false"
        >
          <q-item-section class="q-pr-none" side>
            <div
              class="rounded-borders bg-grey-9 text-white flex flex-center"
              style="width: 150px; height: 84px"
              v-if="media.isAudio"
            >
              <q-icon name="mdi-music" size="lg" />
            </div>
            <q-img
              :id="media.uniqueId"
              :ratio="16 / 9"
              :src="media.thumbnailUrl"
              @error="imageLoadingError(media)"
              @load="media.isImage && initiatePanzoom(media.uniqueId)"
              class="rounded-borders"
              fit="contain"
              v-else
              width="150px"
            >
              <q-badge
                :color="
                  customDurations[currentCongregation]?.[selectedDate]?.[
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
                "
                @click="showMediaDurationPopup(media)"
                style="padding: 5px !important"
                v-if="media.isVideo"
              >
                <q-icon class="q-mr-xs" color="white" name="mdi-play" />
                {{
                  customDurations[currentCongregation]?.[selectedDate]?.[
                    media.uniqueId
                  ] &&
                  (customDurations[currentCongregation][selectedDate][
                    media.uniqueId
                  ].min > 0 ||
                    customDurations[currentCongregation][selectedDate][
                      media.uniqueId
                    ].max < media.duration)
                    ? formatTime(
                        customDurations[currentCongregation][selectedDate][
                          media.uniqueId
                        ].min,
                      ) + ' - '
                    : ''
                }}
                {{
                  formatTime(
                    customDurations[currentCongregation]?.[selectedDate]?.[
                      media.uniqueId
                    ]?.max ?? media.duration,
                  )
                }}
              </q-badge>
              <q-dialog
                persistent
                v-model="mediaDurationPopups[media.uniqueId]"
              >
                <q-card style="width: 300px">
                  <q-card-section>
                    <div class="text-h6">{{ media.title }}</div>
                  </q-card-section>
                  <q-card-section class="q-py-none" padding>
                    <p class="q-my-none">
                      {{
                        $t(
                          'use-the-slider-below-to-adjust-the-start-and-end-time-of-this-media-item',
                        )
                      }}
                    </p>
                  </q-card-section>
                  <q-card-section class="q-pr-sm" horizontal>
                    <q-card-section
                      class="full-width q-pl-lg q-pt-none q-pb-lg"
                    >
                      <!-- {{ media.duration }} -->
                      <q-range
                        :left-label-value="
                          formatTime(
                            customDurations[currentCongregation]?.[
                              selectedDate
                            ]?.[media.uniqueId]?.min,
                          )
                        "
                        :max="media.duration"
                        :min="0"
                        :right-label-value="
                          formatTime(
                            customDurations[currentCongregation]?.[
                              selectedDate
                            ]?.[media.uniqueId]?.max,
                          )
                        "
                        :step="0"
                        class="q-pt-lg"
                        label
                        label-always
                        switch-label-side
                        v-model="
                          customDurations[currentCongregation][selectedDate][
                            media.uniqueId
                          ]
                        "
                      />
                    </q-card-section>
                    <q-card-section class="q-px-sm q-pt-lg">
                      <q-btn
                        :label="$t('videoTimeReset')"
                        @click="resetMediaDuration(media)"
                        color="negative"
                        round
                        size="sm"
                      />
                    </q-card-section>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn
                      :label="$t('videoTimeSave')"
                      @click="mediaDurationPopups[media.uniqueId] = false"
                      color="primary"
                      flat
                    />
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </q-img>
          </q-item-section>
          <q-item-section
            class="q-pl-xs"
            side
            v-if="mediaPlayer.url === media.fileUrl && media.isImage"
          >
            <div class="column">
              <div class="col">
                <q-btn
                  @click="zoomIn(media.uniqueId)"
                  color="primary"
                  flat
                  icon="mdi-magnify-plus"
                  round
                  size="xs"
                >
                  <q-tooltip>{{ $t('zoom-in') }}</q-tooltip>
                </q-btn>
              </div>
              <div class="col">
                <q-btn
                  @click="zoomOut(media.uniqueId)"
                  color="primary"
                  flat
                  icon="mdi-magnify-minus"
                  round
                  size="xs"
                >
                  <q-tooltip>{{ $t('zoom-out') }}</q-tooltip>
                </q-btn>
              </div>
              <!-- <div class="col">
                <q-btn size="xs" flat round color="primary" icon="mdi-refresh" @click="zoomReset(media.uniqueId, true)">
                  <q-tooltip>Reset image zoom</q-tooltip>
                </q-btn>
              </div> -->
              <div class="col" v-if="obsConnectionState === 'connected'">
                <q-btn
                  @click="sendObsSceneEvent('camera')"
                  color="negative"
                  flat
                  icon="mdi-grid-off"
                  round
                  size="xs"
                  v-if="currentScene === 'media'"
                >
                  <q-tooltip>{{
                    $t('hide-image-for-zoom-participants')
                  }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click="sendObsSceneEvent('media')"
                  color="positive"
                  flat
                  icon="mdi-grid"
                  round
                  size="xs"
                  v-else
                >
                  <q-tooltip>{{
                    $t('show-image-for-zoom-participants')
                  }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-item-section>
          <q-item-section class="q-pl-lg q-pr-none" side v-if="media.paragraph">
            <q-chip
              :clickable="false"
              :icon="
                media.paragraph !== 9999
                  ? 'fas fa-paragraph'
                  : 'mdi-asterisk-circle-outline'
              "
              :label="
                media.paragraph !== 9999 ? media.paragraph : $t('footnote')
              "
              square
            />
          </q-item-section>
          <q-item-section class="q-pl-lg q-pr-none" side v-else-if="media.song">
            <q-chip
              :clickable="false"
              :label="media.song.toString()"
              color="secondary"
              icon="mdi-music-clef-treble"
              square
            />
          </q-item-section>
          <q-item-section class="q-px-lg">
            <div class="ellipsis-3-lines">
              {{
                media.title ||
                (media.fileUrl ? path.basename(media.fileUrl) : '')
              }}
            </div>
          </q-item-section>
          <q-item-section side v-if="media.isAdditional">
            <q-btn
              @click="mediaToDelete = media.uniqueId"
              color="negative"
              flat
              icon="mdi-delete"
              round
            />
          </q-item-section>
          <q-item-section side>
            <div class="row">
              <div class="col" v-if="mediaPlayer.url !== media.fileUrl">
                <template v-if="!media.markers || media.markers.length === 0">
                  <q-btn
                    :disable="
                      mediaPlayer.url !== '' && isVideo(mediaPlayer.url)
                    "
                    @click="
                      mediaPlayer.url = media.fileUrl;
                      mediaPlayer.uniqueId = media.uniqueId;
                      mediaPlayer.subtitlesUrl = media.subtitlesUrl ?? '';
                    "
                    color="primary"
                    icon="mdi-play"
                    round
                  />
                </template>
                <template v-else>
                  <q-btn
                    :disable="
                      mediaPlayer.url !== '' && isVideo(mediaPlayer.url)
                    "
                    color="primary"
                    icon="mdi-play-box-multiple"
                    push
                    round
                  >
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item
                          @click="
                            customDurations[currentCongregation] ??= {};
                            customDurations[currentCongregation][
                              selectedDate
                            ] ??= {};
                            customDurations[currentCongregation][selectedDate][
                              media.uniqueId
                            ] = {
                              min: 0,
                              max: media.duration,
                            };
                            mediaPlayer.action = 'play';
                            mediaPlayer.url = media.fileUrl;
                            mediaPlayer.uniqueId = media.uniqueId;
                            mediaPlayer.subtitlesUrl = media.subtitlesUrl ?? '';
                          "
                          clickable
                        >
                          <q-item-section>{{
                            $t('entireFile')
                          }}</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item
                          :key="marker.VideoMarkerId"
                          @click="
                            customDurations[currentCongregation] ??= {};
                            customDurations[currentCongregation][
                              selectedDate
                            ] ??= {};
                            customDurations[currentCongregation][selectedDate][
                              media.uniqueId
                            ].min = marker.StartTimeTicks / 10000 / 1000;
                            customDurations[currentCongregation][selectedDate][
                              media.uniqueId
                            ].max =
                              (marker.StartTimeTicks +
                                marker.DurationTicks -
                                marker.EndTransitionDurationTicks) /
                              10000 /
                              1000;
                            mediaPlayer.action = 'play';
                            mediaPlayer.url = media.fileUrl;
                            mediaPlayer.uniqueId = media.uniqueId;
                            mediaPlayer.subtitlesUrl = media.subtitlesUrl ?? '';
                          "
                          clickable
                          v-for="marker in media.markers"
                        >
                          <q-item-section>{{ marker.Label }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </template>
              </div>
              <template v-else>
                <div class="col">
                  <!-- <transition name="fade" mode="out-in" appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut"> -->
                  <q-btn
                    @click="mediaPlayer.action = 'play'"
                    color="warning"
                    icon="mdi-play"
                    round
                    v-if="mediaPlayer.action === 'pause'"
                  />
                  <q-btn
                    @click="
                      mediaPlayer.action = 'pause';
                      mediaPlayer.seekTo = mediaPlayer.currentPosition;
                    "
                    color="warning"
                    icon="mdi-pause"
                    round
                    v-else-if="
                      media.isVideo &&
                      (mediaPlayer.action === 'play' || !mediaPlayer.action)
                    "
                  />
                  <!-- </transition> -->
                </div>
                <q-btn
                  @click="
                    media.isVideo
                      ? (mediaToStop = media.uniqueId)
                      : stopMedia(media.uniqueId)
                  "
                  class="q-ml-sm"
                  color="negative"
                  icon="mdi-stop"
                  round
                  v-if="mediaPlayer.action !== '' || mediaPlayer.action === ''"
                />
              </template>
            </div>
          </q-item-section>
        </q-item>
        <!-- <q-item v-if="media.markers && media.markers.length > 0">
          <q-markup-table>
            <q-tr>
              <q-th>Start</q-th>
              <q-th>End</q-th>
              <q-th>Duration</q-th>
            </q-tr>
            <q-tr :key="marker.VideoMarkerId" v-for="marker in media.markers">
              <q-td>{{
                formatTime(marker.StartTimeTicks / 10000 / 1000)
              }}</q-td>
              <q-td>{{
                formatTime(
                  (marker.StartTimeTicks + marker.DurationTicks) / 10000 / 1000,
                )
              }}</q-td>
              <q-td>{{ formatTime(marker.DurationTicks / 10000 / 1000) }}</q-td>
              <q-td>{{ marker.Label }}</q-td>
            </q-tr>
          </q-markup-table>
        </q-item> -->
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
          name="fade"
        >
          <q-item
            class="q-pa-none"
            v-if="
              mediaPlayer.url === media.fileUrl &&
              (media.isVideo || media.isAudio)
            "
          >
            <q-item-section>
              <q-slider
                :max="media.duration"
                :min="0"
                :step="0"
                v-if="mediaPlayer.action === 'pause'"
                v-model="mediaPlayer.seekTo"
              />
              <q-slider
                :max="media.duration"
                :min="0"
                :step="0"
                disabled
                v-else
                v-model="mediaPlayer.currentPosition"
              />
            </q-item-section>
          </q-item>
        </transition>
      </template>
      <!-- <q-inner-loading
        :label="$t('please-wait-downloading-media-for-this-day')"
        :showing="!selectedDateObject || selectedDateObject?.loading"
      /> -->
    </q-list>
    <q-dialog persistent v-model="mediaStopPending">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar color="negative" icon="mdi-alert" text-color="white" />
          <span class="q-ml-sm">{{ $t('sureStopVideo') }}</span>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn :label="$t('cancel')" @click="mediaToStop = ''" flat />
          <q-btn :label="$t('stop')" @click="stopMedia(mediaToStop)" flat />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog persistent v-model="mediaDeletePending">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar color="negative" icon="mdi-alert" text-color="white" />
          <span class="q-ml-sm"
            >{{ $t('are-you-sure-you-want-to-delete') }}
            <strong>{{
              sortableMediaItems.find((m) => m.uniqueId === mediaToDelete)
                ?.title
            }}</strong
            >{{ $t('question-mark') }}</span
          >
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn :label="$t('cancel')" @click="mediaToDelete = ''" flat />
          <q-btn :label="$t('delete')" @click="deleteMedia()" flat />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
  <q-dialog v-model="jwpubImportInProgress">
    <q-spinner-hourglass color="white" size="10vh" v-if="jwpubImportLoading" />
    <template v-if="!jwpubImportLoading">
      <q-card>
        <q-card-section class="row items-center">
          <q-list>
            <q-item
              :key="jwpubImportDocument.DocumentId"
              @click="addJwpubDocumentMediaToFiles(jwpubImportDocument)"
              clickable
              v-for="jwpubImportDocument in jwpubImportDocuments"
            >
              <q-item-section>
                {{ jwpubImportDocument.Title }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </template>
  </q-dialog>
  <q-dialog @drop="dropEnd" v-model="dragging">
    <q-card @drop="dropEnd">
      <q-card-section horizontal>
        <q-card-section>
          <q-icon
            color="primary"
            name="mdi-cursor-default"
            size="lg"
            text-color="white"
        /></q-card-section>
        <q-card-section>
          <div class="text-h6">{{ $t('add-media-files') }}</div>
          <p>
            {{
              $t(
                'to-add-files-from-your-computer-drag-and-drop-them-directly-into-this-window',
              )
            }}
            {{ $t('you-can-also-use-the-button-below-to-browse-for-files') }}
          </p>
        </q-card-section>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :label="$t('cancel')" color="negative" flat v-close-popup />
        <q-btn :label="$t('browse')" @click="getLocalFiles()" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- <embed ref="pdfObject" type="application/pdf" width="500px" height="600px"> -->
</template>

<script setup lang="ts">
import type { DNDPlugin } from '@formkit/drag-and-drop';

import {
  animations,
  multiDrag,
  parents,
  selections,
  updateConfig,
} from '@formkit/drag-and-drop';
import { dragAndDrop } from '@formkit/drag-and-drop/vue';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { Buffer } from 'buffer';
import DOMPurify from 'dompurify';
import mime from 'mime';
import { storeToRefs } from 'pinia';
import { date, uid } from 'quasar';
import { electronApi } from 'src/helpers/electron-api';
import {
  getDurationFromMediaPath,
  getFileUrl,
  getTempDirectory,
  getThumbnailUrl,
} from 'src/helpers/fs';
import {
  addFullFilePathToMultimediaItem,
  downloadFileIfNeeded,
  dynamicMediaMapper,
  fetchMedia,
  getDocumentMultimediaItems,
  getPublicationInfoFromDb,
  processMissingMediaInfo,
  sanitizeId,
} from 'src/helpers/jw-media';
import {
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
  isSvg,
  isVideo,
} from 'src/helpers/mediaPlayback';
import { createTemporaryNotification } from 'src/helpers/notifications';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { useObsStateStore } from 'src/stores/obs-state';
import { DownloadedFile, DynamicMediaObject } from 'src/types/media';
import { DocumentItem, TableItem } from 'src/types/sqlite';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const dragging = ref(false);
const additionalLoading = ref(false);
const jwpubImportDb = ref('');
const jwpubImportInProgress = computed(() => !!jwpubImportDb.value);
const jwpubImportLoading = ref(false);
const jwpubImportDocuments = ref([] as DocumentItem[]);

const { t } = useI18n();

const obsState = useObsStateStore();
const { currentScene, obsConnectionState } = storeToRefs(obsState);
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
  mediaPlayer,
  mediaPlaying,
  selectedDate,
  selectedDateObject,
} = storeToRefs(currentState);
updateJwSongs();
const panzooms: { [key: string]: PanzoomObject } = {};

const mediaToStop = ref('');
const mediaStopPending = computed(() => !!mediaToStop.value);

const mediaToDelete = ref('');
const mediaDeletePending = computed(() => !!mediaToDelete.value);
const { decompress, executeQuery, fs, openFileDialog, path } = electronApi;

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
    animate: true,
    maxScale: 5,
    minScale: 1,
    panOnlyWhenZoomed: true,
  });

  elem.addEventListener('panzoomend', () => {
    zoomReset(elemId);
  });

  elem.addEventListener(
    'panzoomchange',
    (e: HTMLElementEventMap['panzoomchange']) => {
      mediaPlayer.value.scale = e.detail.scale;
      if (width > 0) mediaPlayer.value.x = e.detail.x / width;
      if (height > 0) mediaPlayer.value.y = e.detail.y / height;
    },
  );
};

const mediaList = ref();
const sortableMediaItems = ref([] as DynamicMediaObject[]);
const datedAdditionalMediaMap = computed(() => {
  return currentCongregation.value && selectedDate.value
    ? additionalMediaMaps.value[currentCongregation.value]?.[
        selectedDate.value
      ] || []
    : [];
});

function deleteMedia() {
  if (!mediaToDelete.value) return;
  removeFromAdditionMediaMap(mediaToDelete.value);
  mediaToDelete.value = '';
}

const mapOrder =
  (sortOrder: string | string[] | undefined) =>
  (a: DynamicMediaObject, b: DynamicMediaObject) => {
    const key = 'uniqueId';
    if (!sortOrder) return 0;
    return sortOrder.indexOf(a[key]) > sortOrder.indexOf(b[key]) ? 1 : -1;
  };

// const fileUrlIsValid = (fileUrl: PathLike) => {
//   if (!fileUrl) {
//     return false;
//   } else if (!fs.existsSync(fileUrlToPath(fileUrl))) return false;
//   else {
//     return true;
//   }
// };

// todo: watch length instead? less heavy?
const mediaItems = computed(() => {
  return datedAdditionalMediaMap.value.concat(
    selectedDateObject.value?.dynamicMedia,
  );
});

watch(mediaItems, (newValue) => {
  if (newValue && currentCongregation.value && selectedDate.value) {
    if (!mediaSort.value[currentCongregation.value])
      mediaSort.value[currentCongregation.value] = {};
    sortableMediaItems.value = newValue.sort(
      mapOrder(mediaSort.value[currentCongregation.value][selectedDate.value]),
    );
  }
});

watch(
  mediaSort,
  (newVal) => {
    if (
      currentCongregation.value &&
      selectedDate.value &&
      newVal[currentCongregation.value][selectedDate.value]?.length === 0
    ) {
      newVal[currentCongregation.value][selectedDate.value] =
        datedAdditionalMediaMap.value
          .concat(selectedDateObject.value?.dynamicMedia)
          .map((item: DynamicMediaObject) => item.uniqueId);
    }
    sortableMediaItems.value.sort(
      mapOrder(newVal[currentCongregation.value][selectedDate.value]),
    );
  },
  { deep: true },
);

const updateMediaSortPlugin: DNDPlugin = (parent) => {
  const parentData = parents.get(parent);
  if (!parentData) return;

  function dragend() {
    if (!mediaSort.value[currentCongregation.value])
      mediaSort.value[currentCongregation.value] = {};
    mediaSort.value[currentCongregation.value][selectedDate.value] =
      sortableMediaItems.value.map((item: DynamicMediaObject) => item.uniqueId);
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
  values: sortableMediaItems,
});

watch(
  () => [mediaPlaying.value, mediaPaused.value],
  ([newMediaPlaying, newMediaPaused]) => {
    sendObsSceneEvent(!newMediaPlaying || newMediaPaused ? 'camera' : 'media');
    updateConfig(mediaList.value, { disabled: !!newMediaPlaying });
  },
);

watch(
  lookupPeriod.value[currentCongregation.value]
    ?.filter((d) => d.error)
    .map((d) => date.formatDate(d.date, 'YYYY/MM/DD')),
  (newVal) => {
    console.log('RECALCULATING ERRORS', newVal);
    for (const date of newVal) {
      createTemporaryNotification({
        caption: !currentSettings.value?.langFallback
          ? t('tryConfiguringFallbackLanguage')
          : '',
        message: date + ' | ' + t('errorDownloadingMeetingMedia'),
        timeout: 10000,
        type: 'negative',
      });
    }
  },
);

onMounted(async () => {
  window.addEventListener('localFiles-browsed', localFilesBrowsedListener);
  window.addEventListener('remoteVideo-loading', remoteVideoLoading);
  window.addEventListener('remoteVideo-loaded', remoteVideoLoaded);

  watch(selectedDate, (newVal) => {
    if (!currentCongregation.value || !newVal) return;
    const durations = (customDurations.value[currentCongregation.value] ||= {});
    durations[newVal] ||= {};
  });
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
  sendObsSceneEvent('camera');
  fetchMedia();
});

function inferExtension(filename: string, filetype?: string) {
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
}

const addJwpubDocumentMediaToFiles = async (document: DocumentItem) => {
  additionalLoading.value = true;
  jwpubImportDocuments.value = [];
  jwpubImportLoading.value = true;
  const publication = getPublicationInfoFromDb(jwpubImportDb.value);
  let multimediaItems = getDocumentMultimediaItems({
    db: jwpubImportDb.value,
    docId: document.DocumentId,
  }).map((multimediaItem) =>
    addFullFilePathToMultimediaItem(multimediaItem, publication),
  );
  await processMissingMediaInfo(multimediaItems);
  const dynamicMediaItems = await dynamicMediaMapper(
    multimediaItems,
    selectedDateObject.value?.date,
    true,
  );
  addToAdditionMediaMap(dynamicMediaItems);
  jwpubImportDb.value = '';
  jwpubImportLoading.value = false;
  additionalLoading.value = false;
};

const copyToDatedAdditionalMedia = async (files: string[]) => {
  const datedAdditionalMediaDir = getDatedAdditionalMediaDirectory.value;
  fs.ensureDirSync(datedAdditionalMediaDir);

  for (const filepathToCopy of files) {
    if (!filepathToCopy || !fs.existsSync(filepathToCopy)) continue;
    let datedAdditionalMediaPath = path.join(
      datedAdditionalMediaDir,
      path.basename(filepathToCopy),
    );
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
    datedAdditionalMediaPath = trimFilepathAsNeeded(datedAdditionalMediaPath);
    try {
      const uniqueId = sanitizeId(
        date.formatDate(selectedDate.value, 'YYYYMMDD') +
          '-' +
          getFileUrl(datedAdditionalMediaPath),
      );
      if (fs.existsSync(datedAdditionalMediaPath)) {
        if (filepathToCopy !== datedAdditionalMediaPath)
          fs.removeSync(datedAdditionalMediaPath);
        removeFromAdditionMediaMap(uniqueId);
      }
      if (filepathToCopy !== datedAdditionalMediaPath)
        fs.copySync(filepathToCopy, datedAdditionalMediaPath);

      await addToAdditionMediaMapFromPath(datedAdditionalMediaPath, uniqueId);
    } catch (error) {
      console.error(error, filepathToCopy, datedAdditionalMediaPath);
    }
  }
};

const addToAdditionMediaMapFromPath = async (
  additionalFilePath: string,
  uniqueId?: string,
) => {
  try {
    if (!additionalFilePath) return;
    const isVideoFile = isVideo(additionalFilePath);
    const isAudioFile = isAudio(additionalFilePath);
    let duration = 0;

    if (isVideoFile || isAudioFile) {
      duration = await getDurationFromMediaPath(additionalFilePath);
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
        thumbnailUrl: await getThumbnailUrl(additionalFilePath, true),
        title: path.basename(additionalFilePath),
        uniqueId,
      },
    ]);
  } catch (error) {
    console.error(error, additionalFilePath);
  }
};

const addToFiles = async (
  files: { filetype?: string; path: string }[] | FileList,
) => {
  if (!files) return;
  additionalLoading.value = true;
  for (let i = 0; i < files.length; i++) {
    let filepath = files[i]?.path;
    try {
      console.log('file', files[i], filepath);
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

      // Check if file is HEIC or SVG first; if so, convert to JPG
      if (isHeic(filepath)) {
        filepath = await convertHeicToJpg(filepath);
      } else if (isSvg(filepath)) {
        filepath = await convertSvgToJpg(filepath);
      }

      if (isImage(filepath) || isVideo(filepath) || isAudio(filepath)) {
        copyToDatedAdditionalMedia([filepath]);
      } else if (isPdf(filepath)) {
        createTemporaryNotification({
          icon: 'mdi-file-pdf-box',
          message: t('pdfFilesNotSupported'),
          type: 'warning',
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
            caption: path.basename(filepath),
            icon: 'mdi-multimedia',
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
        }
        jwpubImportLoading.value = false;
      } else if (isJwPlaylist(filepath)) {
        getMediaFromJwPlaylist(
          filepath,
          selectedDateObject.value?.date,
          getDatedAdditionalMediaDirectory.value,
        ).then((additionalMedia) => {
          addToAdditionMediaMap(additionalMedia);
        });
      } else if (isArchive(filepath)) {
        const unzipDirectory = path.join(
          getTempDirectory(),
          path.basename(filepath),
        );
        if (fs.existsSync(unzipDirectory)) fs.removeSync(unzipDirectory);
        decompress(filepath, unzipDirectory).then(() => {
          addToFiles(
            fs.readdirSync(unzipDirectory).map((file) => {
              return {
                path: path.join(unzipDirectory, file),
              };
            }),
          ).then(() => fs.removeSync(unzipDirectory));
        });
      } else {
        createTemporaryNotification({
          caption: filepath ? path.basename(filepath) : filepath,
          icon: 'mdi-file',
          message: t('filetypeNotSupported'),
          type: 'error',
        });
      }
    } catch (error) {
      createTemporaryNotification({
        caption: filepath ? path.basename(filepath) : filepath,
        icon: 'mdi-file',
        message: t('fileProcessError'),
        type: 'error',
      });
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
      filetype?: string;
      path: string;
    }[];
    let noLocalDroppedFiles =
      droppedStuff.filter((file) => file.path).length === 0;
    if (noLocalDroppedFiles && droppedStuff.length > 0) {
      // maybe its a drag and drop from a web browser?
      let html = event.dataTransfer.getData('text/html');
      let sanitizedHtml = DOMPurify.sanitize(html);
      let src = new DOMParser()
        .parseFromString(sanitizedHtml, 'text/html')
        .querySelector('img')?.src;
      const filetype = Array.from(event.dataTransfer.items).find(
        (item) => item.kind === 'file',
      )?.type;
      if (src) droppedStuff[0] = { filetype, path: src };
    }
    addToFiles(droppedStuff).then(() => {
      additionalLoading.value = false;
    });
  }
  dragging.value = false;
};
// const dropIgnore = (event: DragEvent) => {
//   event.preventDefault();
//   event.stopPropagation();
// };

const mediaDurationPopups = ref({} as { [key: string]: boolean });

const showMediaDurationPopup = (media: DynamicMediaObject) => {
  if (!currentCongregation.value) return;
  customDurations.value[currentCongregation.value] ??= {};
  customDurations.value[currentCongregation.value][selectedDate.value] ??= {};
  customDurations.value[currentCongregation.value][selectedDate.value][
    media.uniqueId
  ] ??= {
    max: media.duration,
    min: 0,
  };
  mediaDurationPopups.value[media.uniqueId] = true;
};

const resetMediaDuration = (media: DynamicMediaObject) => {
  customDurations.value[currentCongregation.value] ??= {};
  customDurations.value[currentCongregation.value][selectedDate.value] ??= {};
  customDurations.value[currentCongregation.value][selectedDate.value][
    media.uniqueId
  ] = {
    max: media.duration,
    min: 0,
  };
};

const imageLoadingError = (media: DynamicMediaObject) => {
  console.error('imageLoadingError', media);
  const thumbnailUrl = media.thumbnailUrl;
  media.thumbnailUrl = '';
  media.thumbnailUrl = thumbnailUrl ?? getThumbnailUrl(media.fileUrl);
};

const localFilesBrowsedListener = (event: CustomEventInit) => {
  addToFiles(event.detail).then(() => {
    additionalLoading.value = false;
  });
};

const getLocalFiles = async () => {
  openFileDialog().then((result) => {
    if (result.filePaths.length > 0) {
      addToFiles(
        result.filePaths.map((path) => {
          return {
            path,
          };
        }),
      ).then(() => {
        additionalLoading.value = false;
      });
    }
    dragging.value = false;
  });
};

const remoteVideoLoading = () => {
  additionalLoading.value = true;
};

const remoteVideoLoaded = (event: CustomEventInit) => {
  addToAdditionMediaMapFromPath((event.detail as DownloadedFile).path);
  additionalLoading.value = false;
};

const sendObsSceneEvent = (scene: string) => {
  if (!scene) return;
  window.dispatchEvent(
    new CustomEvent('obsSceneEvent', {
      detail: {
        scene,
      },
    }),
  );
};

onUnmounted(() => {
  window.removeEventListener('localFiles-browsed', localFilesBrowsedListener);
  window.removeEventListener('remoteVideo-loading', remoteVideoLoading);
  window.removeEventListener('remoteVideo-loaded', remoteVideoLoaded);

  Object.keys(panzooms).forEach((key) => {
    try {
      if (!panzooms[key]) return;
      panzooms[key].destroy();
      delete panzooms[key];
    } catch (e) {
      console.error(e);
    }
  });
});
</script>

<style scoped>
.meeting-section {
  border-left: 10px solid;
}

.meeting-section-skeleton {
  border-color: rgba(0, 0, 0, 0.12);
}

.meeting-section-begin {
  margin-top: 1em;
}

.meeting-section-end {
  margin-bottom: 1em;
}

.meeting-section-tgw {
  border-color: rgb(60, 127, 139);
  background-color: rgb(60, 127, 139, 0.1);
}
/*
.meeting-section-begin-tgw {
  border-top: 5px solid rgb(60, 127, 139, 0.25);
}

.meeting-section-end-tgw {
  border-bottom: 5px solid rgb(60, 127, 139, 0.25);
} */

.meeting-section-ayfm {
  border-color: rgb(214, 143, 0);
  background-color: rgb(214, 143, 0, 0.1);
}

/* .meeting-section-begin-ayfm {
  border-top: 5px solid rgb(214, 143, 0, 0.25);
}

.meeting-section-end-ayfm {
  border-bottom: 5px solid rgb(214, 143, 0, 0.25);
} */

.meeting-section-lac {
  border-color: rgb(191, 47, 19);
  background-color: rgb(191, 47, 19, 0.1);
}

/* .meeting-section-begin-lac {
  border-top: 5px solid rgb(191, 47, 19, 0.25);
}

.meeting-section-end-lac {
  border-bottom: 5px solid rgb(191, 47, 19, 0.25);
} */

.meeting-section-wt {
  border-color: rgb(214, 143, 0);
  background-color: rgb(214, 143, 0, 0.1);
}

/* .meeting-section-begin-wt {
  border-top: 5px solid rgb(214, 143, 0, 0.25);
}

.meeting-section-end-wt {
  border-bottom: 5px solid rgb(214, 143, 0, 0.25);
} */

.meeting-section-additional {
  border-color: rgb(91, 60, 136);
  background-color: rgb(91, 60, 136, 0.1);
}
/*
.meeting-section-begin-additional {
  border-top: 5px solid rgb(91, 60, 136, 0.25);
}

.meeting-section-end-additional {
  border-bottom: 5px solid rgb(91, 60, 136, 0.25);
} */
</style>
