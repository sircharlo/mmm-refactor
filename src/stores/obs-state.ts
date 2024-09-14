import { JsonObject } from 'obs-websocket-js/node_modules/type-fest';
import { defineStore } from 'pinia';
import { useCurrentStateStore } from 'src/stores/current-state';

export const useObsStateStore = defineStore('obs-state', {
  getters: {
    additionalScenes: (state) => {
      const currentState = useCurrentStateStore();
      return state.scenes.filter(
        (scene) =>
          scene.sceneUuid !== currentState.currentSettings?.obsCameraScene &&
          scene.sceneUuid !== currentState.currentSettings?.obsMediaScene &&
          scene.sceneUuid !== currentState.currentSettings?.obsImageScene,
      );
    },
  },
  state: () => {
    return {
      currentScene: '',
      currentSceneUuid: '',
      obsConnectionState: 'notConnected',
      obsMessage: '',
      scenes: [] as JsonObject[],
    };
  },
});
