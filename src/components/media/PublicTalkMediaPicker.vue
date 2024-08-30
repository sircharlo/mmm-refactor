<template>
  <q-dialog v-model="localValue">
    <div
      class="items-center q-pb-lg q-px-lg q-gutter-y-lg bg-secondary-contrast"
    >
      <div class="text-h6 row">{{ $t('import-media-from-s34mp') }}</div>
      <div class="row">{{ $t('select-s34mp-to-add-public-talk-media') }}</div>
      <div class="row items-center q-gutter-x-md">
        <q-icon name="mmm-file" size="md" />
        <div class="col-grow">
          {{
            s34mpDb
              ? path.basename(s34mpDb, path.extname(s34mpDb))
              : $t('select-s34mp')
          }}
          <!-- TODO: Add "YEAR, version VERSION" here -->
        </div>
        <q-btn @click="browse" color="primary" outline>
          <q-icon class="q-mr-sm" name="mmm-local-media" />
          {{ $t('browse') }}
        </q-btn>
      </div>
      <div class="row">
        <q-input
          :label="$t('search')"
          class="col"
          clearable
          debounce="100"
          dense
          outlined
          v-model="filter"
        >
          <template v-slot:prepend>
            <q-icon name="mmm-search" />
          </template>
        </q-input>
      </div>
      <div class="row">
        <q-scroll-area
          :bar-style="barStyle"
          :thumb-style="thumbStyle"
          style="height: 40vh; width: -webkit-fill-available"
        >
          <template :key="publicTalk" v-for="publicTalk in filteredPublicTalks">
            <q-item
              @click="addPublicTalkMedia(publicTalk)"
              class="items-center"
              clickable
              v-ripple
            >
              {{ publicTalk.Title }}
            </q-item>
          </template>
        </q-scroll-area>
      </div>
      <div class="row justify-end">
        <q-btn @click="dismissPopup" color="negative" flat>{{
          $t('cancel')
        }}</q-btn>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { barStyle, thumbStyle } from 'src/boot/globals';
// import { errorCatcher } from 'src/helpers/error-catcher';
import { electronApi } from 'src/helpers/electron-api';
import { getPublicationsPath } from 'src/helpers/fs';
import {
  addJwpubDocumentMediaToFiles,
  // getDocumentMultimediaItems,
} from 'src/helpers/jw-media';
import { decompressJwpub, findDb } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { DocumentItem } from 'src/types/sqlite';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';

const { executeQuery, fs, openFileDialog, path } = electronApi;

// // Define props and emits
const props = defineProps<{
  modelValue: boolean | null;
}>();

const emit = defineEmits(['update:modelValue']);

// // Setup logic
const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);

const localValue = ref(props.modelValue);

const filter = ref('');
const publicTalks: Ref<DocumentItem[]> = ref([]);
const filteredPublicTalks: ComputedRef<DocumentItem[]> = computed(() => {
  return filter.value
    ? publicTalks.value.filter((s) =>
        s.Title.toLowerCase().includes(filter.value.toLowerCase()),
      )
    : publicTalks.value;
});

// TODO: Check why not dynamic/persistent here
const s34mpBasename = computed(() => 'S-34mp_' + currentSettings.value?.lang + '_0');
const s34mpDir = computed(() =>
  path.join(getPublicationsPath(), s34mpBasename.value),
);
const s34mpDb = ref();

const populatePublicTalks = () => {
  s34mpDb.value = findDb(s34mpDir.value);
  if (!s34mpDb.value) return;
  publicTalks.value = executeQuery(
    s34mpDb.value,
    'SELECT DISTINCT Document.DocumentId, Title FROM Document INNER JOIN DocumentMultimedia ON Document.DocumentId = DocumentMultimedia.DocumentId',
  ) as DocumentItem[];
};
populatePublicTalks();

const browse = async () => {
  const s34mpFileSelection = await openFileDialog(true);
  if (!s34mpFileSelection || !s34mpFileSelection.filePaths.length) return;
  const s34mpFile = s34mpFileSelection.filePaths[0];
  fs.ensureDirSync(s34mpDir.value);
  decompressJwpub(s34mpFile, s34mpDir.value);
  populatePublicTalks();
};

const dismissPopup = () => {
  localValue.value = false;
};

const addPublicTalkMedia = (publicTalkDocId: DocumentItem) => {
  if (!s34mpDb.value || !publicTalkDocId) return;
  addJwpubDocumentMediaToFiles(s34mpDb.value, publicTalkDocId);
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
