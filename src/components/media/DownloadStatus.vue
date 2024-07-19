<template>
  <q-btn
    :color="
      !online || Object.values(downloadProgress).find((item) => item.error)
        ? 'negative'
        : 'white-transparent'
    "
    :loading="
      Object.values(downloadProgress).filter((item) => item.loaded).length > 0
    "
    class="super-rounded"
    rounded
    unelevated
  >
    <template v-slot:loading>
      <span class="fa-stack" style="font-size: 0.75em">
        <i class="fa-solid fa-cloud fa-stack-2x"></i>
        <i class="text-primary fa-solid fa-sync fa-stack-1x fa-spin"></i>
      </span>
    </template>
    <span class="fa-stack" style="font-size: 0.75em">
      <i class="fa-solid fa-cloud fa-stack-2x"></i>
      <i
        :class="
          'text-primary fa-solid fa-stack-1x ' +
          (online &&
          Object.values(downloadProgress).filter((item) => item.error)
            .length === 0
            ? 'fa-check'
            : 'fa-exclamation')
        "
      ></i>
    </span>
    <q-tooltip anchor="bottom left" self="top left" v-if="!downloadPopup">
      {{ $t('download-status') }}
    </q-tooltip>
    <q-popup-proxy
      :offset="[0, 28]"
      @before-hide="downloadPopup = false"
      @before-show="downloadPopup = true"
      anchor="top middle"
      class="round-card"
      flat
      self="bottom middle"
    >
      <q-card
        class="non-selectable"
        flat
        style="min-width: 50vw; max-height: 50vh"
      >
        <q-card-section>
          <div class="card-title">
            {{ $t('media-sync') }}
          </div>
          <q-slide-transition>
            <div>
              <template v-if="Object.values(downloadProgress).length === 0">
                <div class="row items-center">
                  <div class="col text-weight-medium text-dark-grey">
                    {{ $t('noDownloadsInProgress') }}
                  </div>
                  <div class="col-shrink">
                    <q-icon
                      color="positive"
                      name="mdi-check-circle"
                      size="sm"
                    />
                  </div>
                </div>
              </template>
              <template v-else>
                <template
                  :key="statusObject.status"
                  v-for="statusObject in statusConfig"
                >
                  <p
                    class="card-section-title text-dark-grey"
                    v-if="hasStatus(downloadProgress, statusObject.status)"
                  >
                    {{ $t(statusObject.label) }}
                  </p>
                  <template
                    :key="url"
                    v-for="(item, url) in filteredDownloads(
                      downloadProgress,
                      statusObject.status,
                    )"
                  >
                    <div class="row items-center q-py-sm">
                      <div class="col text-weight-medium text-dark-grey">
                        {{ url && path.basename(url as string) }}
                      </div>
                      <div class="col-shrink">
                        <q-icon
                          :color="statusColor(statusObject.status)"
                          :name="statusObject.icon"
                          size="sm"
                          v-if="statusObject.icon"
                        />
                        <q-circular-progress
                          :thickness="0.3"
                          :value="progressValue(item)"
                          color="primary"
                          size="sm"
                          v-else-if="showProgress(item)"
                        />
                      </div>
                    </div>
                    <q-separator class="bg-accent-200" />
                  </template>
                </template>
              </template>
            </div>
          </q-slide-transition>
        </q-card-section>
      </q-card>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
import isOnline from 'is-online';
import { storeToRefs } from 'pinia';
import { electronApi } from 'src/helpers/electron-api';
import { useCurrentStateStore } from 'src/stores/current-state';
import { DownloadProgressItems } from 'src/types/media';
import { onMounted, ref } from 'vue';

const currentState = useCurrentStateStore();
const { downloadProgress, online } = storeToRefs(currentState);
const { path } = electronApi;
const downloadPopup = ref(false);

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
