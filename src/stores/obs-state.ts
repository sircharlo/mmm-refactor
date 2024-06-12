import { defineStore } from 'pinia';
import { JsonObject } from 'type-fest';

import { useCurrentStateStore } from '../stores/current-state';

export const useObsStateStore = defineStore('obs-state', {
  getters: {
    mediaScene: (state) => {
      const currentState = useCurrentStateStore();
      return state.scenes.find(
        (scene) =>
          scene.sceneUuid === currentState.currentSettings?.obsMediaScene,
      ) as JsonObject;
    },
    nonMediaScenes: (state) => {
      const currentState = useCurrentStateStore();
      return state.scenes.filter(
        (scene) =>
          scene.sceneUuid !== currentState.currentSettings?.obsMediaScene,
      );
    },
    nonStageScenes: (state) => {
      const currentState = useCurrentStateStore();
      return state.scenes.filter(
        (scene) =>
          scene.sceneUuid !== currentState.currentSettings?.obsCameraScene,
      );
    },
  },
  state: () => {
    return {
      currentScene: '',
      currentSceneUuid: '',
      obsConnected: false,
      scenes: [] as JsonObject[],
    };
  },

  // actions: {

  // },
});
