<template>
  <q-btn
    :color="musicPlaying && musicStopping ? 'negative' : 'white-transparent'"
    :disable="disabled"
    :outline="disabled"
    :style="musicPlaying ? 'min-width: 110px;' : ''"
    @click="musicPopup = true"
    class="super-rounded"
    no-caps
    rounded
    unelevated
    v-if="currentSettings?.enableMusicButton"
  >
    <q-icon name="mmm-music-note" />
    <div class="q-ml-sm" v-if="musicPlaying">
      {{ musicRemainingTime }}
    </div>

    <q-tooltip :delay="2000" v-if="!disabled && !musicPopup">
      {{ $t('setupWizard.backgroundMusic') }}
    </q-tooltip>
    <!-- <q-popup-proxy
      :offset="[0, 8]"
      @before-hide="musicPopup = false"
      @before-show="musicPopup = true"
      anchor="top middle"
      class="round-card"
      flat
      self="bottom middle"
      v-if="!disabled"
    > -->
    <q-dialog position="bottom" v-model="musicPopup">
      <q-card flat>
        <q-card-section>
          <div class="card-title">
            {{ $t('setupWizard.backgroundMusic') }}
          </div>
          <q-slide-transition>
            <div v-if="musicPlaying">
              <div>
                <p class="card-section-title text-dark-grey">
                  {{ $t('current-song') }}
                </p>
                <p>
                  <span class="text-weight-medium">{{
                    musicPlayingTitle
                  }}</span>
                  <span class="text-grey">
                    – {{ currentSongRemainingTime }}</span
                  >
                </p>
              </div>
              <q-separator class="bg-accent-200 q-mb-md" />
            </div>
          </q-slide-transition>
          <div class="row items-center">
            <div class="col-6">
              <div class="row text-subtitle1 text-weight-medium">
                {{ musicPlaying ? musicRemainingTime : $t('not-playing') }}
              </div>
              <div
                class="row text-dark-grey"
                v-if="
                  musicPlaying &&
                  !musicStopping &&
                  meetingDay &&
                  timeRemainingBeforeMusicStop > 0
                "
              >
                {{ t('until-meeting-starts') }}
              </div>
            </div>
            <div class="col-6">
              <q-btn
                :disabled="mediaPlaying"
                @click="playMusic"
                class="full-width"
                color="primary"
                unelevated
                v-if="!musicPlaying"
                >{{ $t('play-music') }}</q-btn
              >
              <q-btn
                :disable="musicStopping"
                @click="stopMusic"
                class="full-width"
                color="primary"
                unelevated
                v-else
                >{{ $t('stop-music') }}</q-btn
              >
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- </q-popup-proxy> -->
  </q-btn>
</template>

<script setup lang="ts">
import klawSync from 'klaw-sync';
import { storeToRefs } from 'pinia';
import { date } from 'quasar';
import { electronApi } from 'src/helpers/electron-api';
import { getFileUrl, getPublicationDirectoryContents } from 'src/helpers/fs';
import { formatTime } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { fileUrlToPath, parseFile, path } = electronApi;

defineProps<{
  disabled?: boolean;
}>();

const currentState = useCurrentStateStore();
const { currentSettings, mediaPlaying, selectedDateObject } =
  storeToRefs(currentState);
const musicPlayer = ref<HTMLAudioElement>(document.createElement('audio'));
const musicPlayerSource = ref<HTMLSourceElement>(
  document.createElement('source'),
);
const musicPlayingTitle = ref('');
const musicPlaying = ref(false);
const fadeOutTimer = ref();
const musicStopping = ref(false);
const musicStoppedAutomatically = ref(false);
const songList = ref([] as klawSync.Item[]);
const currentSongRemainingTime = ref('..:..');
const timeRemainingBeforeMusicStop = ref();

function stopMusic() {
  try {
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
      document.body.removeChild(musicPlayer.value);
    }
  } catch (error) {
    console.error(error);
  }
}

const getNextSongUrl = () => {
  try {
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
  } catch (error) {
    console.error(error);
    return '';
  }
};

/**
 * Calculates the remaining time before the meeting starts based on the selected meeting day and start time settings.
 *
 * @return {string|null} The remaining time in hours and minutes, optionally formatted, or null if there is no meeting day selected.
 */
const remainingTimeBeforeMeetingStart = (formatted?: boolean) => {
  try {
    if (meetingDay.value) {
      const now = new Date();
      const weMeeting = selectedDateObject.value?.meeting === 'we';
      const meetingStartTime = weMeeting
        ? currentSettings.value?.weStartTime
        : currentSettings.value?.mwStartTime;
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
  } catch (error) {
    console.error(error);
    return null;
  }
};

function playMusic() {
  try {
    if (!currentSettings.value?.enableMusicButton || musicPlaying.value) return;
    musicPlayer.value.appendChild(musicPlayerSource.value);
    musicPlayer.value.style.display = 'none';
    document.body.appendChild(musicPlayer.value);
    musicPlayer.value.volume =
      (currentSettings.value?.musicVolume ?? 100) / 100 ?? 1;
    musicPlayerSource.value.src = getNextSongUrl();

    (async () => {
      try {
        const metadata = await parseFile(
          fileUrlToPath(musicPlayerSource.value.src),
        );
        console.log(metadata);
        musicPlayingTitle.value =
          metadata.common.title ?? path.basename(musicPlayerSource.value?.src); // basename
      } catch (error) {
        console.error(error);
        musicPlayingTitle.value =
          path.basename(musicPlayerSource.value?.src) ?? '';
      }
    })();

    musicPlayer.value.load();
    musicPlayer.value
      .play()
      .then(() => {
        musicPlaying.value = true;
      })
      .catch((error) => {
        console.error(error);
      });
    musicPlayer.value.onended = () => {
      if (!musicPlayer.value || !musicPlayerSource.value) return;
      musicPlayerSource.value.src = getNextSongUrl();
      musicPlayer.value.load();
      musicPlayer.value.play().catch((error) => {
        console.error(error);
      });
    };
    musicPlayer.value.ontimeupdate = () => {
      try {
        if (!musicPlayer.value) return;
        const remainingTime = Math.floor(
          musicPlayer.value.duration - musicPlayer.value.currentTime,
        );
        currentSongRemainingTime.value = formatTime(remainingTime);
        const timeBeforeMeeting = remainingTimeBeforeMeetingStart();
        if (timeBeforeMeeting && !musicStoppedAutomatically.value) {
          timeRemainingBeforeMusicStop.value =
            (timeBeforeMeeting as number) - 60;
          if (timeRemainingBeforeMusicStop.value <= 0 && !musicStopping.value) {
            stopMusic();
            musicStoppedAutomatically.value = true;
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
  } catch (error) {
    console.error(error);
  }
}

const meetingDay = ref(false);

watch(
  () => [selectedDateObject.value?.today, selectedDateObject.value?.meeting],
  ([newToday, newMeeting]) => {
    try {
      meetingDay.value = !!newToday && !!newMeeting;
      const timeBeforeMeetingStart =
        (remainingTimeBeforeMeetingStart() as number) ?? 0;
      if (
        currentSettings.value?.enableMusicButton &&
        currentSettings.value?.autoStartMusic &&
        meetingDay.value &&
        timeBeforeMeetingStart > 90
      ) {
        playMusic();
      }
    } catch (error) {
      console.error(error);
    }
  },
  { immediate: true },
);

const musicRemainingTime = computed(() => {
  try {
    if (!musicPlayer.value) return '..:..';
    if (musicStopping.value) return ref(t('music.stopping')).value;
    if (meetingDay.value && timeRemainingBeforeMusicStop.value > 0)
      return formatTime(timeRemainingBeforeMusicStop.value);
    return currentSongRemainingTime.value;
  } catch (error) {
    console.error(error);
    return '..:..';
  }
});

const musicPopup = ref(false);

watch(
  () => currentSettings.value?.enableMusicButton,
  (newMusicButtonEnabled) => {
    if (!newMusicButtonEnabled) stopMusic();
  },
);

const toggleMusicListener = () => {
  try {
    if (!currentSettings.value?.enableMusicButton) return;
    if (musicPlaying.value) {
      stopMusic();
    } else {
      playMusic();
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  window.addEventListener('toggleMusic', toggleMusicListener);
});

onUnmounted(() => {
  window.removeEventListener('toggleMusic', toggleMusicListener);
});
</script>
