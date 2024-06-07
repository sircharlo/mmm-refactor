<template>
  {{ mediaPlayer }}
  <!-- <pre>{{ selectedDate }} - {{ customDuration }}</pre>
  <pre>{{ customDurations[currentCongregation][selectedDate] }}</pre> -->
  <q-page-container padding class="q-electron-drag vertical-middle overflow-hidden"
    style="align-content: center; height: 100vh;">
    <q-resize-observer @resize="onResize" debounce="50" />
    <transition name="fade" mode="out-in" appear enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut">
      <q-img class="fitSnugly" fit="contain" ref="mediaImage" id="mediaImage" @load="initiatePanzoom()"
        :src="mediaPlayer.url" v-if="isImage(mediaPlayer.url)" no-spinner />
      <video class="fitSnugly" preload="metadata" ref="mediaElement" @animationstart="playMedia()"
        v-else-if="isVideo(mediaPlayer.url)">
        <source ref="mediaElementSource" :src="mediaPlayer.url" />
      </video>
      <!-- eslint-disable -->
      <div v-else>
        <audio style="display: none;" ref="mediaElement" v-if="isAudio(mediaPlayer.url)" @loadedmetadata="playMedia()">
          <source ref="mediaElementSource" :src="mediaPlayer.url" />
        </audio>
        <div class="q-pa-md center" id="yeartext" v-html="yeartext" />
        <!-- eslint-enable -->
        <div id="yeartextLogoContainer">
          <p id="yeartextLogo"></p>
        </div>
      </div>
    </transition>
    <!-- {{ mediaPlayer }} -->
  </q-page-container>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, watch } from 'vue'
import { useCurrentStateStore } from 'stores/current-state';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar'
const currentState = useCurrentStateStore();
const { currentSettings, mediaPlayer, currentCongregation, selectedDate } = storeToRefs(currentState);


import { useJwStore } from 'stores/jw';
const jwStore = useJwStore();
const { yeartexts, customDurations } = storeToRefs(jwStore);



import { isAudio, isImage, isVideo } from 'src/helpers/mediaPlayback';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { SettingsValues } from 'src/types/settings';


const yeartext: Ref<string> = ref('')
watch(currentSettings, (newVal: SettingsValues) => {
  const lang = newVal?.lang as string
  const year = new Date().getFullYear()
  yeartext.value = yeartexts.value[year][lang]
})
watch(yeartexts, (newVal) => {
  const lang = currentSettings.value.lang as string
  const year = new Date().getFullYear()
  yeartext.value = newVal[year][lang]
})

const panzoom: Ref<PanzoomObject | undefined> = ref()

const initiatePanzoom = () => {
  const imageElem = document.getElementById('mediaImage')
  if (!imageElem) return
  panzoom.value = Panzoom(imageElem)
}

export default defineComponent({
  setup() {
    const $q = useQuasar()
    let mediaElement: Ref<HTMLVideoElement | undefined> = ref();
    const mediaImage: Ref<HTMLImageElement | undefined> = ref();
    const panzoomOptions = { animate: true, duration: 1000 }
    watch(mediaPlayer, (newVal) => {
      if (!mediaElement.value) {
        const imageElem = document.getElementById('mediaImage')
        const width = imageElem?.clientWidth || 0
        const height = imageElem?.clientHeight || 0
        panzoom.value?.zoom(newVal.scale, panzoomOptions)
        if (width > 0 && height > 0) panzoom.value?.pan(newVal.x * width, newVal.y * height, panzoomOptions)
      } else {
        if (newVal.action === 'pause') {
          mediaElement.value?.pause()
          mediaElement.value.currentTime = newVal.currentPosition
        } else if (newVal.action === 'play') {
          mediaElement.value?.play()
        }
      }
    }, { deep: true })
    const playMedia = () => {
      if (!mediaElement.value) {
        return
      }

      mediaElement.value.onpause = () => {
        mediaPlayer.value.currentPosition = mediaElement.value?.currentTime || 0
      }
      mediaElement.value.onended = () => {
        mediaPlayer.value.currentPosition = 0
        mediaPlayer.value.url = ''
        mediaPlayer.value.uniqueId = ''
      }
      mediaElement.value.ontimeupdate = () => {
        mediaPlayer.value.currentPosition = mediaElement.value?.currentTime || 0
        if (customDurations.value[currentCongregation.value][selectedDate.value][mediaPlayer.value.uniqueId]) {
          customStartStop = customDurations.value[currentCongregation.value][selectedDate.value][mediaPlayer.value.uniqueId]
          if (mediaElement.value?.currentTime && mediaElement.value?.currentTime >= customStartStop.max) {
            mediaPlayer.value.currentPosition = customStartStop.min
            mediaPlayer.value.url = ''
          }
        }
      }
      mediaPlayer.value.action = 'play'
      let customStartStop = { min: 0, max: 0 }
      if (customDurations.value[currentCongregation.value][selectedDate.value][mediaPlayer.value.uniqueId]) {
        customStartStop = customDurations.value[currentCongregation.value][selectedDate.value][mediaPlayer.value.uniqueId]
      }
      mediaElement.value.currentTime = customStartStop.min
      mediaElement.value.play()
    }

    return {
      currentSettings,
      mediaPlayer,
      playMedia,
      mediaElement,
      mediaImage,
      initiatePanzoom,
      yeartext,
      isImage,
      isVideo,
      isAudio,
      onResize(size: { width: number; height: number; }) {
        $q.notify({
          group: 'resize', // required to be updatable
          timeout: 500, // we want to be in control when it gets dismissed
          message: size.width + 'x' + size.height,
          badgeStyle: 'display: none',
          type: 'info'
        })
      },
      // customDuration,
      // selectedDate,
      // currentCongregation
    }
  }
})


</script>
