<template>
  <q-btn
    :color="!mediaPlayingSubtitlesVisible ? 'negative' : 'white-transparent'"
    @click="mediaPlayingSubtitlesVisible = !mediaPlayingSubtitlesVisible"
    class="super-rounded"
    icon="mdi-closed-caption"
    rounded
    unelevated
    v-if="currentSettings.enableSubtitles"
  >
    <q-tooltip>{{ $t('subtitles') }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCurrentStateStore } from 'src/stores/current-state';

const currentState = useCurrentStateStore();
const { currentSettings, mediaPlayingSubtitlesVisible } = storeToRefs(currentState);
</script>
