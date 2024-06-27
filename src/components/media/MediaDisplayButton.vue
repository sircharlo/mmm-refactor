<template>
  <!-- :color="mediaPlayer.windowVisible ? '' : 'red-5'" -->
  <q-btn
    :disable="!!disabled"
    :flat="!disabled"
    :icon="mediaPlayer.windowVisible ? 'mdi-television' : 'mdi-television-off'"
    :outline="!!disabled"
    @click="mediaDisplayPopup = false"
    class="q-ml-sm"
    rounded
    v-if="currentSettings?.enableMediaDisplayButton"
  >
    <q-tooltip
      anchor="bottom left"
      self="top left"
      v-if="!disabled && !mediaDisplayPopup"
    >
      {{ $t('media-display') }}
    </q-tooltip>
    <q-popup-proxy
      anchor="bottom right"
      self="top right"
      v-if="!disabled"
      v-model="mediaDisplayPopup"
    >
      <q-card class="non-selectable">
        <q-card-section>
          <div class="text-overline">{{ $t('media-display') }}</div>
          <div class="text-h5 text-primary" v-if="mediaPlayer.windowVisible">
            {{ $t('projecting') }}
          </div>
          <div class="text-h5 text-negative" v-else>{{ $t('inactive') }}</div>
          <div class="text-caption text-grey">
            {{
              $t(
                screenList.length < 2 || screenPreferences.preferWindowed
                  ? 'windowed'
                  : 'external-screen',
              )
            }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pb-none">
          <template :key="screen.id" v-for="(screen, index) in screenList">
            <q-btn
              :color="
                screenList.length < 2 ||
                screenPreferences.preferredScreenNumber === index
                  ? 'primary'
                  : ''
              "
              :disable="screenList.length < 2 || screen.mainWindow"
              :icon="
                screen.mainWindow
                  ? 'mdi-monitor-dashboard'
                  : screenPreferences.preferredScreenNumber === index
                    ? 'mdi-monitor-shimmer'
                    : 'mdi-monitor'
              "
              :text-color="
                screenList.length < 2 ||
                screenPreferences.preferredScreenNumber === index
                  ? ''
                  : 'primary'
              "
              @click="screenPreferences.preferredScreenNumber = index"
            />
          </template>
        </q-card-section>
        <q-card-section>
          <q-btn
            :color="
              screenList.length < 2 || screenPreferences.preferWindowed
                ? 'primary'
                : ''
            "
            :disable="screenList.length < 2"
            :text-color="
              screenList.length < 2 || screenPreferences.preferWindowed
                ? ''
                : 'primary'
            "
            @click="screenPreferences.preferWindowed = true"
            icon="mdi-window-restore"
          />
          <q-btn
            :color="
              screenList.length >= 2 && !screenPreferences.preferWindowed
                ? 'primary'
                : ''
            "
            :disable="screenList.length < 2"
            :text-color="
              screenList.length >= 2 && !screenPreferences.preferWindowed
                ? ''
                : 'primary'
            "
            @click="screenPreferences.preferWindowed = false"
            icon="mdi-overscan"
          />
        </q-card-section>
        <q-card-section>
          <q-btn
            :color="mediaPlayer.customBackground ? 'negative' : 'primary'"
            :icon="
              'mdi-image' + (mediaPlayer.customBackground ? '-remove' : '')
            "
            @click="chooseCustomBackground(!!mediaPlayer.customBackground)"
          >
            <q-tooltip
              >{{
                mediaPlayer.customBackground
                  ? $t('reset-custom-background')
                  : $t('set-custom-background')
              }}
            </q-tooltip> </q-btn
          >'
        </q-card-section>
        <q-separator />
        <q-card-actions>
          <q-btn
            @click="showMediaWindow(false)"
            flat
            v-if="mediaPlayer.windowVisible"
            >{{ $t('hide-media-display') }}</q-btn
          >
          <q-btn @click="showMediaWindow(true)" flat v-else>{{
            $t('show-media-display')
          }}</q-btn>
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
    <q-badge
      :color="mediaPlayer.windowVisible ? 'positive' : 'negative'"
      floating
      rounded
      style="margin-top: 1.25em; margin-right: 0.25em"
    />
  </q-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { isImage, showMediaWindow } from 'src/helpers/mediaPlayback';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useCurrentStateStore } from 'src/stores/current-state';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const { getAllScreens, moveMediaWindow, openFileDialog, pathToFileURL } =
  electronApi;

defineProps<{
  disabled?: boolean;
}>();

const currentState = useCurrentStateStore();
const { currentSettings, mediaPlayer } = storeToRefs(currentState);
const mediaDisplayPopup = ref();
const appSettings = useAppSettingsStore();
const { screenPreferences } = storeToRefs(appSettings);
const screenList = ref(getAllScreens());

const chooseCustomBackground = async (reset?: boolean) => {
  try {
    if (reset) {
      mediaPlayer.value.customBackground = '';
      return;
    } else {
      const backgroundPicker = await openFileDialog(true);
      if (
        !backgroundPicker.canceled &&
        backgroundPicker.filePaths[0] &&
        isImage(backgroundPicker.filePaths[0])
      ) {
        mediaPlayer.value.customBackground = pathToFileURL(
          backgroundPicker.filePaths[0],
        );
      } else {
        mediaPlayer.value.customBackground = '';
      }
    }
  } catch (error) {
    console.error(error);
  }
};

watch(
  () => currentSettings.value?.enableMediaDisplayButton,
  (newMediaDisplayEnabled) => {
    showMediaWindow(newMediaDisplayEnabled);
  },
  { immediate: true },
);

watch(
  () => screenPreferences.value,
  (newScreenPreferences) => {
    try {
      console.log('newScreenPreferences', newScreenPreferences);
      console.log(
        'moveMediaWindow',
        newScreenPreferences.preferredScreenNumber,
        newScreenPreferences.preferWindowed,
        true,
      );
      moveMediaWindow(
        newScreenPreferences.preferredScreenNumber,
        newScreenPreferences.preferWindowed,
        true,
      );
    } catch (error) {
      console.error(error);
    }
  },
  { deep: true, immediate: true },
);

const windowScreenListener = (event: CustomEventInit) => {
  try {
    screenPreferences.value.preferredScreenNumber =
      event.detail.targetScreenNumber;
    screenPreferences.value.preferWindowed = event.detail.windowedMode;
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  window.addEventListener('windowScreen-update', windowScreenListener);
});

onUnmounted(() => {
  window.removeEventListener('windowScreen-update', windowScreenListener);
});
</script>
