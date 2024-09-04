<template>
  <q-item class="items-center justify-center">
    <div class="q-pr-none rounded-borders">
      <div
        class="bg-grey-9 rounded-borders text-white flex"
        style="width: 150px; height: 84px"
        v-if="media.isAudio"
      >
        <q-icon name="mmm-music-note" size="lg" />
      </div>
      <div class="q-pr-none rounded-borders relative-position bg-black" v-else>
        <q-img
          :id="media.uniqueId"
          :ratio="16 / 9"
          :src="
            media.isImage
              ? media.fileUrl
              : media.thumbnailUrl || thumbnailFromMetadata
          "
          @error="imageLoadingError(media)"
          class="rounded-borders"
          fit="contain"
          width="150px"
        >
          <!-- @load="media.isImage" -->
          <q-badge
            :class="
              'q-mt-sm q-ml-sm cursor-pointer rounded-borders-sm ' +
              (customDurations[currentCongregation]?.[selectedDate]?.[
                media.uniqueId
              ] &&
              (customDurations[currentCongregation][selectedDate][
                media.uniqueId
              ].min > 0 ||
                customDurations[currentCongregation][selectedDate][
                  media.uniqueId
                ].max < media.duration)
                ? 'negative'
                : 'bg-semi-black')
            "
            @click="showMediaDurationPopup(media)"
            style="padding: 5px !important"
            v-if="media.isVideo"
          >
            <q-icon class="q-mr-xs" color="white" name="mmm-play" />
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
          <q-dialog v-model="mediaDurationPopups[media.uniqueId]">
            <q-card>
              <q-card-section
                class="row items-center text-bigger text-semibold q-pb-none"
              >
                <!-- <q-icon class="q-mr-sm" name="mmm-edit" /> -->
                {{ $t('set-custom-durations') }}
              </q-card-section>
              <q-card-section>
                {{
                  $t(
                    'use-the-slider-below-to-adjust-the-start-and-end-time-of-this-media-item',
                  )
                }}
              </q-card-section>
              <q-card-section>
                <div class="text-subtitle1 q-pb-sm">{{ media.title }}</div>
                <!-- </q-card-section>
              <q-card-section class="q-pr-sm" horizontal> -->
                <div class="row items-center q-mt-lg">
                  <!-- {{ media.duration }} -->
                  <div class="col-shrink q-pr-md time-duration">
                    {{ formatTime(0) }}
                  </div>
                  <div class="col">
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
                      :step="0.1"
                      label
                      label-always
                      v-model="
                        customDurations[currentCongregation][selectedDate][
                          media.uniqueId
                        ]
                      "
                    />
                  </div>
                  <div class="col-shrink q-pl-md time-duration">
                    {{ formatTime(media.duration) }}
                  </div>
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  :label="$t('videoTimeSave')"
                  @click="mediaDurationPopups[media.uniqueId] = false"
                  color="primary"
                  flat
                />
                <q-btn
                  :label="$t('reset')"
                  @click="resetMediaDuration(media)"
                  color="negative"
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
              class="absolute-bottom-right q-mr-xs q-mb-xs bg-semi-black row rounded-borders"
            >
              <q-badge
                @click="zoomOut(media.uniqueId)"
                style="background: transparent; padding: 5px !important"
              >
                <q-icon color="white" name="mmm-minus" />
              </q-badge>
              <q-separator class="bg-grey-8 q-my-xs" vertical />
              <q-badge
                @click="zoomIn(media.uniqueId)"
                style="background: transparent; padding: 5px !important"
              >
                <q-icon color="white" name="mmm-plus" />
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
            <!-- todo: add custom icons for this -->
            <div
              class="absolute-bottom-left q-mr-xs q-mt-xs row rounded-borders"
              v-if="obsConnectionState === 'connected'"
            >
              <q-badge
                :color="currentScene === 'media' ? 'primary' : 'negative'"
                @click="
                  sendObsSceneEvent(
                    currentScene === 'media' ? 'camera' : 'media',
                  )
                "
                style="background: transparent; padding: 5px !important"
              >
                <q-tooltip :delay="1000">{{
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
                        ? 'mmm-paragraph'
                        : 'mmm-footnote'
                    "
                    class="q-mr-xs"
                  />
                  {{
                    media.paragraph !== 9999 ? media.paragraph : $t('footnote')
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
                  <q-icon class="q-mr-xs" name="mmm-music-note" />
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
                v-if="media.isAdditional && mediaPlayingUrl !== media.fileUrl"
              >
                <q-btn
                  @click="mediaToDelete = media.uniqueId"
                  class="q-mr-md"
                  color="negative"
                  flat
                  icon="mmm-delete"
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
                  [media.fileUrl, media.streamUrl].includes(mediaPlayingUrl) &&
                  media.isVideo
                "
              >
                <q-slider
                  :inner-max="
                    customDurations?.[currentCongregation]?.[selectedDate]?.[
                      media.uniqueId
                    ]?.max ?? media.duration
                  "
                  :inner-min="
                    customDurations?.[currentCongregation]?.[selectedDate]?.[
                      media.uniqueId
                    ]?.min ?? 0
                  "
                  :label-value="formatTime(mediaPlayingCurrentPosition)"
                  :max="media.duration"
                  :min="0"
                  :readonly="mediaPlayingAction !== 'pause'"
                  :step="0.1"
                  @update:model-value="seekTo"
                  label
                  track-color="accent-200"
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
            <template v-if="!media.markers || media.markers.length === 0">
              <q-btn
                :disable="mediaPlayingUrl !== '' && isVideo(mediaPlayingUrl)"
                @click="
                  mediaPlayingUrl = fs.existsSync(fileUrlToPath(media.fileUrl))
                    ? media.fileUrl
                    : (media.streamUrl ?? media.fileUrl);
                  mediaPlayingUniqueId = media.uniqueId;
                  mediaPlayingSubtitlesUrl = media.subtitlesUrl ?? '';
                  if (isImage(mediaPlayingUrl)) {
                    initiatePanzoom(media.uniqueId);
                  } else {
                    muteBackgroundMusic();
                  }
                "
                color="primary"
                icon="mmm-play"
                rounded
              />
            </template>
            <template v-else>
              <q-btn
                :disable="mediaPlayingUrl !== '' && isVideo(mediaPlayingUrl)"
                color="primary"
                icon="mmm-play-sign-language"
                push
                rounded
              >
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      @click="
                        customDurations[currentCongregation] ??= {};
                        customDurations[currentCongregation][selectedDate] ??=
                          {};
                        customDurations[currentCongregation][selectedDate][
                          media.uniqueId
                        ] = {
                          min: 0,
                          max: media.duration,
                        };
                        mediaPlayingUrl = fs.existsSync(
                          fileUrlToPath(media.fileUrl),
                        )
                          ? media.fileUrl
                          : (media.streamUrl ?? media.fileUrl);
                        mediaPlayingUniqueId = media.uniqueId;
                        mediaPlayingSubtitlesUrl = media.subtitlesUrl ?? '';
                        mediaPlayingAction = 'play';
                      "
                      clickable
                    >
                      <q-item-section>{{ $t('entireFile') }}</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      :key="marker.VideoMarkerId"
                      @click="
                        customDurations[currentCongregation] ??= {};
                        customDurations[currentCongregation][selectedDate] ??=
                          {};
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
                        mediaPlayingUrl = fs.existsSync(
                          fileUrlToPath(media.fileUrl),
                        )
                          ? media.fileUrl
                          : (media.streamUrl ?? media.fileUrl);
                        mediaPlayingUniqueId = media.uniqueId;
                        mediaPlayingSubtitlesUrl = media.subtitlesUrl ?? '';
                        mediaPlayingAction = 'play';
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
            <div class="col-shrink items-center justify-center flex">
              <q-btn
                @click="
                  mediaPlayingAction = 'play';
                  muteBackgroundMusic();
                "
                color="primary"
                icon="mmm-play"
                outline
                rounded
                v-if="mediaPlayingAction === 'pause'"
              />
              <q-btn
                @click="
                  mediaPlayingAction = 'pause';
                  unmuteBackgroundMusic();
                "
                color="negative"
                icon="mmm-pause"
                outline
                rounded
                v-else-if="
                  media.isVideo &&
                  (mediaPlayingAction === 'play' || !mediaPlayingAction)
                "
              />
              <q-btn
                @click="
                  media.isVideo ? (mediaToStop = media.uniqueId) : stopMedia()
                "
                class="q-ml-sm"
                color="negative"
                icon="mmm-stop"
                rounded
                v-if="mediaPlayingAction !== '' || mediaPlayingAction === ''"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </q-item>
  <q-dialog v-model="mediaStopPending">
    <q-card class="modal-confirm">
      <q-card-section
        class="row items-center text-bigger text-semibold text-negative q-pb-none"
      >
        <q-icon class="q-mr-sm" name="mmm-stop" />
        {{ $t('stop-media') }}
      </q-card-section>
      <q-card-section class="row items-center">
        {{ $t('sureStopVideo') }}
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn :label="$t('cancel')" @click="mediaToStop = ''" flat />
        <q-btn :label="$t('stop')" @click="stopMedia()" color="negative" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="mediaDeletePending">
    <q-card class="modal-confirm">
      <q-card-section
        class="row items-center text-bigger text-semibold text-negative q-pb-none"
      >
        <q-icon class="q-mr-sm" name="mmm-delete" />
        {{ $t('delete-media') }}
      </q-card-section>
      <q-card-section class="row items-center">
        {{
          $t('are-you-sure-delete', {
            mediaToDelete:
              props.list.find((m) => m.uniqueId === mediaToDelete)?.title ||
              (props.list.find((m) => m.uniqueId === mediaToDelete)?.fileUrl
                ? path.basename(
                    (
                      props.list.find(
                        (m) => m.uniqueId === mediaToDelete,
                      ) as any
                    ).fileUrl,
                  )
                : ''),
          })
        }}
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn :label="$t('cancel')" @click="mediaToDelete = ''" flat />
        <q-btn
          :label="$t('delete')"
          @click="deleteMedia()"
          color="negative"
          flat
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { errorCatcher, warningCatcher } from 'src/helpers/error-catcher';
import { getThumbnailUrl } from 'src/helpers/fs';
import { formatTime, isImage, isVideo } from 'src/helpers/mediaPlayback';
import { sendObsSceneEvent } from 'src/helpers/obs';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { useObsStateStore } from 'src/stores/obs-state';
import { DynamicMediaObject } from 'src/types/media';
import { computed, onUnmounted, ref } from 'vue';

const currentState = useCurrentStateStore();
const {
  currentCongregation,
  mediaPlayingAction,
  mediaPlayingCurrentPosition,
  mediaPlayingPanzoom,
  mediaPlayingSubtitlesUrl,
  mediaPlayingUniqueId,
  mediaPlayingUrl,
  selectedDate,
} = storeToRefs(currentState);

const bc = new BroadcastChannel('mediaPlayback');

const jwStore = useJwStore();
const { removeFromAdditionMediaMap } = jwStore;
const { customDurations } = storeToRefs(jwStore);

const obsState = useObsStateStore();
const { currentScene, obsConnectionState } = storeToRefs(obsState);

const { fileUrlToPath, fs, path } = electronApi;

const mediaDurationPopups = ref({} as { [key: string]: boolean });
const panzooms: { [key: string]: PanzoomObject } = {};
const mediaToStop = ref('');
const mediaStopPending = computed(() => !!mediaToStop.value);
const mediaToDelete = ref('');
const mediaDeletePending = computed(() => !!mediaToDelete.value);

const props = defineProps<{
  list: DynamicMediaObject[];
  media: DynamicMediaObject;
}>();

const imageLoadingError = (media: DynamicMediaObject) => {
  warningCatcher(
    'Unable to load thumbnail; reloading from file:' +
      media.thumbnailUrl +
      ' / ' +
      media.fileUrl,
  );
  media.thumbnailUrl = '';
  getThumbnailUrl(media.fileUrl)
    .then((thumbnailUrl) => {
      media.thumbnailUrl = thumbnailUrl;
    })
    .catch((error) => {
      media.thumbnailUrl = '';
      errorCatcher(error);
    });
};

const thumbnailFromMetadata = ref('');
function findThumbnailUrl() {
  if (!thumbnailFromMetadata.value) {
    setTimeout(() => {
      getThumbnailUrl(props.media.fileUrl).then((thumbnailUrl) => {
        if (!thumbnailFromMetadata.value) {
          thumbnailFromMetadata.value = thumbnailUrl;
        }
        if (!thumbnailFromMetadata.value) {
          findThumbnailUrl();
        }
      });
    }, 2000);
  }
}

if (props.media.isVideo && !props.media.thumbnailUrl) findThumbnailUrl();

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
    errorCatcher(error);
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
    errorCatcher(error);
  }
};

const seekTo = (newSeekTo: null | number) => {
  if (newSeekTo !== null) bc.postMessage({ seekTo: newSeekTo });
};

function zoomIn(elemId: string) {
  try {
    panzooms[elemId].zoomIn();
  } catch (error) {
    errorCatcher(error);
  }
}

function zoomOut(elemId: string) {
  try {
    panzooms[elemId].zoomOut();
    zoomReset(elemId);
  } catch (error) {
    errorCatcher(error);
  }
}

const zoomReset = (elemId: string, forced = false, animate = true) => {
  if (panzooms[elemId]?.getScale() <= 1.25 || forced)
    panzooms[elemId]?.reset({ animate });
};

function stopMedia() {
  // mediaPlayingAction.value = 'stop';
  destroyPanzoom(mediaPlayingUniqueId.value);
  unmuteBackgroundMusic();
  mediaPlayingAction.value = 'pause';
  mediaPlayingUrl.value = '';
  mediaPlayingUniqueId.value = '';
  mediaPlayingCurrentPosition.value = 0;
  mediaPlayingAction.value = '';
  mediaToStop.value = '';
}

const muteBackgroundMusic = () => {
  window.dispatchEvent(new Event('muteBackgroundMusic'));
};

const unmuteBackgroundMusic = () => {
  window.dispatchEvent(new Event('unmuteBackgroundMusic'));
};

const destroyPanzoom = (elemId: string) => {
  try {
    if (!panzooms[elemId] || !elemId) return;
    panzooms[elemId].resetStyle();
    panzooms[elemId].reset({ animate: false });
    panzooms[elemId].destroy();
    delete panzooms[elemId];
  } catch (e) {
    errorCatcher(e);
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
    errorCatcher(error);
  }
};

function deleteMedia() {
  if (!mediaToDelete.value) return;
  removeFromAdditionMediaMap(mediaToDelete.value);
  mediaToDelete.value = '';
}

onUnmounted(() => {
  Object.keys(panzooms).forEach((key) => {
    destroyPanzoom(key);
  });
});
</script>
