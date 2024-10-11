import type { JsonObject } from 'obs-websocket-js/node_modules/type-fest';

import { defineStore } from 'pinia';
import { configuredScenesAreAllUUIDs } from 'src/helpers/obs';
import { useCurrentStateStore } from 'src/stores/current-state';

export const useObsStateStore = defineStore('obs-state', {
  getters: {
    additionalScenes: (state) => {
      const currentState = useCurrentStateStore();
      return state.scenes
        .filter(
          (scene) =>
            scene.sceneUuid !== currentState.currentSettings?.obsCameraScene &&
            scene.sceneName !== currentState.currentSettings?.obsCameraScene &&
            scene.sceneUuid !== currentState.currentSettings?.obsMediaScene &&
            scene.sceneName !== currentState.currentSettings?.obsMediaScene &&
            scene.sceneUuid !== currentState.currentSettings?.obsImageScene &&
            scene.sceneName !== currentState.currentSettings?.obsImageScene,
        )
        .map(
          (scene) =>
            (configuredScenesAreAllUUIDs()
              ? scene.sceneUuid
              : scene.sceneName) as string,
        );
    },
  },
  state: () => {
    return {
      currentScene: '',
      currentSceneType: '' as 'camera' | 'media',
      obsConnectionState: 'notConnected',
      obsMessage: '',
      scenes: [] as JsonObject[],
    };
  },
});
