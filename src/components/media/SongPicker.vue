<template>
  <q-dialog persistent v-model="localValue">
    <q-card class="non-selectable" style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Choose a song {{ selectedSong }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-select
          :options="
            songOptions.map((song) => {
              return { value: song.track, label: song.title };
            })
          "
          @change="selectedSong = $event"
          @filter="filterFn"
          fill-input
          hide-selected
          input-debounce="10"
          label="Song"
          map-options
          use-input
          v-model="selectedSong"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn @click="dismissPopup" color="negative" flat label="Cancel" />
        <q-btn
          @click="addSong(selectedSong)"
          color="primary"
          flat
          label="Add song"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  dynamicMediaMapper,
  processMissingMediaInfo,
} from 'src/helpers/jw-media';
import { MultimediaItem } from 'src/types/sqlite';
import { ref, watch } from 'vue';

import { useCurrentStateStore } from '../../stores/current-state';
import { useJwStore } from '../../stores/jw';

// Define props and emits
const props = defineProps<{
  modelValue: boolean | null;
}>();

const emit = defineEmits(['update:modelValue']);

// Setup logic
const currentState = useCurrentStateStore();
const { currentSongbook, currentSongs, selectedDateObject } =
  storeToRefs(currentState);
const jwStore = useJwStore();
const { addToAdditionMediaMap } = jwStore;

const localValue = ref(props.modelValue);
const songOptions = ref(currentSongs.value);
const selectedSong = ref<{ label: string; value: number } | null>(null);

const dismissPopup = () => {
  localValue.value = false;
  selectedSong.value = null;
};

const addSong = async (
  selectedSong: { label: string; value: number } | null,
) => {
  if (selectedSong?.value) {
    const multimediaItem = {
      KeySymbol: currentSongbook.value.pub,
      Track: selectedSong.value,
    } as MultimediaItem;
    await processMissingMediaInfo([multimediaItem]);
    const additionalMedia = await dynamicMediaMapper(
      [multimediaItem],
      selectedDateObject.value?.date,
      true,
    );
    addToAdditionMediaMap(additionalMedia);
  }
  dismissPopup();
};

const filterFn = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    const needle = val.toLowerCase();
    songOptions.value = currentSongs.value.filter((v) =>
      v.title.toLowerCase().includes(needle),
    );
  });
};

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);
</script>
