<template>
  <!-- @click="obsConnectionState === 'disconnected' && obsConnect()" -->
  <q-btn
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
    <q-tooltip v-if="!menuActive"> {{ $t(obsMessage ?? 'scene-selection') }} </q-tooltip>
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
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { setObsSceneByUuid } from 'src/helpers/obs';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useObsStateStore } from 'src/stores/obs-state';
import { ref } from 'vue';

const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);

const obsState = useObsStateStore();
const {
  currentSceneUuid,
  mediaScene,
  nonMediaScenes,
  obsConnectionState,
  obsMessage,
} = storeToRefs(obsState);

const menuActive = ref(false);
</script>