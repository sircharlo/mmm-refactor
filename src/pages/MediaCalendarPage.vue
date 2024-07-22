<template>
  <q-page
    @dragenter="dropActive"
    @dragover="dropActive"
    @dragstart="dropActive"
    @drop="dropEnd"
    padding
  >
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
    <q-list ref="mediaList">
      <q-banner
        class="bg-orange-9 text-white"
        inline-actions
        rounded
        v-if="
          sortableMediaItems.length === 0 &&
          selectedDate &&
          !selectedDateObject?.loading
        "
      >
        <template v-slot:avatar>
          <q-icon name="mdi-exclamation-thick" />
        </template>
        {{ $t('noMedia') }}
      </q-banner>
      <template v-else-if="selectedDateObject?.loading">
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
        <div
          :class="
            'meeting-section ' +
            (index === 0 ||
            media.section !== sortableMediaItems[index - 1]?.section
              ? 'meeting-section-begin '
              : '') +
            ' ' +
            (index !== sortableMediaItems.length &&
            media.section !== sortableMediaItems[index + 1]?.section
              ? 'meeting-section-end '
              : '')
          "
        >
          <q-item
            :class="'jw-icon meeting-section-internal begin ' + media.section"
            v-if="
              index === 0 ||
              media.section !== sortableMediaItems[index - 1]?.section
            "
            ><q-avatar :class="'text-white bg-' + media.section" rounded>
              <span class="text-h4">
                {{
                  media.section === 'tgw'
                    ? ''
                    : media.section === 'ayfm'
                      ? ''
                      : media.section === 'lac'
                        ? ''
                        : media.section === 'wt'
                          ? ''
                          : media.section === 'additional'
                            ? ''
                            : media.section
                }}
              </span></q-avatar
            >
          </q-item>
          <q-item
            :class="
              'items-center justify-center meeting-section-internal ' +
              media.section +
              ' ' +
              (index + 1 === sortableMediaItems.length ||
              media.section !== sortableMediaItems[index + 1]?.section
                ? 'end'
                : '')
            "
          >
            <div class="q-pr-none rounded-borders">
              <div
                class="bg-grey-9 rounded-borders text-white flex"
                style="width: 150px; height: 84px"
                v-if="media.isAudio"
              >
                <q-icon name="mdi-music-note" size="lg" />
              </div>
              <div class="q-pr-none rounded-borders relative-position" v-else>
                <q-img
                  :id="media.uniqueId"
                  :ratio="16 / 9"
                  :src="media.thumbnailUrl"
                  @error="imageLoadingError(media)"
                  class="rounded-borders"
                  fit="contain"
                  width="150px"
                >
                  <!-- @load="media.isImage" -->
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
                    class="q-mt-xs q-ml-xs"
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
                  <!-- todo: restyle this dialog -->
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
                              customDurations[currentCongregation][
                                selectedDate
                              ][media.uniqueId]
                            "
                          />
                        </q-card-section>
                        <q-card-section class="q-px-sm q-pt-lg">
                          <q-btn
                            :label="$t('videoTimeReset')"
                            @click="resetMediaDuration(media)"
                            color="negative"
                            rounded
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
                <template v-if="mediaPlayingUrl === media.fileUrl">
                  <transition
                    appear
                    enter-active-class="animated fadeIn"
                    leave-active-class="animated fadeOut"
                    mode="out-in"
                    name="fade"
                  >
                    <div
                      class="absolute-bottom-right q-mr-xs q-mb-xs semi-black row rounded-borders"
                    >
                      <q-badge
                        @click="zoomOut(media.uniqueId)"
                        style="background: transparent; padding: 5px !important"
                      >
                        <q-icon color="white" name="mdi-minus" />
                      </q-badge>
                      <q-separator class="bg-grey-8 q-my-xs" vertical />
                      <q-badge
                        @click="zoomIn(media.uniqueId)"
                        style="background: transparent; padding: 5px !important"
                      >
                        <q-icon color="white" name="mdi-plus" />
                      </q-badge>
                    </div>
                  </transition>
                  <transition
                    appear
                    enter-active-class="animated fadeIn"
                    leave-active-class="animated fadeOut"
                    mode="out-in"
                    name="fade"
                  >
                    <div
                      class="absolute-bottom-left q-mr-xs q-mt-xs row rounded-borders"
                      v-if="obsConnectionState === 'connected'"
                    >
                      <q-badge
                        :color="
                          currentScene === 'media' ? 'primary' : 'negative'
                        "
                        @click="
                          sendObsSceneEvent(
                            currentScene === 'media' ? 'camera' : 'media',
                          )
                        "
                        style="background: transparent; padding: 5px !important"
                      >
                        <q-tooltip>{{
                          $t(
                            currentScene === 'media'
                              ? 'hide-image-for-zoom-participants'
                              : 'show-image-for-zoom-participants',
                          )
                        }}</q-tooltip>
                        <q-icon
                          :name="
                            currentScene === 'media'
                              ? 'mdi-broadcast'
                              : 'mdi-broadcast-off'
                          "
                          color="white"
                        />
                      </q-badge>
                    </div>
                  </transition>
                </template>
              </div>
            </div>
            <!--
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
-->
            <div class="row" style="flex-grow: 1; align-content: center">
              <div class="col-12">
                <div class="row items-center">
                  <div class="col">
                    <div class="row items-center">
                      <div
                        class="q-pl-md q-pr-none col-shrink"
                        side
                        v-if="media.paragraph"
                      >
                        <q-chip
                          :clickable="false"
                          class="media-tag bg-accent-200"
                          square
                        >
                          <q-icon
                            :name="
                              media.paragraph !== 9999
                                ? 'fas fa-paragraph'
                                : 'mdi-asterisk-circle-outline'
                            "
                            class="q-mr-xs"
                          />
                          {{
                            media.paragraph !== 9999
                              ? media.paragraph
                              : $t('footnote')
                          }}
                        </q-chip>
                      </div>
                      <div
                        class="q-pl-md q-pr-none col-shrink"
                        side
                        v-else-if="media.song"
                      >
                        <q-chip
                          :clickable="false"
                          class="media-tag bg-accent-400"
                          square
                          text-color="white"
                        >
                          <q-icon
                            class="q-mr-xs"
                            color="white"
                            name="mdi-music-note"
                          />
                          {{ media.song.toString() }}
                        </q-chip>
                      </div>
                      <div class="q-px-md col">
                        <div class="ellipsis-3-lines">
                          {{
                            media.title ||
                            (media.fileUrl ? path.basename(media.fileUrl) : '')
                          }}
                        </div>
                      </div>
                      <div
                        v-if="
                          media.isAdditional &&
                          mediaPlayingUrl !== media.fileUrl
                        "
                      >
                        <q-btn
                          @click="mediaToDelete = media.uniqueId"
                          color="negative"
                          flat
                          icon="mdi-delete-forever"
                          rounded
                        />
                      </div>
                    </div>
                    <transition
                      appear
                      enter-active-class="animated fadeIn"
                      leave-active-class="animated fadeOut"
                      mode="out-in"
                      name="fade"
                    >
                      <div
                        class="absolute duration-slider"
                        v-if="
                          [media.fileUrl, media.streamUrl].includes(
                            mediaPlayingUrl,
                          ) && media.isVideo
                        "
                      >
                        <q-slider
                          :disable="mediaPlayingAction !== 'pause'"
                          :max="media.duration"
                          :min="0"
                          :step="0"
                          @update:model-value="seekTo"
                          v-model="mediaPlayingCurrentPosition"
                        />
                      </div>
                    </transition>
                  </div>
                  <div
                    class="col-shrink"
                    style="align-content: center"
                    v-if="
                      !(
                        mediaPlayingUrl === media.fileUrl ||
                        mediaPlayingUrl === media.streamUrl
                      )
                    "
                  >
                    <template
                      v-if="!media.markers || media.markers.length === 0"
                    >
                      <q-btn
                        :disable="
                          mediaPlayingUrl !== '' && isVideo(mediaPlayingUrl)
                        "
                        @click="
                          mediaPlayingUrl = fs.existsSync(
                            fileUrlToPath(media.fileUrl),
                          )
                            ? media.fileUrl
                            : (media.streamUrl ?? media.fileUrl);
                          mediaPlayingUniqueId = media.uniqueId;
                          mediaPlayingSubtitlesUrl = media.subtitlesUrl ?? '';
                          if (isImage(mediaPlayingUrl))
                            initiatePanzoom(media.uniqueId);
                        "
                        color="primary"
                        icon="mdi-play"
                        rounded
                      />
                    </template>
                    <template v-else>
                      <q-btn
                        :disable="
                          mediaPlayingUrl !== '' && isVideo(mediaPlayingUrl)
                        "
                        color="primary"
                        icon="mdi-play-box-multiple"
                        push
                        rounded
                      >
                        <q-menu>
                          <q-list style="min-width: 100px">
                            <q-item
                              @click="
                                customDurations[currentCongregation] ??= {};
                                customDurations[currentCongregation][
                                  selectedDate
                                ] ??= {};
                                customDurations[currentCongregation][
                                  selectedDate
                                ][media.uniqueId] = {
                                  min: 0,
                                  max: media.duration,
                                };
                                mediaPlayingUrl = fs.existsSync(
                                  fileUrlToPath(media.fileUrl),
                                )
                                  ? media.fileUrl
                                  : (media.streamUrl ?? media.fileUrl);
                                mediaPlayingUniqueId = media.uniqueId;
                                mediaPlayingSubtitlesUrl =
                                  media.subtitlesUrl ?? '';
                                mediaPlayingAction = 'play';
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
                                customDurations[currentCongregation][
                                  selectedDate
                                ][media.uniqueId].min =
                                  marker.StartTimeTicks / 10000 / 1000;
                                customDurations[currentCongregation][
                                  selectedDate
                                ][media.uniqueId].max =
                                  (marker.StartTimeTicks +
                                    marker.DurationTicks -
                                    marker.EndTransitionDurationTicks) /
                                  10000 /
                                  1000;
                                mediaPlayingUrl = fs.existsSync(
                                  fileUrlToPath(media.fileUrl),
                                )
                                  ? media.fileUrl
                                  : (media.streamUrl ?? media.fileUrl);
                                mediaPlayingUniqueId = media.uniqueId;
                                mediaPlayingSubtitlesUrl =
                                  media.subtitlesUrl ?? '';
                                mediaPlayingAction = 'play';
                              "
                              clickable
                              v-for="marker in media.markers"
                            >
                              <q-item-section>{{
                                marker.Label
                              }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </template>
                  </div>
                  <template v-else>
                    <div class="col-shrink items-center justify-center flex">
                      <q-btn
                        @click="mediaPlayingAction = 'play'"
                        color="primary"
                        icon="mdi-play"
                        outline
                        rounded
                        v-if="mediaPlayingAction === 'pause'"
                      />
                      <q-btn
                        @click="mediaPlayingAction = 'pause'"
                        color="negative"
                        icon="mdi-pause"
                        outline
                        rounded
                        v-else-if="
                          media.isVideo &&
                          (mediaPlayingAction === 'play' || !mediaPlayingAction)
                        "
                      />
                      <q-btn
                        @click="
                          media.isVideo
                            ? (mediaToStop = media.uniqueId)
                            : stopMedia()
                        "
                        class="q-ml-sm"
                        color="negative"
                        icon="mdi-stop"
                        rounded
                        v-if="
                          mediaPlayingAction !== '' || mediaPlayingAction === ''
                        "
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </q-item>
        </div>
      </template>
    </q-list>
    <!-- todo: restyle this dialog -->
    <q-dialog persistent v-model="mediaStopPending">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar color="negative" icon="mdi-alert" text-color="white" />
          <span class="q-ml-sm">{{ $t('sureStopVideo') }}</span>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn :label="$t('cancel')" @click="mediaToStop = ''" flat />
          <q-btn :label="$t('stop')" @click="stopMedia()" flat />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- todo: restyle this dialog -->
    <q-dialog persistent v-model="mediaDeletePending">
      <q-card>
        <q-card-section>
          <div class="row self-center">
            <q-avatar
              class="q-mr-md self-center"
              color="negative"
              icon="mdi-alert"
              text-color="white"
            />
            <span class="text-h6 self-center">
              {{ $t('are-you-sure') }}
            </span>
            <q-space />
            <div class="text-h6 self-center">
              <q-btn
                @click="mediaToDelete = ''"
                dense
                flat
                icon="close"
                round
                v-close-popup
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <span class="q-ml-sm">
            <p>
              <strong>
                {{
                  sortableMediaItems.find((m) => m.uniqueId === mediaToDelete)
                    ?.title
                }}
              </strong>
            </p>
            <p>
              {{
                fileUrlToPath(
                  sortableMediaItems.find((m) => m.uniqueId === mediaToDelete)
                    ?.fileUrl ?? '',
                )
              }}
            </p>
          </span>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn
            :label="$t('delete')"
            @click="deleteMedia()"
            color="negative"
            flat
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
  <DragAndDropper
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
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { Buffer } from 'buffer';
import DOMPurify from 'dompurify';
import { storeToRefs } from 'pinia';
import { date, uid } from 'quasar';
import DragAndDropper from 'src/components/media/DragAndDropper.vue';
import { electronApi } from 'src/helpers/electron-api';
import {
  getDurationFromMediaPath,
  getFileUrl,
  getPublicationDirectory,
  getTempDirectory,
  getThumbnailUrl,
} from 'src/helpers/fs';
import {
  addJwpubDocumentMediaToFiles,
  // addFullFilePathToMultimediaItem,
  downloadFileIfNeeded,
  // dynamicMediaMapper,
  fetchMedia,
  // getDocumentMultimediaItems,
  getPublicationInfoFromDb,
  // processMissingMediaInfo,
  sanitizeId,
} from 'src/helpers/jw-media';
import {
  convertImageIfNeeded,
  decompressJwpub,
  findDb,
  formatTime,
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
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { useObsStateStore } from 'src/stores/obs-state';
import { DynamicMediaObject } from 'src/types/media';
import { DocumentItem, TableItem } from 'src/types/sqlite';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const dragging = ref(false);
const jwpubImportDb = ref('');
const jwpubImportLoading = ref(false);
const jwpubImportDocuments = ref([] as DocumentItem[]);

watch(
  () => jwpubImportDb.value,
  (newVal) => {
    if (!!newVal) {
      dragging.value = true;
    }
  },
);

watch(
  () => dragging.value,
  (newVal) => {
    if (!newVal) {
      jwpubImportDb.value = '';
      jwpubImportDocuments.value = [];
    }
  },
);

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
  mediaPlaying,
  mediaPlayingAction,
  mediaPlayingCurrentPosition,
  // mediaPlayingSeekTo,
  mediaPlayingPanzoom,
  mediaPlayingSubtitlesUrl,
  mediaPlayingUniqueId,
  mediaPlayingUrl,
  selectedDate,
  selectedDateObject,
} = storeToRefs(currentState);
updateJwSongs();
const panzooms: { [key: string]: PanzoomObject } = {};
const mediaToStop = ref('');
const mediaStopPending = computed(() => !!mediaToStop.value);
const mediaToDelete = ref('');
const mediaDeletePending = computed(() => !!mediaToDelete.value);
const {
  convertPdfToImages,
  decompress,
  executeQuery,
  fileUrlToPath,
  fs,
  path,
} = electronApi;

const zoomReset = (elemId: string, forced = false, animate = true) => {
  if (panzooms[elemId]?.getScale() <= 1.25 || forced)
    panzooms[elemId]?.reset({ animate });
};

function stopMedia() {
  // mediaPlayingAction.value = 'stop';
  console.log('destroyPanzoom', mediaPlayingUniqueId.value);
  destroyPanzoom(mediaPlayingUniqueId.value);
  mediaPlayingUrl.value = '';
  mediaPlayingUniqueId.value = '';
  mediaPlayingAction.value = '';
  mediaPlayingCurrentPosition.value = 0;
  mediaToStop.value = '';
}

watch(
  () => mediaPlayingUniqueId.value,
  (newMediaUniqueId) => {
    bc.postMessage({ uniqueId: newMediaUniqueId });
    for (const key of Object.keys(panzooms)) {
      if (key !== newMediaUniqueId) zoomReset(key, true);
    }
  },
);

const seekTo = (newSeekTo: null | number) => {
  if (newSeekTo !== null) bc.postMessage({ seekTo: newSeekTo });
};

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
      console.error(error);
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

function zoomIn(elemId: string) {
  try {
    panzooms[elemId].zoomIn();
  } catch (error) {
    console.error(error);
  }
}

function zoomOut(elemId: string) {
  try {
    panzooms[elemId].zoomOut();
    zoomReset(elemId);
  } catch (error) {
    console.error(error);
  }
}

const destroyPanzoom = (elemId: string) => {
  try {
    console.log(panzooms[elemId], elemId);
    if (!panzooms[elemId] || !elemId) return;
    panzooms[elemId].resetStyle();
    panzooms[elemId].reset({ animate: false });
    panzooms[elemId].destroy();
    console.log(panzooms[elemId], elemId);
    delete panzooms[elemId];
    console.log(panzooms[elemId], elemId);
  } catch (e) {
    console.error(e);
  }
};

const initiatePanzoom = (elemId: string) => {
  try {
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
        mediaPlayingPanzoom.value = {
          scale: e.detail.scale,
          x: e.detail.x / (width ?? 1),
          y: e.detail.y / (height ?? 1),
        };
      },
    );
  } catch (error) {
    console.error(error);
  }
};

const datedAdditionalMediaMap = computed(() => {
  return (
    additionalMediaMaps.value[currentCongregation.value]?.[
      selectedDate.value
    ] ?? []
  );
});

const bc = new BroadcastChannel('mediaPlayback');
bc.onmessage = (event) => {
  console.debug('onmessage', event.data);
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
  if (event.data?.resetPanzoom) zoomReset(event.data.resetPanzoom, true);
  if ('currentPosition' in event.data) {
    mediaPlayingCurrentPosition.value = event.data.currentPosition;
  }
};

function deleteMedia() {
  if (!mediaToDelete.value) return;
  removeFromAdditionMediaMap(mediaToDelete.value);
  mediaToDelete.value = '';
}

const mapOrder =
  (sortOrder: string | string[] | undefined) =>
  (a: DynamicMediaObject, b: DynamicMediaObject) => {
    try {
      const key = 'uniqueId';
      if (!sortOrder || sortOrder.length === 0) return 0;
      return sortOrder.indexOf(a[key]) > sortOrder.indexOf(b[key]) ? 1 : -1;
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

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

const [mediaList, sortableMediaItems] = useDragAndDrop(
  [] as DynamicMediaObject[],
  {
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
  },
);

const generateMediaList = () => {
  const combinedMediaItems = datedAdditionalMediaMap.value.concat(
    selectedDateObject.value?.dynamicMedia ?? [],
  );
  if (combinedMediaItems && currentCongregation.value && selectedDate.value) {
    if (!mediaSort.value[currentCongregation.value]) {
      mediaSort.value[currentCongregation.value] = {};
    }
    const seenFileUrls = new Set();
    sortableMediaItems.value = combinedMediaItems
      .sort(
        mapOrder(
          mediaSort.value[currentCongregation.value][selectedDate.value],
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
      console.error(e);
    }
  },
);

watch(
  () => mediaSort.value?.[currentCongregation.value]?.[selectedDate.value],
  (newMediaSort) => {
    try {
      if (newMediaSort && newMediaSort.length === 0) {
        newMediaSort = datedAdditionalMediaMap.value
          .concat(selectedDateObject.value?.dynamicMedia)
          .map((item: DynamicMediaObject) => item.uniqueId);
      }
      sortableMediaItems.value.sort(mapOrder(newMediaSort));
    } catch (e) {
      console.error(e);
    }
  },
  // { deep: true },
  { immediate: true },
);

watch(
  () => [mediaPlaying.value, mediaPaused.value],
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
    console.error('RECALCULATING ERRORS', newVal);
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

const startDragging = () => {
  resetDragging();
  dragging.value = true;
};

onMounted(async () => {
  window.addEventListener('draggingSomething', startDragging);
  window.addEventListener('localFiles-browsed', localFilesBrowsedListener);
  window.addEventListener('remoteVideo-loading', remoteVideoLoading);
  // window.addEventListener('remoteVideo-loaded', remoteVideoLoaded);

  watch(selectedDate, (newVal) => {
    try {
      if (!currentCongregation.value || !newVal) {
        sortableMediaItems.value = [];
        return;
      }
      const durations = (customDurations.value[currentCongregation.value] ||=
        {});
      durations[newVal] ||= {};
    } catch (e) {
      console.error(e);
    }
  });
  generateMediaList();
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
    console.error(e);
  }
  sendObsSceneEvent('camera');
  fetchMedia();
});

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
      console.error(error, filepathToCopy);
    }
  }
};

const addToAdditionMediaMapFromPath = async (
  additionalFilePath: string,
  uniqueId?: string,
  stream?: {
    duration: number;
    thumbnailUrl: string;
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
        streamUrl: stream?.url,
        thumbnailUrl:
          stream?.thumbnailUrl ??
          (await getThumbnailUrl(additionalFilePath, true)),
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
        jwpubImportLoading.value = true;
        // TODO: only decompress the db, maybe in memory, to get the publication info
        const tempUnzipDir = await decompressJwpub(filepath);
        const tempDb = findDb(tempUnzipDir);
        if (!tempDb) return;
        const publication = getPublicationInfoFromDb(tempDb);
        const publicationDirectory = getPublicationDirectory(publication);
        if (!publicationDirectory) return;
        const unzipDir = await decompressJwpub(filepath, publicationDirectory);
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
          const possibleJwpubImportDocuments = executeQuery(
            db,
            `SELECT DISTINCT Document.DocumentId, Title FROM Document JOIN ${mmTable} ON Document.DocumentId = ${mmTable}.DocumentId;`,
          ) as DocumentItem[];
          if (possibleJwpubImportDocuments.length > 1) {
            jwpubImportDocuments.value = possibleJwpubImportDocuments;
          } else if (possibleJwpubImportDocuments.length === 1) {
            await addJwpubDocumentMediaToFiles(
              jwpubImportDb.value,
              possibleJwpubImportDocuments[0],
            );
          }
        }
        jwpubImportLoading.value = false;
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
            console.error(error);
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
                console.error(error);
              });
          })
          .catch((error) => {
            console.error(error);
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
      console.error(error);
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
      const droppedStuff = Array.from(event.dataTransfer.files) as {
        filetype?: string;
        path: string;
      }[];
      let noLocalDroppedFiles =
        droppedStuff.filter((file) => file.path).length === 0;
      if (noLocalDroppedFiles && droppedStuff.length > 0) {
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
      addToFiles(droppedStuff)
        .catch((error) => {
          console.error(error);
        })
        .then(() => {
          resetDragging();
        });
    }
  } catch (error) {
    console.error(error);
  }
};
// const dropIgnore = (event: DragEvent) => {
//   event.preventDefault();
//   event.stopPropagation();
// };

const mediaDurationPopups = ref({} as { [key: string]: boolean });

const resetDragging = () => {
  dragging.value = false;
  jwpubImportDb.value = '';
  jwpubImportDocuments.value = [];
};

const showMediaDurationPopup = (media: DynamicMediaObject) => {
  try {
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
  } catch (error) {
    console.error(error);
  }
};

const resetMediaDuration = (media: DynamicMediaObject) => {
  try {
    customDurations.value[currentCongregation.value] ??= {};
    customDurations.value[currentCongregation.value][selectedDate.value] ??= {};
    customDurations.value[currentCongregation.value][selectedDate.value][
      media.uniqueId
    ] = {
      max: media.duration,
      min: 0,
    };
  } catch (error) {
    console.error(error);
  }
};

const imageLoadingError = (media: DynamicMediaObject) => {
  console.warn(
    'Unable to load thumbnail for media; trying to reload from file.',
    media,
  );
  media.thumbnailUrl = '';
  getThumbnailUrl(media.fileUrl)
    .then((thumbnailUrl) => {
      media.thumbnailUrl = thumbnailUrl;
      console.warn('Reloaded thumbnail', thumbnailUrl);
    })
    .catch((error) => {
      media.thumbnailUrl = '';
      console.error(error);
    });
};

const localFilesBrowsedListener = (event: CustomEventInit) => {
  addToFiles(event.detail)
    .catch((error) => {
      console.error(error);
    })
    .then(() => {
      resetDragging();
    });
};

const remoteVideoLoading = (event: CustomEventInit) => {
  addToAdditionMediaMapFromPath(event.detail.path, undefined, {
    duration: event.detail.duration,
    thumbnailUrl: event.detail.thumbnailUrl,
    url: event.detail.url,
  });
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
  window.removeEventListener('draggingSomething', startDragging);
  window.removeEventListener('localFiles-browsed', localFilesBrowsedListener);
  window.removeEventListener('remoteVideo-loading', remoteVideoLoading);
  // window.removeEventListener('remoteVideo-loaded', remoteVideoLoaded);

  Object.keys(panzooms).forEach((key) => {
    destroyPanzoom(key);
  });
});
</script>
