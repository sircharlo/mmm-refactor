<template>
  <q-dialog persistent v-model="localValue">
    <div
      class="items-center col q-pb-lg q-px-lg q-gutter-y-lg bg-secondary-contrast"
      style="width: 60vw; max-width: 60vw"
    >
      <div class="text-h6 row">{{ $t('import-local-media') }}</div>
      <template
        v-if="
          jwpubDocuments.length === 0 ||
          filesLoading ||
          (localJwpubDb && jwpubLoading)
        "
      >
        <div class="row">
          {{ $t('local-media-explain-1') }}
          {{ $t('local-media-explain-2') }}
        </div>
        <div class="row">
          <div
            class="col rounded-borders dashed-border items-center justify-center flex"
            style="height: 20vh"
          >
            <div class="col-6">
              <template v-if="filesLoading || (localJwpubDb && jwpubLoading)">
                <q-spinner color="primary" size="lg" />
              </template>
              <template v-else>
                <q-icon name="mdi-cursor-default-click" size="lg" />
                {{ $t('drag-and-drop-or ') }}
                <a @click="getLocalFiles()">{{ $t('browse for files') }}</a
                >.
              </template>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="row">
          {{ $t('choose-a-document-for-import') }}
        </div>
        <div class="row">
          <q-scroll-area
            :bar-style="barStyle"
            :thumb-style="thumbStyle"
            style="height: 40vh; width: -webkit-fill-available"
          >
            <q-list>
              <q-item
                :key="jwpubImportDocument.DocumentId"
                @click="
                  jwpubLoading = true;
                  addJwpubDocumentMediaToFiles(
                    localJwpubDb,
                    jwpubImportDocument,
                  ).then(() => {
                    localValue = false;
                    jwpubLoading = false;
                  });
                "
                clickable
                v-for="jwpubImportDocument in jwpubDocuments"
              >
                <q-item-section>
                  {{ jwpubImportDocument.Title }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </div>
      </template>
      <div class="row justify-end">
        <q-btn
          @click="
            localJwpubDb = '';
            localValue = false;
          "
          color="negative"
          flat
          >{{ $t('cancel') }}</q-btn
        >
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
// import { useCurrentStateStore } from 'src/stores/current-state';
import { barStyle, thumbStyle } from 'src/boot/globals';
// import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { addJwpubDocumentMediaToFiles } from 'src/helpers/jw-media';
// import { useJwStore } from 'src/stores/jw';
import { DocumentItem } from 'src/types/sqlite';
import { ref, watch } from 'vue';

const { openFileDialog } = electronApi;
// const jwStore = useJwStore();
// const { addToAdditionMediaMap } = jwStore;
// const currentStateStore = useCurrentStateStore();
// const { selectedDateObject } = storeToRefs(currentStateStore);
const props = defineProps<{
  jwpubDb: string;
  jwpubDocuments: DocumentItem[];
  modelValue: boolean;
}>();
const emit = defineEmits(['update:modelValue', 'update:jwpubDb']);
const localValue = ref(props.modelValue);
const localJwpubDb = ref(props.jwpubDb);
const jwpubLoading = ref(false);
const filesLoading = ref(false);

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(localJwpubDb, (newValue) => {
  emit('update:jwpubDb', newValue);
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);

watch(
  () => props.jwpubDb,
  (newValue) => {
    localJwpubDb.value = newValue;
  },
);

const getLocalFiles = async () => {
  openFileDialog()
    .then((result) => {
      if (result.filePaths.length > 0) {
        window.dispatchEvent(
          new CustomEvent('localFiles-browsed', {
            detail: result.filePaths.map((path) => {
              return {
                path,
              };
            }),
          }),
        );
      }
      localValue.value = false;
    })
    .catch((error) => {
      console.error(error);
    });
};
</script>
