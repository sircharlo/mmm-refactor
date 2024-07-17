<template>
  <q-btn
    :color="!mediaWindowVisible ? 'negative' : 'white-transparent'"
    :disable="!!disabled"
    :icon="mediaWindowVisible ? 'mdi-television' : 'mdi-television-off'"
    :outline="!!disabled"
    class="super-rounded"
    rounded
    unelevated
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
      :offset="[0, 28]"
      @before-hide="mediaDisplayPopup = false"
      @before-show="mediaDisplayPopup = true"
      anchor="top middle"
      class="round-card"
      flat
      self="bottom middle"
      v-if="!disabled"
    >
      <q-card class="non-selectable" flat style="min-width: 50vw">
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
                            ? 'fas fa-computer'
                            : screen.mediaWindow
                              ? 'mdi-television-play'
                              : 'mdi-television'
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
                  <q-icon class="q-mr-sm" name="fas fa-display" size="xs" />
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
                  <q-icon
                    class="q-mr-sm"
                    name="fas fa-window-restore"
                    size="xs"
                  />
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
                  'mdi-image' + (mediaWindowCustomBackground ? '-remove' : '')
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
              <div class="row text-subtitle1 text-weight-bold">
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
    </q-popup-proxy>
  </q-btn>
  <!-- todo: redo this modal -->
  <q-dialog v-model="jwpubImagesExist">
    <q-card style="width: 80vw; max-width: 80vw">
      <q-card-section>
        <div class="row self-center">
          <q-avatar
            class="q-mr-md self-center"
            color="primary"
            icon="mdi-image"
            text-color="white"
          />
          <span class="text-h6 self-center">
            {{ $t('choose-an-image') }}
          </span>
          <q-space />
          <div class="text-h6 self-center">
            <q-btn
              @click="setMediaBackground()"
              dense
              flat
              icon="close"
              round
              v-close-popup
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="row items-center">
        <div class="row full-width q-col-gutter-lg">
          <template
            :key="jwpubImage.FilePath"
            v-for="jwpubImage in jwpubImages"
          >
            <div class="col-4">
              <q-img
                :src="pathToFileURL(jwpubImage.FilePath)"
                @click="setMediaBackground(jwpubImage.FilePath)"
                class="rounded-borders shadow-5 cursor-pointer"
                fit="contain"
                style="max-height: 50vh"
                v-ripple
              />
            </div>
          </template>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
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

defineProps<{
  disabled?: boolean;
}>();

const currentState = useCurrentStateStore();
const { currentSettings, mediaWindowCustomBackground, mediaWindowVisible } =
  storeToRefs(currentState);
const mediaDisplayPopup = ref();
const appSettings = useAppSettingsStore();
const { screenPreferences } = storeToRefs(appSettings);
const screenList = ref(getAllScreens());
const { t } = useI18n();
const jwpubImportDb = ref('');
const jwpubImages = ref([] as MultimediaItem[]);
const jwpubImagesExist = computed(() => jwpubImages.value.length > 0);

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
    if (filepath) notifyInvalidBackgroundFile();
    mediaWindowCustomBackground.value = '';
  } finally {
    jwpubImages.value = [];
    jwpubImportDb.value = '';
  }
};

const chooseCustomBackground = async (reset?: boolean) => {
  try {
    if (reset) {
      mediaWindowCustomBackground.value = '';
      return;
    } else {
      try {
        const backgroundPicker = await openFileDialog(true);
        if (
          backgroundPicker.canceled ||
          backgroundPicker.filePaths?.length === 0
        ) {
          throw new Error('No file selected');
        } else {
          const filepath = backgroundPicker.filePaths[0];
          filepath;
          if (isJwpub(filepath)) {
            const unzipDir = await decompressJwpub(filepath);
            const db = findDb(unzipDir);
            if (!db) throw new Error('No db file found: ' + filepath);
            jwpubImportDb.value = db;
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
        console.error(error);
        notifyInvalidBackgroundFile();
        mediaWindowCustomBackground.value = '';
        jwpubImportDb.value = '';
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

const updateScreenMetrics = () => {
  try {
    screenList.value = getAllScreens();
  } catch (error) {
    console.error(error);
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
