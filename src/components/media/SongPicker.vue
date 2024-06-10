<template>
  <q-dialog persistent v-model="localValue">
    <q-card style="min-width: 500px;" class="non-selectable">
      <q-card-section>
        <div class="text-h6">Choose a song {{ selectedSong }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-select map-options v-model="selectedSong" use-input hide-selected input-debounce="10" fill-input
          :options="songOptions.map(song => { return { value: song.track, label: song.title } })" @filter="filterFn"
          @change="selectedSong = $event" label="Song" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" @click="dismissPopup" />
        <q-btn flat label="Add song" color="primary" @click="addSong(selectedSong)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

import { storeToRefs } from 'pinia';

import { useCurrentStateStore } from 'stores/current-state';
import { dynamicMediaMapper, processMissingMediaInfo } from 'src/helpers/jw-media';
import { MultimediaItem } from 'src/types/sqlite';
const currentState = useCurrentStateStore();
const { currentSongs, currentSongbook, selectedDateObject } = storeToRefs(currentState);

import { useJwStore } from 'src/stores/jw';
const jwStore = useJwStore();
const { addToAdditionMediaMap } = jwStore;


export default defineComponent({
  name: 'SongPicker',
  props: {
    modelValue: {
      type: [Boolean],
      default: null,
    },
  },
  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const localValue = ref(props.modelValue);

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        localValue.value = newValue;
      }
    )
    const songOptions = ref(currentSongs.value)
    const selectedSong = ref(null)


    const dismissPopup = () => {
      localValue.value = false
      selectedSong.value = null
    }
    return {
      localValue,
      songOptions,
      selectedSong,
      filterFn(val: string, update: (arg0: () => void) => void) {
        update(() => {
          const needle = val.toLowerCase()
          songOptions.value = currentSongs.value.filter(v => v.title.toLowerCase().indexOf(needle) > -1)
        })
      },
      dismissPopup,
      async addSong(selectedSong: { label: string, value: number } | null) {
        if (selectedSong?.value) {
          const multimediaItem = {
            KeySymbol: currentSongbook.value.pub,
            Track: selectedSong?.value
          } as MultimediaItem
          await processMissingMediaInfo([multimediaItem])
          const additionalMedia = await dynamicMediaMapper([multimediaItem], selectedDateObject.value?.date, true)
          addToAdditionMediaMap(additionalMedia);
        }
        dismissPopup()
      },
    };
  },
});
</script>
