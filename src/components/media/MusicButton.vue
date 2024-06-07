<template>
  <q-btn icon="mdi-music" v-if="currentSettings?.enableMusicButton" @click="musicPopup = false" :label="musicPlaying ? musicRemainingTime : ''" :flat="!disabled"
    :outline="disabled" :disable="disabled">
    <q-tooltip v-if="!disabled && !musicPopup">
      Background music
    </q-tooltip>
    <q-popup-proxy anchor="top middle" self="bottom middle" v-model="musicPopup">
      <q-card>
        <q-card-section>
          <div class="text-overline">Background music</div>
          <div class="text-h5">{{ musicPlaying ? musicRemainingTime : 'Inactive' }}</div>
          <div class="text-caption text-grey-9" v-if="musicPlaying">
            Current song remaining: {{ currentSongRemainingTime }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions>
          <q-btn flat @click="playMusic" v-if="!musicPlaying" :disabled="mediaPlaying" v-close-popup>Play music</q-btn>
          <q-btn flat :disable="musicStopping" @click="stopMusic" v-close-popup v-else>Stop music</q-btn>
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
  </q-btn>
  <audio class="hidden" ref="musicPlayer" controls>
    <source ref="musicPlayerSource" type="audio/mpeg" />
  </audio>
</template>

<script lang="ts">
import { Ref, computed, defineComponent, ref } from 'vue';
import { getFileUrl, getPublicationDirectoryContents } from 'src/helpers/fs';
import { formatTime } from 'src/helpers/mediaPlayback';
import { storeToRefs } from 'pinia';
import { useCurrentStateStore } from 'stores/current-state';
import { isMeetingDay, isWeMeetingDay } from 'src/helpers/date';
import { date } from 'quasar';
import klawSync from 'klaw-sync';
const currentState = useCurrentStateStore();
const { mediaPlaying, currentSettings } = storeToRefs(currentState);
const { getSettingValue } = currentState

const musicPlayer: Ref<HTMLAudioElement | undefined> = ref();
const musicPlayerSource: Ref<HTMLSourceElement | undefined> = ref();
const musicPlaying = ref(false);
const fadeOutTimer = ref();
const musicStopping = ref(false);
const songList = ref([] as klawSync.Item[]);
const currentSongRemainingTime = ref('..:..')

function stopMusic() {
  if (!musicPlayer.value) return
  musicStopping.value = true
  if (musicPlayer.value.volume > 0) {
    const fadeOutTime = 7500; // 7.5 seconds
    const fadeInterval = 50;
    musicPlayer.value.volume -= Math.min(musicPlayer.value.volume, 100 / (fadeOutTime / fadeInterval) / 100);
    fadeOutTimer.value = setTimeout(stopMusic, fadeInterval);
  } else {
    musicPlayer.value.pause();
    musicPlaying.value = false
    musicStopping.value = false
  }
}

const getNextSongUrl = () => {
  if (!songList.value.length) {
    songList.value = getPublicationDirectoryContents({ pub: 'sjjm', langwritten: 'E' }, 'mp3').sort(() => Math.random() - 0.5);
  }
  if (!songList.value.length) return '';
  let nextSong = songList.value.shift() as klawSync.Item;
  songList.value = songList.value.concat(nextSong)
  return getFileUrl(nextSong.path);
}
function playMusic() {
  if (!musicPlayer.value || !musicPlayerSource.value) return
  musicPlayer.value.volume = 1;
  musicPlayerSource.value.src = getNextSongUrl();
  musicPlayer.value.load();
  musicPlayer.value.play().then(() => {
    musicPlaying.value = true
  });
  musicPlayer.value.onended = () => {
    if (!musicPlayer.value || !musicPlayerSource.value) return
    musicPlayerSource.value.src = getNextSongUrl();
    musicPlayer.value.load();
    musicPlayer.value.play();
  }
  musicPlayer.value.ontimeupdate = () => {
    if (!musicPlayer.value) return
    const remainingTime = Math.floor(musicPlayer.value.duration - musicPlayer.value.currentTime);
    currentSongRemainingTime.value = Number.isNaN(remainingTime) ? '..:..' : formatTime(remainingTime)
  }
}

const musicRemainingTime = computed(() => {
  if (!musicPlayer.value) return '..:..'
  let remainingTime = currentSongRemainingTime.value
  const now = new Date();
  const meetingDay = isMeetingDay(now);
  if (meetingDay) {
    const weMeeting = isWeMeetingDay(now);
    const meetingStartTime = weMeeting ? getSettingValue('weStartTime') as string : getSettingValue('mwStartTime') as string
    const [hours, minutes] = meetingStartTime.split(':').map(Number);
    const meetingStartDateTime = new Date(now);
    meetingStartDateTime.setHours(hours, minutes, 0, 0);
    remainingTime = formatTime(date.getDateDiff(meetingStartDateTime, now, 'seconds'))
  }
  return musicStopping.value ? 'Stopping...' : remainingTime
});



export default defineComponent({
  name: 'MusicButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  setup() {
    return {
      musicPlaying,
      musicRemainingTime,
      musicPopup: ref(false),
      currentSongRemainingTime,
      musicStopping,
      playMusic,
      stopMusic,
      musicPlayer,
      musicPlayerSource,
      mediaPlaying,
      currentSettings
    };
  },
});
</script>
