<template>
  <template v-if="obsConnected && nonMediaScenes.length > 1">
    <q-btn icon="mdi-lectern" flat>
      <!-- :flat="!disabled"
    :outline="disabled"
    :disable="disabled" -->
      <q-tooltip v-if="!menuActive"> Scene selection </q-tooltip>
      <q-menu
        @before-show="menuActive = true"
        @before-hide="menuActive = false"
      >
        <q-list style="min-width: 100px">
          <q-item-label header>Media scene</q-item-label>
          <q-item
            clickable
            v-close-popup
            @click="setObsSceneByUuid(mediaScene.sceneUuid as string)"
            :active="currentSceneUuid === mediaScene.sceneUuid"
          >
            <q-item-section avatar>
              <q-icon :name="'mdi-alpha-m-circle'" />
            </q-item-section>
            <q-item-section>{{ mediaScene.sceneName }}</q-item-section>
          </q-item>
          <q-item-label header>Other scenes</q-item-label>
          <template
            v-for="[i, scene] in Object.entries(nonMediaScenes)"
            :key="scene.sceneUuid"
          >
            <q-item
              clickable
              v-close-popup
              @click="setObsSceneByUuid(scene.sceneUuid as string)"
              :active="currentSceneUuid === scene.sceneUuid"
            >
              <q-item-section avatar>
                <q-icon
                  :name="'mdi-numeric-' + (parseInt(i) + 1) + '-circle'"
                />
              </q-item-section>
              <q-item-section>{{ scene.sceneName }}</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-menu>
    </q-btn>
    <q-separator vertical inset />
  </template>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { storeToRefs } from 'pinia';

import { useObsStateStore } from 'stores/obs-state';
const obsState = useObsStateStore();
const { nonMediaScenes, currentSceneUuid, obsConnected, mediaScene } =
  storeToRefs(obsState);

import { setObsSceneByUuid } from 'src/helpers/obs';

export default defineComponent({
  name: 'ScenePicker',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      nonMediaScenes,
      obsConnected,
      setObsSceneByUuid,
      currentSceneUuid,
      menuActive: ref(false),
      mediaScene,
    };
  },
});
</script>
