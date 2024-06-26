<template>
  <q-btn
    @click="scenePicker = true"
    class="q-ml-sm"
    flat
    rounded
    v-if="currentSettings.obsEnable"
  >
    <q-icon size="sm">
      <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M43.765,34.373 c1.267-3.719-0.131-8.03-3.567-10.23c-4.024-2.576-9.374-1.401-11.95,2.623h0c-1.854,2.896-1.756,6.474-0.061,9.215 c-1.009,1.556-2.369,2.917-4.07,3.931c-5.4,3.22-12.356,1.952-16.225-2.779c-0.186-0.262-0.367-0.527-0.541-0.797 c2.62,3.273,7.404,4.213,11.166,2.09c4.161-2.348,5.631-7.625,3.283-11.786v0c-1.618-2.867-4.627-4.456-7.703-4.399 c-0.994-1.792-1.563-3.852-1.563-6.047c0-5.482,3.537-10.119,8.448-11.8c0.36-0.07,0.728-0.116,1.094-0.168 c-3.321,1.208-5.698,4.384-5.698,8.123c0,4.778,3.873,8.651,8.651,8.651c3.179,0,5.949-1.719,7.453-4.274 c2.197,0.015,4.417,0.594,6.427,1.825c5.056,3.094,7.173,9.294,5.39,14.713C44.137,33.643,43.948,34.007,43.765,34.373z"
        />
      </svg>
    </q-icon>
    <q-badge
      :color="
        obsConnectionState === 'connected'
          ? 'positive'
          : obsConnectionState === 'disconnected'
            ? 'negative'
            : 'warning'
      "
      floating
      rounded
      style="margin-top: 1.25em; margin-right: 0.25em"
    />
    <q-tooltip v-if="!scenePicker">
      {{ $t(obsMessage ?? 'scene-selection') }}
    </q-tooltip>
    <q-popup-proxy>
      <div
        :class="'rounded-borders bg-grey-' + $q.dark.isActive ? '2' : '9'"
        style="width: 80vw"
      >
        <q-card-section>
          <div class="text-h6">{{ $t('scene-selection') }}</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <template
              :key="scene.sceneUuid"
              v-for="scene in [mediaScene]
                .concat(nonMediaScenes)
                .filter(Boolean)"
            >
              <div
                :class="
                  'col-' +
                  ([mediaScene].concat(nonMediaScenes).filter(Boolean).length <
                  4
                    ? (
                        12 /
                        [mediaScene].concat(nonMediaScenes).filter(Boolean)
                          .length
                      ).toString()
                    : '3')
                "
              >
                <q-btn
                  :color="
                    currentSceneUuid === scene?.sceneUuid
                      ? 'warning'
                      : scene?.sceneUuid === mediaScene?.sceneUuid
                        ? 'primary'
                        : 'primary'
                  "
                  :label="scene?.sceneName as string"
                  @click="setObsSceneByUuid(scene?.sceneUuid as string)"
                  class="q-py-md q-px-lg full-width"
                  size="1.5em"
                />
              </div>
            </template>
          </div>
        </q-card-section>
      </div>
    </q-popup-proxy>
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
const { currentSettings, mediaPlayer } = storeToRefs(currentState);

const obsState = useObsStateStore();
const {
  currentScene,
  currentSceneUuid,
  mediaScene,
  nonMediaScenes,
  obsConnectionState,
  obsMessage,
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

    // const getCurrentRoute = () => useRouter()?.currentRoute.value?.fullPath;

    let attempt = 0;
    const maxAttempts = setup ? 1 : 12;
    const timeBetweenAttempts = 5000; // 5 seconds
    // const previousRoute = getCurrentRoute();
    while (attempt < maxAttempts) {
      // if (getCurrentRoute() !== previousRoute) {
      //   break;
      // }
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

const setObsScene = async (scene: string) => {
  try {
    if (obsConnectionState.value !== 'connected') await obsConnect();
    if (obsConnectionState.value !== 'connected') return;
    const mediaScene = currentSettings.value?.obsMediaScene as string;
    const imageScene = currentSettings.value?.obsImageScene as string;
    const cameraScene = currentSettings.value?.obsCameraScene as string;
    let programScene = mediaScene;
    if (isImage(mediaPlayer.value.url) && imageScene) programScene = imageScene;
    currentScene.value = scene;
    const sceneUuid = scene === 'camera' ? cameraScene : programScene;
    if (sceneUuid) obsWebSocket?.call('SetCurrentProgramScene', { sceneUuid });
  } catch (error) {
    console.error(error);
  }
};

const setObsSceneByUuid = async (sceneUuid: string) => {
  if (obsConnectionState.value !== 'connected') await obsConnect();
  if (sceneUuid) {
    obsWebSocket?.call('SetCurrentProgramScene', { sceneUuid });
  }
};

const setObsSceneListener = (event: CustomEventInit) => {
  try {
    setObsScene(event.detail.scene);
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  try {
    window.addEventListener('obsConnectFromSettings', () => obsConnect(true));
    window.addEventListener('obsSceneEvent', setObsSceneListener);

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
      const sceneList = await obsWebSocket?.call('GetSceneList');
      if (sceneList) {
        scenes.value = sceneList.scenes.reverse();
        currentSceneUuid.value = sceneList.currentProgramSceneUuid;
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
    window.removeEventListener('obsConnectFromSettings', setObsSceneListener);
    window.removeEventListener('obsSceneEvent', setObsSceneListener);


    obsWebSocket.removeAllListeners('ConnectionClosed');
    obsWebSocket.removeAllListeners('ConnectionError');
    obsWebSocket.removeAllListeners('CurrentProgramSceneChanged');
    obsWebSocket.removeAllListeners('Identified');
    obsWebSocket.removeAllListeners('SceneListChanged');
  } catch (error) {
    console.error(error);
  }
});
</script>
