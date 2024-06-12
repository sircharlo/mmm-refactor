import { OBSWebSocketError } from 'obs-websocket-js';
import { storeToRefs } from 'pinia';
import { obsWebSocket } from 'src/boot/obs';
import { JsonObject } from 'type-fest';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useCurrentStateStore } from '../stores/current-state';
import { useObsStateStore } from '../stores/obs-state';
import { isImage } from './mediaPlayback';

const currentState = useCurrentStateStore();
const { getSettingValue } = currentState;
const { mediaPlayer } = storeToRefs(currentState);
const obsState = useObsStateStore();
const {
  currentScene,
  currentSceneUuid,
  obsConnectionState,
  obsMessage,
  scenes,
} = storeToRefs(obsState);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

obsWebSocket.removeAllListeners('Identified');
obsWebSocket.removeAllListeners('ConnectionClosed');
obsWebSocket.removeAllListeners('ConnectionError');
obsWebSocket.removeAllListeners('CurrentProgramSceneChanged');
obsWebSocket.removeAllListeners('SceneListChanged');

obsWebSocket.on('Identified', async () => {
  obsConnectionState.value = 'connected';
  obsMessage.value = 'obs.connected';
  const sceneList = await obsWebSocket?.call('GetSceneList');
  if (sceneList) {
    scenes.value = sceneList.scenes.reverse();
    currentSceneUuid.value = sceneList.currentProgramSceneUuid;
  }
});

const obsErrorHandler = (err: OBSWebSocketError) => {
  obsConnectionState.value = 'disconnected';
  obsMessage.value = 'obs.error';
  obsWebSocket?.disconnect();
  console.error('Connection closed', err.message);
};

obsWebSocket.on('ConnectionClosed', obsErrorHandler);
obsWebSocket.on('ConnectionError', obsErrorHandler);
obsWebSocket.on('CurrentProgramSceneChanged', (data: { sceneUuid: string }) => {
  currentSceneUuid.value = data.sceneUuid;
});
obsWebSocket.on('SceneListChanged', (data: { scenes: JsonObject[] }) => {
  scenes.value = data.scenes;
});

const currentRoute = computed(() => useRouter()?.currentRoute.value.fullPath);

const obsConnect = async (setup?: boolean) => {
  if (!getSettingValue('obsEnable')) {
    await obsWebSocket?.disconnect();
    obsMessage.value = 'obs.disconnected';
    return;
  }
  obsConnectionState.value = 'connecting';
  obsMessage.value = 'obs.connecting';
  const obsPort = getSettingValue('obsPort') as string;
  const obsPortDigits = obsPort?.toString().replace(/\D/g, '');
  if (obsPortDigits?.length === 0) return;
  const obsPassword = (getSettingValue('obsPassword') as string) || '';

  let attempt = 0;
  const maxAttempts = setup ? 1 : 12;
  const timeBetweenAttempts = 5000; // 5 seconds
  const previousRoute = currentRoute.value;
  while (attempt < maxAttempts) {
    if (currentRoute.value !== previousRoute) {
      break;
    }
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
};

const setObsScene = async (scene: string) => {
  if (obsConnectionState.value !== 'connected') await obsConnect(false);
  if (obsConnectionState.value !== 'connected') {
    return;
  }
  const mediaScene = getSettingValue('obsMediaScene') as string;
  const imageScene = getSettingValue('obsImageScene') as string;
  const cameraScene = getSettingValue('obsCameraScene') as string;
  let programScene = mediaScene;
  if (isImage(mediaPlayer.value.url) && imageScene) {
    programScene = imageScene;
  }
  currentScene.value = scene;
  const sceneUuid = scene === 'camera' ? cameraScene : programScene;
  if (sceneUuid) {
    obsWebSocket?.call('SetCurrentProgramScene', { sceneUuid });
  }
};

const setObsSceneByUuid = async (sceneUuid: string) => {
  if (obsConnectionState.value !== 'connected') await obsConnect(false);
  if (sceneUuid) {
    obsWebSocket?.call('SetCurrentProgramScene', { sceneUuid });
  }
};

export { obsConnect, setObsScene, setObsSceneByUuid };
