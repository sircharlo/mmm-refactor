<template>
  <q-btn
    :disable="disabled"
    :flat="!disabled"
    :label="musicPlaying ? musicRemainingTime : ''"
    :outline="disabled"
    @click="musicPopup = false"
    class="q-ml-sm"
    icon="mdi-music"
    no-caps
    rounded
    v-if="currentSettings?.enableMusicButton"
  >
    <q-tooltip v-if="!disabled && !musicPopup">
      {{ $t('setupWizard.backgroundMusic') }}
    </q-tooltip>
    <q-popup-proxy
      anchor="top middle"
      self="bottom middle"
      v-model="musicPopup"
    >
      <q-card class="non-selectable">
        <q-card-section>
          <div class="text-overline">
            {{ $t('setupWizard.backgroundMusic') }}
          </div>
          <div class="text-h5">
            {{ musicPlaying ? musicRemainingTime : 'Inactive' }}
          </div>
          <div class="text-caption text-grey-9" v-if="musicPlaying">
            {{ $t('current-song-remaining') }} {{ currentSongRemainingTime }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions>
          <q-btn
            :disabled="mediaPlaying"
            @click="playMusic"
            flat
            v-close-popup
            v-if="!musicPlaying"
            >{{ $t('play-music') }}</q-btn
          >
          <q-btn
            :disable="musicStopping"
            @click="stopMusic"
            flat
            v-close-popup
            v-else
            >{{ $t('stop-music') }}</q-btn
          >
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
    <q-badge
      :color="
        musicPlaying ? (musicStopping ? 'warning' : 'positive') : 'negative'
      "
      floating
      rounded
      style="margin-top: 1.25em; margin-right: 0.25em"
    />
  </q-btn>
  <audio class="hidden" controls ref="musicPlayer">
    <source ref="musicPlayerSource" type="audio/mpeg" />
  </audio>
</template>

<script setup lang="ts">
import klawSync from 'klaw-sync';
import { storeToRefs } from 'pinia';
import { date } from 'quasar';
import { getFileUrl, getPublicationDirectoryContents } from 'src/helpers/fs';
import { formatTime } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

defineProps<{
  disabled?: boolean;
}>();

const currentState = useCurrentStateStore();
const { currentSettings, mediaPlaying, selectedDateObject } =
  storeToRefs(currentState);
const { getSettingValue } = currentState;
const musicPlayer = ref<HTMLAudioElement | undefined>();
const musicPlayerSource = ref<HTMLSourceElement | undefined>();
const musicPlaying = ref(false);
const fadeOutTimer = ref();
const musicStopping = ref(false);
const musicStoppedAutomatically = ref(false);
const songList = ref([] as klawSync.Item[]);
const currentSongRemainingTime = ref('..:..');
const timeRemainingBeforeMusicStop = ref();

function stopMusic() {
  if (!musicPlayer.value) return;
  musicStopping.value = true;
  if (musicPlayer.value.volume > 0) {
    const fadeOutTime = 7500; // 7.5 seconds
    const fadeInterval = 50;
    musicPlayer.value.volume -= Math.min(
      musicPlayer.value.volume,
      100 / (fadeOutTime / fadeInterval) / 100,
    );
    fadeOutTimer.value = setTimeout(stopMusic, fadeInterval);
  } else {
    musicPlayer.value.pause();
    musicPlaying.value = false;
    musicStopping.value = false;
  }
}

const getNextSongUrl = () => {
  if (!songList.value.length) {
    songList.value = getPublicationDirectoryContents(
      { langwritten: 'E', pub: 'sjjm' },
      'mp3',
    ).sort(() => Math.random() - 0.5);
  }
  if (!songList.value.length) return '';
  let nextSong = songList.value.shift() as klawSync.Item;
  songList.value = songList.value.concat(nextSong);
  return getFileUrl(nextSong.path);
};

function playMusic() {
  if (!musicPlayer.value || !musicPlayerSource.value) return;
  musicPlayer.value.volume =
    (getSettingValue('musicVolume') as number) / 100 ?? 1;
  musicPlayerSource.value.src = getNextSongUrl();
  musicPlayer.value.load();
  musicPlayer.value.play().then(() => {
    musicPlaying.value = true;
  });
  musicPlayer.value.onended = () => {
    if (!musicPlayer.value || !musicPlayerSource.value) return;
    musicPlayerSource.value.src = getNextSongUrl();
    musicPlayer.value.load();
    musicPlayer.value.play();
  };
  musicPlayer.value.ontimeupdate = () => {
    if (!musicPlayer.value) return;
    const remainingTime = Math.floor(
      musicPlayer.value.duration - musicPlayer.value.currentTime,
    );
    currentSongRemainingTime.value = formatTime(remainingTime);
    const timeBeforeMeeting = remainingTimeBeforeMeetingStart();
    if (timeBeforeMeeting && !musicStoppedAutomatically.value) {
      timeRemainingBeforeMusicStop.value = (timeBeforeMeeting as number) - 60;
      if (timeRemainingBeforeMusicStop.value <= 0 && !musicStopping.value) {
        stopMusic();
        musicStoppedAutomatically.value = true;
      }
    }
  };
}

const meetingDay = ref(false);

onMounted(() => {
  meetingDay.value =
    selectedDateObject.value?.today && !!selectedDateObject.value?.meeting;
  if (
    currentSettings.value?.enableMusicButton &&
    currentSettings.value?.autoStartMusic &&
    meetingDay.value
  ) {
    playMusic();
  }
});

/**
 * Calculates the remaining time before the meeting starts based on the selected meeting day and start time settings.
 *
 * @return {string|null} The remaining time in hours and minutes, optionally formatted, or null if there is no meeting day selected.
 */
const remainingTimeBeforeMeetingStart = (formatted?: boolean) => {
  if (meetingDay.value) {
    const now = new Date();
    const weMeeting = selectedDateObject.value?.meeting === 'we';
    const meetingStartTime = weMeeting
      ? (getSettingValue('weStartTime') as string)
      : (getSettingValue('mwStartTime') as string);
    const [hours, minutes] = meetingStartTime.split(':').map(Number);
    const meetingStartDateTime = new Date(now);
    meetingStartDateTime.setHours(hours, minutes, 0, 0);
    const dateDiff = date.getDateDiff(meetingStartDateTime, now, 'seconds');
    if (dateDiff < 0) {
      return null;
    } else {
      if (formatted) {
        return formatTime(dateDiff);
      } else {
        return dateDiff;
      }
    }
  } else {
    return null;
  }
};

const musicRemainingTime = computed(() => {
  if (!musicPlayer.value) return '..:..';
  if (musicStopping.value) return ref(t('music.stopping')).value;
  if (meetingDay.value && timeRemainingBeforeMusicStop.value > 0)
    return formatTime(timeRemainingBeforeMusicStop.value);
  return currentSongRemainingTime.value;
});

const musicPopup = ref(false);

watch(
  () => currentSettings.value?.enableMusicButton,
  (newMusicButtonEnabled) => {
    console.log('newMusicButtonEnabled', newMusicButtonEnabled);
    if (!newMusicButtonEnabled) stopMusic();
  },
);
</script>
