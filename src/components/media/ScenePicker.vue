<template>
  <template v-if="obsConnectionState && nonMediaScenes.length > 1">
    <q-btn flat icon="mdi-lectern" size="sm">
      <!-- :flat="!disabled"
    :outline="disabled"
    :disable="disabled" -->
      <q-tooltip v-if="!menuActive"> {{ $t('scene-selection') }} </q-tooltip>
      <q-menu
        @before-hide="menuActive = false"
        @before-show="menuActive = true"
        class="non-selectable"
      >
        <q-list style="min-width: 100px">
          <template v-if="mediaScene">
            <q-item-label header>{{ $t('media-scene') }}</q-item-label>
            <q-item
              :active="currentSceneUuid === mediaScene.sceneUuid"
              @click="setObsSceneByUuid(mediaScene.sceneUuid as string)"
              clickable
              v-close-popup
            >
              <q-item-section avatar>
                <q-icon :name="'mdi-alpha-m-circle'" />
              </q-item-section>
              <q-item-section>{{ mediaScene.sceneName }}</q-item-section>
            </q-item>
            <q-item-label header>{{ $t('other-scenes') }}</q-item-label>
          </template>
          <template
            :key="scene.sceneUuid"
            v-for="[i, scene] in Object.entries(nonMediaScenes)"
          >
            <q-item
              :active="currentSceneUuid === scene.sceneUuid"
              @click="setObsSceneByUuid(scene.sceneUuid as string)"
              clickable
              v-close-popup
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
    <q-separator inset vertical />
  </template>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { setObsSceneByUuid } from 'src/helpers/obs';
import { ref } from 'vue';

import { useObsStateStore } from '../../stores/obs-state';

const obsState = useObsStateStore();
const { currentSceneUuid, mediaScene, nonMediaScenes, obsConnectionState } =
  storeToRefs(obsState);

const menuActive = ref(false);
</script>
