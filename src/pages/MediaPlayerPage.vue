<template>
  <!-- <template v-if="mediaPlayer.customBackground">
    {{ mediaPlayer.customBackground }}
  </template> -->
  <q-page-container
    class="q-electron-drag vertical-middle overflow-hidden"
    padding
    style="align-content: center; height: 100vh"
  >
    <q-resize-observer @resize="onResize" debounce="50" />
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
      mode="out-in"
      name="fade"
    >
      <q-img
        :src="mediaPlayer.url"
        @load="initiatePanzoom()"
        class="fitSnugly"
        fit="contain"
        id="mediaImage"
        no-spinner
        ref="mediaImage"
        v-if="isImage(mediaPlayer.url)"
      />
      <video
        @animationstart="playMedia()"
        class="fitSnugly"
        preload="metadata"
        ref="mediaElement"
        v-else-if="isVideo(mediaPlayer.url)"
      >
        <source :src="mediaPlayer.url" ref="mediaElementSource" />
        <track
          :src="mediaPlayer.subtitlesUrl"
          default
          kind="subtitles"
          v-if="mediaPlayer.subtitlesUrl && mediaPlayer.subtitlesVisible"
        />
      </video>
      <div v-else>
        <audio
          @loadedmetadata="playMedia()"
          ref="mediaElement"
          style="display: none"
          v-if="isAudio(mediaPlayer.url)"
        >
          <source :src="mediaPlayer.url" ref="mediaElementSource" />
        </audio>
        <template v-if="mediaPlayer.customBackground">
          <q-img
            :src="mediaPlayer.customBackground"
            class="fitSnugly"
            fit="contain"
            id="customBackground"
            no-spinner
            ref="customBackground"
          />
        </template>
        <div
          class="q-pa-md center"
          id="yeartext"
          v-else-if="!currentSettings?.jwlCompanionMode"
          v-html="
            (yeartexts[new Date().getFullYear()] &&
              yeartexts[new Date().getFullYear()][currentSettings?.lang]) ??
            ''
          "
        />
        <div
          id="yeartextLogoContainer"
          v-if="
            !currentSettings?.hideMediaLogo &&
            !currentSettings?.jwlCompanionMode
          "
        >
          <p id="yeartextLogo"></p>
        </div>
      </div>
    </transition>
  </q-page-container>
</template>
<script setup lang="ts">
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import {
  isAudio,
  isImage,
  isVideo,
  showMediaWindow,
} from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { Ref, ref, watch } from 'vue';

const currentState = useCurrentStateStore();
const { currentCongregation, currentSettings, mediaPlayer, selectedDate } =
  storeToRefs(currentState);

const jwStore = useJwStore();
const { customDurations, yeartexts } = storeToRefs(jwStore);

const panzoom: Ref<PanzoomObject | undefined> = ref();

const initiatePanzoom = () => {
  try {
    const imageElem = document.getElementById('mediaImage');
    if (!imageElem) return;
    panzoom.value = Panzoom(imageElem);
  } catch (e) {
    console.log(e);
  }
};

const $q = useQuasar();
let mediaElement: Ref<HTMLVideoElement | undefined> = ref();
const mediaImage: Ref<HTMLImageElement | undefined> = ref();
const panzoomOptions = { animate: true, duration: 1000 };

watch(
  () => mediaPlayer.value?.url,
  (newUrl) => {
    if (currentSettings.value?.jwlCompanionMode) showMediaWindow(!!newUrl);
  },
);

watch(
  () => currentCongregation.value,
  (newCongregation) => {
    if (!newCongregation) showMediaWindow(false);
  },
);

watch(
  () => [mediaPlayer.value?.scale, mediaPlayer.value?.x, mediaPlayer.value?.y],
  ([newScale, newX, newY]) => {
    try {
      if (!mediaElement.value) {
        const imageElem = document.getElementById('mediaImage');
        const width = imageElem?.clientWidth || 0;
        const height = imageElem?.clientHeight || 0;
        panzoom.value?.zoom(newScale, panzoomOptions);
        if (width > 0 && height > 0)
          panzoom.value?.pan(newX * width, newY * height, panzoomOptions);
      }
    } catch (e) {
      console.log(e);
    }
  },
);

watch(
  () => mediaPlayer.value?.action,
  (newAction) => {
    try {
      if (!mediaElement.value) return;
      if (newAction.toLowerCase().includes('pause')) {
        mediaElement.value.pause();
        // mediaElement.value.currentTime = mediaPlayer.value.currentPosition;
      } else if (newAction.toLowerCase().includes('play')) {
        mediaElement.value.play().catch((error) => {
          console.error(error);
        });
      }
    } catch (e) {
      console.log(e);
    }
  },
);

watch(
  () => mediaPlayer.value?.seekTo,
  (newPosition) => {
    try {
      if (!mediaElement.value) return;
      mediaElement.value.currentTime = newPosition;
    } catch (e) {
      console.log(e);
    }
  },
);

const playMedia = () => {
  try {
    if (!mediaElement.value) {
      return;
    }

    // mediaElement.value.onpause = () => {
    //   mediaPlayer.value.seekTo = mediaElement.value?.currentTime || 0;
    // };

    mediaElement.value.onended = () => {
      mediaPlayer.value.currentPosition = 0;
      mediaPlayer.value.seekTo = 0;
      mediaPlayer.value.url = '';
      mediaPlayer.value.uniqueId = '';
      mediaPlayer.value.action =
        mediaPlayer.value.action === 'backgroundMusicPlay'
          ? 'backgroundMusicCurrentEnded'
          : '';
    };

    mediaElement.value.ontimeupdate = () => {
      try {
        const currentTime = mediaElement.value?.currentTime || 0;
        mediaPlayer.value.currentPosition = currentTime;
        // mediaPlayer.value.seekTo = currentTime;
        if (
          customDurations?.value?.[currentCongregation.value]?.[
            selectedDate.value
          ]?.[mediaPlayer.value.uniqueId]
        ) {
          const customStartStop = customDurations?.value?.[
            currentCongregation.value
          ]?.[selectedDate.value]?.[mediaPlayer.value.uniqueId] ?? { max: 0 };
          if (currentTime >= customStartStop.max) {
            // updateMediaPlayer('currentPosition', customStartStop.min);
            mediaPlayer.value.url = '';
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    let customStartStop = { max: 0, min: 0 };
    if (
      customDurations?.value?.[currentCongregation.value]?.[
        selectedDate.value
      ]?.[mediaPlayer.value.uniqueId]
    ) {
      customStartStop = customDurations?.value?.[currentCongregation.value]?.[
        selectedDate.value
      ]?.[mediaPlayer.value.uniqueId] ?? { min: 0 };
    }
    mediaElement.value.currentTime = customStartStop.min;
    mediaElement.value.play().catch((error) => {
      console.error(error);
    });
  } catch (e) {
    console.error(e);
  }
};

function onResize(size: { height: number; width: number }) {
  $q.notify({
    badgeStyle: 'display: none',
    group: 'resize',
    message: size.width + 'x' + size.height,
    timeout: 500,
    type: 'info',
  });
}
</script>
