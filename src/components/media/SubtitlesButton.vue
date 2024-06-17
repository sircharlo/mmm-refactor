<template>
  <q-btn
    @click="mediaPlayer.subtitlesVisible = !mediaPlayer.subtitlesVisible"
    class="q-ml-sm"
    flat
    icon="mdi-subtitles"
    rounded
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
import { useCurrentStateStore } from 'src/stores/current-state';

const currentState = useCurrentStateStore();
const { currentSettings, mediaPlayer } = storeToRefs(currentState);
</script>
