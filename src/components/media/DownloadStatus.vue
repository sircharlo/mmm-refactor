<template>
  <q-btn push round :icon="Object.values(downloadProgress).filter(item => item.error).length === 0 ?
    'mdi-cloud-check-variant' : 'mdi-cloud'" size="md" flat
    :loading="Object.values(downloadProgress).filter(item => item.loaded).length > 0">
    <template v-slot:loading>
      <q-spinner-pie />
    </template>
    <q-popup-proxy>
      <div :class="'rounded-borders bg-grey-' + $q.dark.isActive ? '2' : '9'" style="width: 400px; height: 300px;">
        <q-list dense separator :class="'q-px-md non-selectable bg-grey-' + $q.dark.isActive ? '2' : '9'">
          <q-item v-if="Object.values(downloadProgress).length === 0" style="align-items: center;">
            <q-item-section class="q-pt-md">
              {{ $t('noDownloadsInProgress') }}
            </q-item-section>
            <q-space />
            <q-item-section avatar class="q-pr-none" style="align-items: end;">
              <q-icon name="mdi-check-circle" color="positive" />
            </q-item-section>
          </q-item>
          <template v-for="statusObject in statusConfig" :key="statusObject.status">
            <q-item-label v-if="hasStatus(downloadProgress, statusObject.status)" overline
              class="q-pt-md text-weight-bold text-uppercase">
              {{ $t(statusObject.label) }}
            </q-item-label>
            <q-item v-for="(item, url) in filteredDownloads(downloadProgress, statusObject.status)" :key="url"
              style="align-items: center;">
              <q-item-label caption lines="1">
                {{ basename(url as string) }}
              </q-item-label>
              <q-space />
              <q-item-section avatar class="q-pr-none" style="align-items: end;">
                <q-icon v-if="statusObject.icon" :name="statusObject.icon" :color="statusColor(statusObject.status)" />
                <q-circular-progress v-else-if="showProgress(item)" :value="progressValue(item)" color="primary"
                  size="18px" style="margin-right: 3px;" :thickness="0.3" />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
    </q-popup-proxy>
  </q-btn>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useCurrentStateStore } from 'src/stores/current-state';
import { storeToRefs } from 'pinia';
const currentState = useCurrentStateStore();
const { downloadProgress } = storeToRefs(currentState);
import { electronApi } from 'src/helpers/electron-api';
import { DownloadProgressItems } from 'src/types/media';
const { path } = electronApi;


export default defineComponent({
  name: 'DownloadStatus',
  setup() {
    return {
      downloadProgress,
      basename: path.basename,
      hasStatus: (obj: DownloadProgressItems, status: 'complete' | 'error' | 'loaded') => Object.values(obj).some(item => item[status]),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filteredDownloads: (obj: DownloadProgressItems, status: 'complete' | 'error' | 'loaded') => Object.fromEntries(Object.entries(obj).filter(([_, item]) => item[status]).sort(([keyA, valA], [keyB, valB]) => path.basename(keyA).localeCompare(path.basename(keyB)))) as DownloadProgressItems,
      statusColor: (status: string) => status === 'complete' ? 'positive' : 'negative',
      showProgress: (item: { loaded?: number; total?: number; }) => item.loaded && item.total,
      progressValue: (item: { loaded?: number; total?: number; }) => (item.loaded && item.total) ? ((item.loaded / item.total) * 100) : 0,
      statusConfig: [
        { status: 'loaded', label: 'inProgress', icon: '' },
        { status: 'error', label: 'errors', icon: 'mdi-alert-circle' },
        { status: 'complete', label: 'complete', icon: 'mdi-check-circle' },
      ] as { status: 'complete' | 'error' | 'loaded'; label: string; icon: string; }[],
    };
  },
});
</script>
