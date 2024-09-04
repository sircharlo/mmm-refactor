<template>
  <q-btn
    :color="!mediaWindowVisible ? 'negative' : 'white-transparent'"
    :icon="
      mediaWindowVisible
        ? 'mmm-media-display-active'
        : 'mmm-media-display-inactive'
    "
    @click="mediaDisplayPopup = true"
    class="super-rounded"
    rounded
    unelevated
    v-if="currentSettings?.enableMediaDisplayButton"
  >
    <q-tooltip
      :delay="1000"
      :offset="[14, 22]"
      anchor="bottom left"
      self="top left"
      v-if="!mediaDisplayPopup"
    >
      {{ $t('media-display') }}
    </q-tooltip>
    <!-- <q-popup-proxy
      :offset="[0, 8]"
      @before-hide="mediaDisplayPopup = false"
      @before-show="mediaDisplayPopup = true"
      anchor="top middle"
      class="round-card"
      flat
      self="bottom middle"
      v-if="!disabled"
    > -->
    <q-dialog position="bottom" v-model="mediaDisplayPopup">
      <q-card flat>
        <q-card-section>
          <div class="card-title">
            {{ $t('media-display-settings') }}
          </div>
          <template v-if="screenList.length > 1">
            <template
              v-if="!screenPreferences.preferWindowed && screenList.length > 2"
            >
              <div>
                <p class="card-section-title text-dark-grey">
                  {{ $t('display') }}
                </p>
              </div>
              <div class="row items-center q-col-gutter-sm q-mb-md">
                <template
                  :key="screen.id"
                  v-for="(screen, index) in screenList"
                >
                  <div class="col">
                    <q-btn
                      :disable="screen.mainWindow"
                      :outline="screen.mainWindow || !screen.mediaWindow"
                      @click="screenPreferences.preferredScreenNumber = index"
                      class="full-width"
                      color="primary"
                    >
                      <q-icon
                        :name="
                          screen.mainWindow
                            ? 'mmm-display-current'
                            : 'mmm-media-display-active'
                        "
                        class="q-mr-sm"
                        size="xs"
                      />
                      {{
                        screen.mainWindow
                          ? $t('current')
                          : $t('display') + ' ' + (index + 1)
                      }}
                    </q-btn>
                  </div>
                </template>
              </div>
              <q-separator class="bg-accent-200 q-mb-md" />
            </template>
            <div>
              <p class="card-section-title text-dark-grey">
                {{ $t('window-type') }}
              </p>
            </div>
            <div class="row items-center q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <q-btn
                  :disable="screenList.length < 2"
                  :outline="
                    screenList.length < 2 || screenPreferences.preferWindowed
                  "
                  @click="screenPreferences.preferWindowed = false"
                  class="full-width"
                  color="primary"
                  unelevated
                >
                  <q-icon class="q-mr-sm" name="mmm-fullscreen" size="xs" />
                  {{ $t('full-screen') }}
                </q-btn>
              </div>
              <div class="col-6">
                <q-btn
                  :disable="screenList.length < 2"
                  :outline="
                    !(screenList.length < 2 || screenPreferences.preferWindowed)
                  "
                  :text-color="
                    screenList.length < 2 || screenPreferences.preferWindowed
                      ? ''
                      : 'primary'
                  "
                  @click="screenPreferences.preferWindowed = true"
                  class="full-width"
                  color="primary"
                  unelevated
                >
                  <q-icon class="q-mr-sm" name="mmm-window" size="xs" />
                  {{ $t('windowed') }}
                </q-btn>
              </div>
            </div>
            <q-separator class="bg-accent-200 q-mb-md" />
          </template>
          <div>
            <p class="card-section-title text-dark-grey">
              {{ $t('custom-background') }}
            </p>
          </div>
          <div class="col q-mb-md">
            <q-btn
              :outline="!mediaWindowCustomBackground"
              @click="chooseCustomBackground(!!mediaWindowCustomBackground)"
              class="full-width"
              color="primary"
              unelevated
            >
              <q-icon
                :name="
                  'mmm-background' +
                  (mediaWindowCustomBackground ? '-remove' : '')
                "
                class="q-mr-sm"
                size="xs"
              />
              {{
                mediaWindowCustomBackground
                  ? $t('reset-custom-background')
                  : $t('set-custom-background')
              }}
            </q-btn>
          </div>
          <q-separator class="bg-accent-200 q-mb-md" />
          <div class="row items-center">
            <div class="col-6">
              <div class="row text-subtitle1 text-weight-medium">
                {{ mediaWindowVisible ? $t('projecting') : $t('inactive') }}
              </div>
              <div class="row text-dark-grey">
                {{
                  $t(
                    screenList.length < 2 || screenPreferences.preferWindowed
                      ? 'windowed'
                      : 'external-screen',
                  )
                }}
              </div>
            </div>
            <div class="col-6">
              <q-btn
                @click="showMediaWindow(false)"
                class="full-width"
                color="primary"
                unelevated
                v-if="mediaWindowVisible"
                >{{ $t('hide-media-display') }}</q-btn
              >
              <q-btn
                @click="showMediaWindow(true)"
                class="full-width"
                color="primary"
                unelevated
                v-else
                >{{ $t('show-media-display') }}</q-btn
              >
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- </q-popup-proxy> -->
  </q-btn>
  <q-dialog v-model="showCustomBackgroundPicker">
    <div
      class="items-center col q-pb-lg q-px-lg q-gutter-y-md bg-secondary-contrast"
    >
      <div class="text-h6 row">{{ $t('choose-an-image') }}</div>
      <div class="row">
        {{ $t('select-a-custom-background') }}
      </div>
      <q-scroll-area
        :bar-style="barStyle"
        :thumb-style="thumbStyle"
        style="height: 40vh; width: -webkit-fill-available"
      >
        <template
          :key="jwpubImage.FilePath"
          v-for="(jwpubImage, index) in jwpubImages"
        >
          <div class="col items-center q-pb-md">
            <div
              @click="setMediaBackground(jwpubImage.FilePath)"
              class="row cursor-pointer items-center q-gutter-x-md"
            >
              <div class="col-shrink">
                <q-img
                  :src="pathToFileURL(jwpubImage.FilePath)"
                  class="rounded-borders"
                  fit="contain"
                  style="width: 150px"
                  v-ripple
                />
              </div>
              <div class="col">
                <div class="row">{{ path.basename(jwpubImage.FilePath) }}</div>
              </div>
            </div>
            <q-separator
              class="bg-accent-200 q-mt-md"
              v-if="index < jwpubImages.length - 1"
            />
          </div>
        </template>
        <q-inner-loading
          :showing="!!jwpubImportFilePath && !jwpubImages.length"
        />
      </q-scroll-area>
      <!-- </q-card-section>
    </q-card> -->
      <div class="row justify-end">
        <q-btn
          @click="
            jwpubImportFilePath = '';
            jwpubImages = [];
          "
          color="negative"
          flat
          >{{ $t('cancel') }}</q-btn
        >
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { barStyle, thumbStyle } from 'src/boot/globals';
import { electronApi } from 'src/helpers/electron-api';
import { errorCatcher } from 'src/helpers/error-catcher';
import { getTempDirectory } from 'src/helpers/fs';
import {
  convertImageIfNeeded,
  decompressJwpub,
  findDb,
  isImage,
  isJwpub,
  showMediaWindow,
} from 'src/helpers/mediaPlayback';
import { createTemporaryNotification } from 'src/helpers/notifications';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useCurrentStateStore } from 'src/stores/current-state';
import { MultimediaItem } from 'src/types/sqlite';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const {
  executeQuery,
  fs,
  getAllScreens,
  moveMediaWindow,
  openFileDialog,
  path,
  pathToFileURL,
} = electronApi;

const currentState = useCurrentStateStore();
const { currentSettings, mediaWindowCustomBackground, mediaWindowVisible } =
  storeToRefs(currentState);
const mediaDisplayPopup = ref();
const appSettings = useAppSettingsStore();
const { screenPreferences } = storeToRefs(appSettings);
const screenList = ref(getAllScreens());
const { t } = useI18n();
const jwpubImportFilePath = ref('');
const jwpubImages = ref([] as MultimediaItem[]);
const showCustomBackgroundPicker = computed(
  () => !!jwpubImportFilePath.value || jwpubImages.value.length > 0,
);

const bc = new BroadcastChannel('mediaPlayback');

const notifyInvalidBackgroundFile = () => {
  createTemporaryNotification({
    message: t('please-use-image-or-jwpub'),
  });
};

const setMediaBackground = (filepath?: string) => {
  try {
    if (!filepath) {
      throw new Error('Problem with image file');
    } else {
      mediaWindowCustomBackground.value = pathToFileURL(filepath);
    }
  } catch (error) {
    console.error(error);
    if (filepath) notifyInvalidBackgroundFile();
    mediaWindowCustomBackground.value = '';
  } finally {
    jwpubImages.value = [];
    jwpubImportFilePath.value = '';
  }
};

const chooseCustomBackground = async (reset?: boolean) => {
  try {
    if (reset) {
      mediaWindowCustomBackground.value = '';
      return;
    } else {
      try {
        const backgroundPicker = await openFileDialog(true, ['images+jwpub']);
        if (
          backgroundPicker.canceled ||
          backgroundPicker.filePaths?.length === 0
        ) {
          throw new Error('No file selected');
        } else {
          const filepath = backgroundPicker.filePaths[0];
          if (isJwpub(filepath)) {
            jwpubImportFilePath.value = filepath;
            const unzipDir = await decompressJwpub(filepath);
            const db = findDb(unzipDir);
            if (!db) throw new Error('No db file found: ' + filepath);
            jwpubImages.value = (
              executeQuery(
                db,
                "SELECT * FROM Multimedia WHERE CategoryType >= 0 AND CategoryType <> 9 AND FilePath <> '';",
              ) as MultimediaItem[]
            ).map((multimediaItem) => {
              return {
                ...multimediaItem,
                FilePath: path.join(unzipDir, multimediaItem.FilePath),
              };
            });
            if (jwpubImages.value?.length === 0) {
              throw new Error('No multimedia in jwpub: ' + filepath);
            }
          } else {
            const tempDirectory = getTempDirectory();
            const tempFilepath = path.join(
              tempDirectory,
              path.basename(filepath),
            );
            fs.copyFileSync(filepath, tempFilepath);
            const workingTempFilepath =
              await convertImageIfNeeded(tempFilepath);
            if (isImage(workingTempFilepath)) {
              setMediaBackground(workingTempFilepath);
            } else {
              throw new Error('Invalid file type: ' + workingTempFilepath);
            }
          }
        }
      } catch (error) {
        errorCatcher(error);
        notifyInvalidBackgroundFile();
        mediaWindowCustomBackground.value = '';
        jwpubImportFilePath.value = '';
      }
    }
  } catch (error) {
    errorCatcher(error);
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
  () => mediaWindowCustomBackground.value,
  (newMediaBackground) => {
    bc.postMessage({ customBackground: newMediaBackground });
  },
);

watch(
  () => screenPreferences.value,
  (newScreenPreferences) => {
    try {
      moveMediaWindow(
        newScreenPreferences.preferredScreenNumber,
        newScreenPreferences.preferWindowed,
        true,
      );
      screenList.value = getAllScreens();
    } catch (error) {
      errorCatcher(error + ': ' + JSON.stringify(newScreenPreferences));
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
    errorCatcher(error);
  }
};

const updateScreenMetrics = () => {
  try {
    screenList.value = getAllScreens();
  } catch (error) {
    errorCatcher(error);
  }
};

onMounted(() => {
  window.addEventListener('windowScreen-update', windowScreenListener);
  window.addEventListener('screen-trigger-update', updateScreenMetrics);
});

onUnmounted(() => {
  window.removeEventListener('windowScreen-update', windowScreenListener);
  window.removeEventListener('screen-trigger-update', updateScreenMetrics);
});
</script>
