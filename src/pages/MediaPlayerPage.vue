<template>
  <!-- {{ mediaPlayer }} -->
  <q-page-container class="q-electron-drag vertical-middle overflow-hidden" padding
    style="align-content: center; height: 100vh;">
    <q-resize-observer @resize="onResize" debounce="50" />
    <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in"
      name="fade">
      <q-img :src="mediaPlayer.url" @load="initiatePanzoom()" class="fitSnugly" fit="contain" id="mediaImage"
        no-spinner ref="mediaImage" v-if="isImage(mediaPlayer.url)" />
      <video @animationstart="playMedia()" class="fitSnugly" preload="metadata" ref="mediaElement"
        v-else-if="isVideo(mediaPlayer.url)">
        <source :src="mediaPlayer.url" ref="mediaElementSource" />
      </video>
      <div v-else>
        <audio @loadedmetadata="playMedia()" ref="mediaElement" style="display: none;" v-if="isAudio(mediaPlayer.url)">
          <source :src="mediaPlayer.url" ref="mediaElementSource" />
        </audio>
        <div class="q-pa-md center" id="yeartext" v-html="(yeartexts[new Date().getFullYear()] && yeartexts[new Date().getFullYear()][currentSettings?.lang]) ?? ''"
          v-if="!currentSettings?.jwlCompanionMode" />
        <div id="yeartextLogoContainer" v-if="!currentSettings?.hideMediaLogo">
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
import { isAudio, isImage, isVideo } from 'src/helpers/mediaPlayback';
import { Ref, ref, watch } from 'vue';

import { electronApi } from '../helpers/electron-api';
import { useCurrentStateStore } from '../stores/current-state';
import { useJwStore } from '../stores/jw';

const currentState = useCurrentStateStore();
const { currentCongregation, currentSettings, mediaPlayer, selectedDate } = storeToRefs(currentState);

const jwStore = useJwStore();
const { customDurations, yeartexts } = storeToRefs(jwStore);

const { toggleMediaWindow } = electronApi;

const panzoom: Ref<PanzoomObject | undefined> = ref();

const initiatePanzoom = () => {
  const imageElem = document.getElementById('mediaImage');
  if (!imageElem) return;
  panzoom.value = Panzoom(imageElem);
};

const $q = useQuasar();
let mediaElement: Ref<HTMLVideoElement | undefined> = ref();
const mediaImage: Ref<HTMLImageElement | undefined> = ref();
const panzoomOptions = { animate: true, duration: 1000 };

watch(mediaPlayer, (newVal) => {
  if (currentSettings.value?.jwlCompanionMode) {
    toggleMediaWindow(newVal.url ? 'show' : 'hide');
  }
  if (!mediaElement.value) {
    const imageElem = document.getElementById('mediaImage');
    const width = imageElem?.clientWidth || 0;
    const height = imageElem?.clientHeight || 0;
    panzoom.value?.zoom(newVal.scale, panzoomOptions);
    if (width > 0 && height > 0) panzoom.value?.pan(newVal.x * width, newVal.y * height, panzoomOptions);
  } else {
    if (newVal.action === 'pause') {
      mediaElement.value?.pause();
      mediaElement.value.currentTime = newVal.currentPosition;
    } else if (newVal.action === 'play') {
      mediaElement.value?.play();
    }
  }
}, { deep: true });

const playMedia = () => {
  if (!mediaElement.value) {
    return;
  }

  mediaElement.value.onpause = () => {
    mediaPlayer.value.currentPosition = mediaElement.value?.currentTime || 0;
  };
  mediaElement.value.onended = () => {
    mediaPlayer.value.currentPosition = 0;
    mediaPlayer.value.url = '';
    mediaPlayer.value.uniqueId = '';
  };
  mediaElement.value.ontimeupdate = () => {
    mediaPlayer.value.currentPosition = mediaElement.value?.currentTime || 0;
    if (customDurations.value[currentCongregation.value][selectedDate.value][mediaPlayer.value.uniqueId]) {
      const customStartStop = customDurations.value[currentCongregation.value][selectedDate.value][mediaPlayer.value.uniqueId];
      if (mediaElement.value?.currentTime && mediaElement.value?.currentTime >= customStartStop.max) {
        mediaPlayer.value.currentPosition = customStartStop.min;
        mediaPlayer.value.url = '';
      }
    }
  };
  mediaPlayer.value.action = 'play';
  let customStartStop = { max: 0, min: 0 };
  if (customDurations.value[currentCongregation.value][selectedDate.value][mediaPlayer.value.uniqueId]) {
    customStartStop = customDurations.value[currentCongregation.value][selectedDate.value][mediaPlayer.value.uniqueId];
  }
  mediaElement.value.currentTime = customStartStop.min;
  mediaElement.value.play();
};

function onResize(size: { height: number; width: number; }) {
  $q.notify({
    badgeStyle: 'display: none',
    group: 'resize',
    message: size.width + 'x' + size.height,
    timeout: 500,
    type: 'info',
  });
}

</script>
