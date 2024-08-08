<template>
  <q-btn
    :color="
      !online || Object.values(downloadProgress).find((item) => item.error)
        ? 'negative'
        : 'white-transparent'
    "
    @click="localDownloadPopup = true"
    class="super-rounded position-relative"
    rounded
    unelevated
  >
    <q-icon
      :name="
        Object.values(downloadProgress).filter((item) => item.error).length ===
        0
          ? Object.values(downloadProgress).filter((item) => item.loaded)
              .length > 0
            ? 'mmm-cloud'
            : 'mmm-cloud-done'
          : 'mmm-cloud-error'
      "
    >
    </q-icon>
    <q-spinner
      class="absolute"
      color="primary"
      size="8px"
      style="top: 14"
      v-if="
        Object.values(downloadProgress).filter((item) => item.loaded).length > 0
      "
    />
    <q-tooltip
      :delay="2000"
      anchor="bottom left"
      self="top left"
      v-if="!localDownloadPopup"
    >
      {{ $t('download-status') }}
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import isOnline from 'is-online';
import { storeToRefs } from 'pinia';
// import { electronApi } from 'src/helpers/electron-api';
import { useCurrentStateStore } from 'src/stores/current-state';
// import { DownloadProgressItems } from 'src/types/media';
import { onMounted, ref, watch } from 'vue';

const emit = defineEmits(['update:download']);

const currentState = useCurrentStateStore();
const { downloadProgress, online } = storeToRefs(currentState);
// const { path } = electronApi;
// const downloadPopup = ref(false);

const props = defineProps<{
  download: boolean;
}>();

const localDownloadPopup = ref(props.download);

watch(localDownloadPopup, (newValue) => {
  emit('update:download', newValue);
});

watch(
  () => props.download,
  (newValue) => {
    localDownloadPopup.value = newValue;
  },
);

const updateOnline = async () => {
  try {
    online.value = await isOnline();
  } catch (error) {
    console.error(error);
  }
};

setInterval(() => {
  updateOnline();
}, 10000);

onMounted(async () => {
  updateOnline();
});
</script>
