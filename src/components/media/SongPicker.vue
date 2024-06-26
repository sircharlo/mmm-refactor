<template>
  <q-dialog v-model="localValue">
    <q-card class="non-selectable" style="min-width: 500px">
      <q-card-section>
        <div class="row self-center">
          <q-avatar
            class="q-mr-md self-center"
            color="primary"
            icon="mdi-music-clef-treble"
            text-color="white"
          />
          <span class="text-h6 self-center">
            {{ $t('choose-a-song') }}
          </span>
          <q-space />
          <div class="text-h6 self-center">
            <q-btn @click="dismissPopup" dense flat icon="close" round v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-select
          :label="$t('song')"
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
          map-options
          spellcheck="false"
          use-input
          v-model="selectedSong"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          :label="$t('add-song')"
          @click="addSong(selectedSong)"
          color="primary"
          flat
        />
      </q-card-actions>
      <q-inner-loading :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  dynamicMediaMapper,
  processMissingMediaInfo,
} from 'src/helpers/jw-media';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { MultimediaItem } from 'src/types/sqlite';
import { ref, watch } from 'vue';

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
const loading = ref(false);
const songOptions = ref(currentSongs.value);
const selectedSong = ref<{ label: string; value: number } | null>(null);

const dismissPopup = () => {
  localValue.value = false;
  loading.value = false;
  selectedSong.value = null;
};

const addSong = async (
  selectedSong: { label: string; value: number } | null,
) => {
  try {
    loading.value = true;
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
  } catch (error) {
    console.error(error);
  } finally {
    dismissPopup();
  }
};

const filterFn = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    songOptions.value = currentSongs.value.filter((v) =>
      val ? v.title.toLowerCase().includes(val.toLowerCase()) : true,
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
