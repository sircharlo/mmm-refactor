<template>
  <!-- :color="mediaPlayer.windowVisible ? '' : 'red-5'" -->
  <q-btn
    :disable="!!disabled"
    :flat="!disabled"
    :icon="mediaPlayer.windowVisible ? 'mdi-television' : 'mdi-television-off'"
    :outline="!!disabled"
    @click="mediaDisplayPopup = false"
    class="q-ml-sm"
    rounded
    v-if="currentSettings?.enableMediaDisplayButton"
  >
    <q-tooltip
      anchor="bottom left"
      self="top left"
      v-if="!disabled && !mediaDisplayPopup"
    >
      {{ $t('media-display') }}
    </q-tooltip>
    <q-popup-proxy
      anchor="bottom right"
      self="top right"
      v-if="!disabled"
      v-model="mediaDisplayPopup"
    >
      <q-card class="non-selectable">
        <q-card-section>
          <div class="text-overline">{{ $t('media-display') }}</div>
          <div class="text-h5 text-primary" v-if="mediaPlayer.windowVisible">
            {{ $t('projecting') }} </div>
          <div class="text-h5 text-negative" v-else>{{ $t('inactive') }}</div>
          <div class="text-caption text-grey">{{ $t('external-screen') }}</div>
        </q-card-section>
        <q-separator />
        <q-card-actions>
          <q-btn
            @click="showMediaWindow(false)"
            flat
            v-if="mediaPlayer.windowVisible"
            >{{ $t('hide-media-display') }}</q-btn
          >
          <q-btn @click="showMediaWindow(true)" flat v-else
            >{{ $t('show-media-display') }}</q-btn
          >
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
    <q-badge
      :color="mediaPlayer.windowVisible ? 'positive' : 'negative'"
      floating
      rounded
      style="margin-top: 1.25em; margin-right: 0.25em"
    />
  </q-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { ref } from 'vue';

import { useCurrentStateStore } from '../../stores/current-state';

defineProps<{
  disabled?: boolean;
}>();

const currentState = useCurrentStateStore();
const { currentSettings, mediaPlayer } = storeToRefs(currentState);

const mediaDisplayPopup = ref();

const showMediaWindow = (state: boolean) => {
  mediaPlayer.value.windowVisible = state;
  electronApi.toggleMediaWindow(state ? 'show' : 'hide');
};
</script>
