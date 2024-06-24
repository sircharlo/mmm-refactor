<template>
  {{ online }}
  <q-btn
    :icon="
      Object.values(downloadProgress).filter((item) => item.error).length === 0
        ? 'mdi-cloud-check-variant'
        : 'mdi-cloud'
    "
    :loading="
      Object.values(downloadProgress).filter((item) => item.loaded).length > 0
    "
    flat
    push
    rounded
  >
    <template v-slot:loading>
      <q-spinner-pie />
    </template>
    <q-tooltip anchor="bottom left" self="top left">
      <!-- v-if="!disabled && !mediaDisplayPopup" -->
      {{ $t('download-status') }}
    </q-tooltip>
    <q-popup-proxy>
      <div
        :class="'rounded-borders bg-grey-' + $q.dark.isActive ? '2' : '9'"
        style="width: 400px; height: 300px"
      >
        <q-list
          :class="
            'q-px-md non-selectable bg-grey-' + $q.dark.isActive ? '2' : '9'
          "
          dense
          separator
        >
          <!-- <q-slide-transition> -->
          <q-item
            style="align-items: center"
            v-if="Object.values(downloadProgress).length === 0"
          >
            <q-item-section class="q-pt-md">
              {{ $t('noDownloadsInProgress') }}
            </q-item-section>
            <q-space />
            <q-item-section
              avatar
              class="q-pt-md q-pl-md"
              style="align-items: end"
            >
              <q-icon color="positive" name="mdi-check-circle" />
            </q-item-section>
          </q-item>
          <template
            :key="statusObject.status"
            v-for="statusObject in statusConfig"
          >
            <q-item-label
              class="q-pt-md q-pl-md text-weight-bold text-uppercase"
              overline
              v-if="hasStatus(downloadProgress, statusObject.status)"
            >
              {{ $t(statusObject.label) }}
            </q-item-label>
            <!-- <q-slide-transition> -->
            <q-item
              :key="url"
              style="align-items: center"
              v-for="(item, url) in filteredDownloads(
                downloadProgress,
                statusObject.status,
              )"
            >
              <q-item-label caption lines="1">
                {{ url && path.basename(url as string) }}
              </q-item-label>
              <q-space />
              <q-item-section avatar class="q-pr-none" style="align-items: end">
                <q-icon
                  :color="statusColor(statusObject.status)"
                  :name="statusObject.icon"
                  v-if="statusObject.icon"
                />
                <q-circular-progress
                  :thickness="0.3"
                  :value="progressValue(item)"
                  color="primary"
                  size="18px"
                  style="margin-right: 3px"
                  v-else-if="showProgress(item)"
                />
              </q-item-section>
            </q-item>
            <!-- </q-slide-transition> -->
          </template>
          <!-- </q-slide-transition> -->
        </q-list>
      </div>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
import isOnline from 'is-online';
import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { useCurrentStateStore } from 'src/stores/current-state';
import { DownloadProgressItems } from 'src/types/media';
import { onMounted } from 'vue';

const currentState = useCurrentStateStore();
const { downloadProgress, online } = storeToRefs(currentState);
const { path } = electronApi;

const filteredDownloads = (
  obj: DownloadProgressItems,
  status: 'complete' | 'error' | 'loaded',
) =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([, item]) => item[status])
      .sort(([keyA], [keyB]) =>
        path.basename(keyA).localeCompare(path.basename(keyB)),
      ),
  ) as DownloadProgressItems;

const hasStatus = (
  obj: DownloadProgressItems,
  status: 'complete' | 'error' | 'loaded',
) => Object.values(obj).some((item) => item[status]);

const progressValue = (item: { loaded?: number; total?: number }) =>
  item.loaded && item.total ? (item.loaded / item.total) * 100 : 0;

const showProgress = (item: { loaded?: number; total?: number }) =>
  item.loaded && item.total;

const statusColor = (status: string) =>
  status === 'complete' ? 'positive' : 'negative';

const statusConfig = [
  { icon: '', label: 'inProgress', status: 'loaded' },
  { icon: 'mdi-alert-circle', label: 'errors', status: 'error' },
  { icon: 'mdi-check-circle', label: 'complete', status: 'complete' },
] as { icon: string; label: string; status: 'complete' | 'error' | 'loaded' }[];

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
