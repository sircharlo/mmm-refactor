<template>
  <q-btn :color="mediaPlayer.windowVisible ? '' : 'red-5'" :disable="!!disabled"
    :flat="!disabled" :icon="mediaPlayer.windowVisible ? 'mdi-television' : 'mdi-television-off'"
    :outline="!!disabled" @click="mediaDisplayPopup = false" size="md" v-if="currentSettings?.enableMediaDisplayButton">
    <q-tooltip anchor="bottom left" self="top left" v-if="!disabled && !mediaDisplayPopup">
      Media display
    </q-tooltip>
    <q-popup-proxy anchor="bottom right" self="top right" v-if="!disabled" v-model="mediaDisplayPopup">
      <q-card class="non-selectable">
        <q-card-section>
          <div class="text-overline">Media display</div>
          <div class="text-h5 text-primary" v-if="mediaPlayer.windowVisible">Projecting</div>
          <div class="text-h5 text-negative" v-else>Inactive</div>
          <div class="text-caption text-grey">
            External screen
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions>
          <q-btn @click="showMediaWindow(false)" flat v-if="mediaPlayer.windowVisible">Hide media display</q-btn>
          <q-btn @click="showMediaWindow(true)" flat v-else>Show media display</q-btn>
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { ref } from 'vue';

import { useCurrentStateStore } from '../../stores/current-state';

defineProps<{
  disabled?: boolean,
}>()

const currentState = useCurrentStateStore();
const { currentSettings, mediaPlayer } = storeToRefs(currentState);

const mediaDisplayPopup = ref();

const showMediaWindow = (state: boolean) => {
  mediaPlayer.value.windowVisible = state;
  electronApi.toggleMediaWindow(state ? 'show' : 'hide');
};

</script>
