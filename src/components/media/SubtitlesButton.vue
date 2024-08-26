<template>
  <!-- todo: add custom icon for this -->
  <q-btn
    :color="!subtitlesVisible ? 'negative' : 'white-transparent'"
    :icon="subtitlesVisible ? 'mmm-subtitles' : 'mmm-subtitles-off'"
    @click="subtitlesVisible = !subtitlesVisible"
    class="super-rounded"
    rounded
    unelevated
    v-if="currentSettings.enableSubtitles"
  >
    <q-tooltip :delay="2000">{{ $t('subtitles') }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCurrentStateStore } from 'src/stores/current-state';
import { ref, watch } from 'vue';

const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);

const subtitlesVisible = ref(false);

const bc = new BroadcastChannel('mediaPlayback');

watch(
  () => subtitlesVisible.value,
  (newSubtitlesVisible, oldSubtitlesVisible) => {
    if (newSubtitlesVisible !== oldSubtitlesVisible)
      bc.postMessage({ subtitlesVisible: newSubtitlesVisible });
  },
);
</script>
