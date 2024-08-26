<template>
  <q-btn
    :color="
      obsConnectionState === 'connected'
        ? 'white-transparent'
        : obsConnectionState === 'disconnected'
          ? 'negative'
          : 'warning'
    "
    :disable="obsConnectionState !== 'connected'"
    @click="scenePicker = true"
    class="super-rounded"
    rounded
    unelevated
    v-if="currentSettings.obsEnable"
  >
    <q-icon size="sm">
      <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M43.765,34.373 c1.267-3.719-0.131-8.03-3.567-10.23c-4.024-2.576-9.374-1.401-11.95,2.623h0c-1.854,2.896-1.756,6.474-0.061,9.215 c-1.009,1.556-2.369,2.917-4.07,3.931c-5.4,3.22-12.356,1.952-16.225-2.779c-0.186-0.262-0.367-0.527-0.541-0.797 c2.62,3.273,7.404,4.213,11.166,2.09c4.161-2.348,5.631-7.625,3.283-11.786v0c-1.618-2.867-4.627-4.456-7.703-4.399 c-0.994-1.792-1.563-3.852-1.563-6.047c0-5.482,3.537-10.119,8.448-11.8c0.36-0.07,0.728-0.116,1.094-0.168 c-3.321,1.208-5.698,4.384-5.698,8.123c0,4.778,3.873,8.651,8.651,8.651c3.179,0,5.949-1.719,7.453-4.274 c2.197,0.015,4.417,0.594,6.427,1.825c5.056,3.094,7.173,9.294,5.39,14.713C44.137,33.643,43.948,34.007,43.765,34.373z"
        />
      </svg>
    </q-icon>
    <q-tooltip :delay="2000" :offset="[14, 28]" v-if="!scenePicker">
      {{ $t(obsMessage ?? 'scene-selection') }}
    </q-tooltip>
    <!-- <q-popup-proxy
      :offset="[0, 8]"
      @before-hide="scenePicker = false"
      @before-show="scenePicker = true"
      anchor="top middle"
      class="round-card"
      flat
      self="bottom middle"
    > -->
    <q-dialog position="bottom" v-model="scenePicker">
      <q-card flat style="min-width: 50vw">
        <q-card-section>
          <div class="card-title">
            {{ $t('scene-selection') }}
          </div>
          <div>
            <p class="card-section-title text-dark-grey">
              {{ $t('main-scenes') }}
            </p>
          </div>
          <div class="row items-center q-col-gutter-sm">
            <template
              :key="scene"
              v-for="scene in [cameraScene, mediaScene, pipScene].filter(
                Boolean,
              )"
            >
              <div class="col">
                <q-btn
                  :outline="scene?.sceneUuid !== currentSceneUuid"
                  @click="setObsScene(undefined, scene?.sceneUuid as string)"
                  class="full-width"
                  color="primary"
                  unelevated
                >
                  <q-icon
                    :name="
                      scene?.sceneUuid === cameraScene?.sceneUuid
                        ? 'mmm-lectern'
                        : scene?.sceneUuid === mediaScene?.sceneUuid
                          ? 'mmm-stream-now'
                          : 'mmm-picture-in-picture'
                    "
                    class="q-mr-sm"
                    size="xs"
                  />
                  {{
                    scene?.sceneUuid === cameraScene?.sceneUuid
                      ? $t('speaker')
                      : scene?.sceneUuid === mediaScene?.sceneUuid
                        ? $t('media-only')
                        : $t('picture-in-picture')
                  }}
                </q-btn>
              </div>
            </template>
          </div>
          <template v-if="additionalScenes.length > 0">
            <q-separator class="bg-accent-200 q-my-md" />
            <div>
              <p class="card-section-title text-dark-grey">
                {{ $t('additional-scenes') }}
              </p>
            </div>
            <div class="row items-center q-col-gutter-sm q-mb-md">
              <template :key="scene" v-for="scene in additionalScenes">
                <div class="col-4">
                  <q-btn
                    :outline="scene?.sceneUuid !== currentSceneUuid"
                    @click="setObsScene(undefined, scene?.sceneUuid as string)"
                    class="full-width"
                    color="primary"
                    unelevated
                  >
                    <q-icon
                      :name="
                        scene?.sceneUuid === cameraScene?.sceneUuid
                          ? 'mmm-lectern'
                          : scene?.sceneUuid === mediaScene?.sceneUuid
                            ? 'mmm-stream-now'
                            : 'mmm-picture-in-picture'
                      "
                      class="q-mr-sm"
                      size="xs"
                    />
                    {{ scene?.sceneName }}
                  </q-btn>
                </div>
              </template>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- </q-popup-proxy> -->
  </q-btn>
</template>

<script setup lang="ts">
import { OBSWebSocketError } from 'obs-websocket-js';
import { storeToRefs } from 'pinia';
import { obsWebSocket } from 'src/boot/globals';
import { isImage } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useObsStateStore } from 'src/stores/obs-state';
import { onMounted, onUnmounted, ref } from 'vue';

const currentState = useCurrentStateStore();
const { currentSettings, mediaPlayingUrl } = storeToRefs(currentState);

const obsState = useObsStateStore();
const {
  additionalScenes,
  cameraScene,
  currentScene,
  currentSceneUuid,
  mediaScene,
  obsConnectionState,
  obsMessage,
  pipScene,
  scenes,
} = storeToRefs(obsState);

const scenePicker = ref(false);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const obsErrorHandler = (err: OBSWebSocketError) => {
  obsConnectionState.value = 'disconnected';
  obsMessage.value = 'obs.error';
  obsWebSocket?.disconnect();
  console.error('Connection closed', err.message);
};

const obsConnect = async (setup?: boolean) => {
  try {
    if (!currentSettings.value?.obsEnable) {
      await obsWebSocket?.disconnect();
      obsMessage.value = 'obs.disconnected';
      return;
    }

    const obsPort = currentSettings.value?.obsPort as string;
    const obsPortDigits = obsPort?.toString().replace(/\D/g, '');
    if (obsPortDigits?.length === 0) return;

    obsConnectionState.value = 'connecting';
    obsMessage.value = 'obs.connecting';
    const obsPassword = (currentSettings.value?.obsPassword as string) || '';

    let attempt = 0;
    const maxAttempts = setup ? 1 : 12;
    const timeBetweenAttempts = 5000;
    while (attempt < maxAttempts) {
      try {
        const { negotiatedRpcVersion, obsWebSocketVersion } =
          await obsWebSocket?.connect('ws://127.0.0.1:' + obsPort, obsPassword);
        if (obsWebSocketVersion && negotiatedRpcVersion) {
          break;
        }
      } catch (error) {
        console.error(
          `Failed to connect to OBS (attempt ${attempt + 1}/${maxAttempts})`,
          error,
        );
      } finally {
        attempt++;
        if (attempt < maxAttempts) {
          await sleep(timeBetweenAttempts);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const setObsScene = async (scene: string | undefined, sceneUuid?: string) => {
  try {
    if (!obsConnectionState.value.startsWith('connect')) await obsConnect();
    if (obsConnectionState.value !== 'connected') return;
    let newProgramScene: string | undefined = sceneUuid;
    if (!sceneUuid && scene) {
      const mediaScene = currentSettings.value?.obsMediaScene as string;
      const imageScene = currentSettings.value?.obsImageScene as string;
      const cameraScene = currentSettings.value?.obsCameraScene as string;
      newProgramScene = mediaScene;
      if (isImage(mediaPlayingUrl.value) && imageScene)
        newProgramScene = imageScene;
      currentScene.value = scene;
      if (scene === 'camera') newProgramScene = cameraScene;
    }
    if (newProgramScene) {
      obsWebSocket?.call('SetCurrentProgramScene', {
        sceneUuid: newProgramScene,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const setObsSceneListener = (event: CustomEventInit) => {
  try {
    setObsScene(event.detail.scene);
  } catch (error) {
    console.error(error);
  }
};

const obsSettingsConnect = () => obsConnect(true);

onMounted(() => {
  try {
    window.addEventListener('obsConnectFromSettings', obsSettingsConnect);
    window.addEventListener('obsSceneEvent', setObsSceneListener);

    obsWebSocket.on('ConnectionOpened', () => {
      obsConnectionState.value = 'connecting';
    });
    obsWebSocket.on('ConnectionClosed', obsErrorHandler);
    obsWebSocket.on('ConnectionError', obsErrorHandler);
    obsWebSocket.on(
      'CurrentProgramSceneChanged',
      (data: { sceneUuid: string }) => {
        currentSceneUuid.value = data.sceneUuid;
      },
    );
    obsWebSocket.on('Identified', async () => {
      obsConnectionState.value = 'connected';
      obsMessage.value = 'obs.connected';
      try {
        const sceneList = await obsWebSocket?.call('GetSceneList');
        if (sceneList) {
          scenes.value = sceneList.scenes.reverse();
          currentSceneUuid.value = sceneList.currentProgramSceneUuid;
        }
      } catch (error) {
        console.error(error);
      }
    });
    obsWebSocket.on('SceneListChanged', (data) => {
      scenes.value = data.scenes;
    });
  } catch (error) {
    console.error(error);
  }
});

onUnmounted(() => {
  try {
    window.removeEventListener('obsConnectFromSettings', obsSettingsConnect);
    window.removeEventListener('obsSceneEvent', setObsSceneListener);
    obsWebSocket.removeAllListeners('ConnectionClosed');
    obsWebSocket.removeAllListeners('ConnectionError');
    obsWebSocket.removeAllListeners('ConnectionOpened');
    obsWebSocket.removeAllListeners('CurrentProgramSceneChanged');
    obsWebSocket.removeAllListeners('Identified');
    obsWebSocket.removeAllListeners('SceneListChanged');
  } catch (error) {
    console.error(error);
  }
});
</script>
