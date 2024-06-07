import { defineStore } from 'pinia';
import { useCurrentStateStore } from 'src/stores/current-state';
const currentState = useCurrentStateStore();
const { getSettingValue } = currentState;
import { JsonObject } from 'type-fest'


export const useObsStateStore = defineStore(
  'obs-state',
  {
    state: () => {
      return {
        scenes: [] as JsonObject[],
        obsConnected: false,
        currentScene: '',
        currentSceneUuid: '',
      };
    },
    getters: {
      nonStageScenes: (state) => {
        return state.scenes.filter(scene => scene.sceneUuid !== getSettingValue('obsCameraScene'))
      },
      nonMediaScenes: (state) => {
        return state.scenes.filter(scene => scene.sceneUuid !== getSettingValue('obsMediaScene'))
      },
      mediaScene: (state) => {
        return state.scenes.find(scene => scene.sceneUuid === getSettingValue('obsMediaScene')) as JsonObject
      },
    },

    // actions: {

    // },
  }
);
