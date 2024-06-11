import { OBSWebSocketError } from 'obs-websocket-js';
import { storeToRefs } from 'pinia';
import { obsNotification, obsWebSocket } from 'src/boot/obs'
import { JsonObject } from 'type-fest';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useCurrentStateStore } from '../stores/current-state';
import { useObsStateStore } from '../stores/obs-state';
import { isImage } from './mediaPlayback';
import { createUpdatableNotification, updateNotification } from './notifications';

const currentState = useCurrentStateStore();
const { getSettingValue } = currentState;
const { mediaPlayer } = storeToRefs(currentState);
const obsState = useObsStateStore();
const { currentScene, currentSceneUuid, obsConnected, scenes } = storeToRefs(obsState);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const notifyObsError = (errorMessage?: string) => {
  if (getSettingValue('obsEnable')) {
    const notificationOptions = {
      caption: errorMessage || 'Please check your settings and try again',
      icon: 'mdi-cctv-off',
      message: 'Failed to connect to OBS Studio',
      onDismiss: () => {
        obsNotification.value = null;
      },
      spinner: false,
      timeout: 15000,
      type: 'negative'
    }
    if (obsNotification.value) {
      updateNotification(obsNotification.value, notificationOptions);
    } else {
      obsNotification.value = createUpdatableNotification(notificationOptions);
    }
  }
};

obsWebSocket.removeAllListeners('Identified');
obsWebSocket.removeAllListeners('ConnectionClosed');
obsWebSocket.removeAllListeners('ConnectionError');
obsWebSocket.removeAllListeners('CurrentProgramSceneChanged');
obsWebSocket.removeAllListeners('SceneListChanged');

obsWebSocket.on('Identified', async () => {
  obsConnected.value = true;
  const notificationOptions = {
    caption: '',
    icon: 'mdi-cctv',
    message: 'Connected to OBS Studio',
    onDismiss: () => {
      obsNotification.value = null;
    },
    spinner: false,
    timeout: 2000,
    type: 'positive'
  }
  if (obsNotification.value) {
    updateNotification(obsNotification.value, notificationOptions);
  } else {
    obsNotification.value = createUpdatableNotification(notificationOptions);
  }
});

const obsErrorHandler = (err: OBSWebSocketError) => {
  obsConnected.value = false;
  obsWebSocket?.disconnect();
  console.error('Connection closed', err.message);
  if (err.message) {
    notifyObsError(err.message);
  }
}

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
  const obsPort = getSettingValue('obsPort') as string;
  const obsPortDigits = obsPort?.toString().replace(/\D/g, '');
  if (obsPortDigits?.length === 0) return
  if (!getSettingValue('obsEnable')) {
    await obsWebSocket?.disconnect();
    obsNotification.value = null;
    return;
  }
  const obsPassword = (getSettingValue('obsPassword') as string) || '';

  const notificationOptions = {
    message: 'Connecting to OBS Studio...',
    spinner: true,
  }
  if (!obsNotification.value) {
    obsNotification.value = createUpdatableNotification(notificationOptions);
  } else {
    updateNotification(obsNotification.value, notificationOptions);
  }

  let attempt = 0;
  const maxAttempts = setup ? 1 : 6;
  const previousRoute = currentRoute.value;
  while (attempt < maxAttempts) {
    if (currentRoute.value !== previousRoute) {
      if (obsNotification.value) {
        updateNotification(obsNotification.value, {
          timeout: 500,
        });
      }
      break;
    }
    try {
      const { negotiatedRpcVersion, obsWebSocketVersion } = await obsWebSocket?.connect('ws://127.0.0.1:' + obsPort, obsPassword);
      if (obsWebSocketVersion && negotiatedRpcVersion) {
        const sceneList = await obsWebSocket?.call('GetSceneList');
        if (sceneList) {
          scenes.value = sceneList.scenes.reverse();
          currentSceneUuid.value = sceneList.currentProgramSceneUuid;
        }
        break;
      }
    } catch (error) {
      console.error('Failed to connect to OBS', error);
      notifyObsError(setup ? error as string : `Attempt ${attempt + 1} of ${maxAttempts}: ${error}`);
    } finally {
      attempt++;
      if (attempt < maxAttempts) {
        await sleep(10000); // wait for 10 seconds before retrying
      }
    }
  }
};

const setObsScene = async (scene: string) => {
  if (!obsConnected.value) await obsConnect(false);
  if (!obsConnected.value) {
    notifyObsError();
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
  if (!obsConnected.value) await obsConnect(false);
  if (sceneUuid) {
    obsWebSocket?.call('SetCurrentProgramScene', { sceneUuid });
  }
};

export { obsConnect, setObsScene, setObsSceneByUuid };
