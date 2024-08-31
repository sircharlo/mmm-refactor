<template>
  <q-dialog v-model="localValue">
    <div
      class="items-center q-pb-lg q-px-lg q-gutter-y-lg bg-secondary-contrast"
    >
      <div class="text-h6 row">{{ $t('import-media-from-s34mp') }}</div>
      <div class="row">{{ $t('select-s34mp-to-add-public-talk-media') }}</div>
      <div class="row items-center q-gutter-x-md">
        <q-icon name="mmm-file" size="md" />
        <div class="col text-subtitle2">
          {{
            s34mpDb
              ? path.basename(s34mpDb, path.extname(s34mpDb))
              : $t('select-s34mp')
          }}
        </div>
        <div class="col-grow text-caption" v-if="s34mpDb">
          {{ s34mpInfo.Year }}, v{{ s34mpInfo.VersionNumber }}
        </div>
        <q-btn @click="browse" color="primary" outline>
          <q-icon class="q-mr-sm" name="mmm-local-media" />
          {{ s34mpDb ? $t('replace') : $t('browse') }}
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
          style="height: 30vh; width: -webkit-fill-available"
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
import { addJwpubDocumentMediaToFiles } from 'src/helpers/jw-media';
import { decompressJwpub, findDb } from 'src/helpers/mediaPlayback';
import { useCurrentStateStore } from 'src/stores/current-state';
import { DocumentItem, PublicationInfo } from 'src/types/sqlite';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';

const { executeQuery, fs, openFileDialog, path } = electronApi;

const props = defineProps<{
  modelValue: boolean | null;
}>();

const emit = defineEmits(['update:modelValue']);

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

const s34mpBasename = ref();
const s34mpDir = ref();
const s34mpDb = ref();
const s34mpInfo = ref({} as PublicationInfo);

const populatePublicTalks = () => {
  s34mpDb.value = findDb(s34mpDir.value);
  if (!s34mpDb.value) return;
  publicTalks.value = executeQuery(
    s34mpDb.value,
    'SELECT DISTINCT Document.DocumentId, Title FROM Document INNER JOIN DocumentMultimedia ON Document.DocumentId = DocumentMultimedia.DocumentId',
  ) as DocumentItem[];
  const PublicationInfos = executeQuery(
    s34mpDb.value,
    'SELECT DISTINCT VersionNumber, Year FROM Publication',
  ) as PublicationInfo[];
  if (PublicationInfos.length) s34mpInfo.value = PublicationInfos[0];
};

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
  dismissPopup();
};

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
    if (currentSettings.value?.lang) {
      s34mpBasename.value = 'S-34mp_' + currentSettings.value?.lang + '_0';
      s34mpDir.value = path.join(getPublicationsPath(), s34mpBasename.value);
      populatePublicTalks();
    }
  },
);
</script>
