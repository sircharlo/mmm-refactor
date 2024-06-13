<template>
  <q-btn
    @click="mediaPlayer.subtitlesVisible = !mediaPlayer.subtitlesVisible"
    flat
    icon="mdi-subtitles"
    v-if="currentSettings.enableSubtitles"
  >
    <q-tooltip>{{ $t('subtitles') }}</q-tooltip>
    <q-badge
      :color="mediaPlayer.subtitlesVisible ? 'positive' : 'negative'"
      floating
      rounded
      style="margin-top: 1.25em; margin-right: 0.25em"
    />
  </q-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useCurrentStateStore } from '../../stores/current-state';

// Initialize store and destructure reactive properties
const currentState = useCurrentStateStore();
const { currentSettings, mediaPlayer } = storeToRefs(currentState);
</script>
