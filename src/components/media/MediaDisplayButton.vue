<template>
  <q-btn :icon="mediaPlayer.windowVisible ? 'mdi-television' : 'mdi-television-off'" @click="mediaDisplayPopup = false" :flat="!disabled" :outline="disabled"
    :disable="disabled" :color="mediaPlayer.windowVisible ? '' : 'red-5'">
    <q-tooltip v-if="!disabled && !mediaDisplayPopup" anchor="bottom left" self="top left">
      Media display
    </q-tooltip>
    <q-popup-proxy v-if="!disabled" anchor="bottom right" self="top right" v-model="mediaDisplayPopup">
      <q-card>
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
          <q-btn flat @click="showMediaWindow(false)" v-if="mediaPlayer.windowVisible">Hide media display</q-btn>
          <q-btn flat @click="showMediaWindow(true)" v-else>Show media display</q-btn>
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { electronApi } from 'src/helpers/electron-api';
import { useCurrentStateStore } from 'stores/current-state';
import { storeToRefs } from 'pinia';
const currentState = useCurrentStateStore();
const { mediaPlayer } = storeToRefs(currentState);

const { toggleMediaWindow } = electronApi;
const mediaDisplayPopup = ref();

const showMediaWindow = (state: boolean) => {
  mediaPlayer.value.windowVisible = state;
  toggleMediaWindow(state ? 'show' : 'hide');
};

export default defineComponent({
  name: 'MediaDisplayButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  setup() {
    return {
      mediaDisplayPopup,
      showMediaWindow,
      mediaPlayer
    };
  },
});
</script>
