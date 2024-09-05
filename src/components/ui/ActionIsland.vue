<template>
  <div class="flex" id="actionIsland" style="justify-content: center">
    <div id="musicPopupAnchor" />
    <div id="mediaDisplayPopupAnchor" />
    <div id="obsPopupAnchor" />

    <q-chip
      :ripple="false"
      class="action-island"
      color="primary"
      rounded
      size="xl"
    >
      <div class="flex q-gutter-x-md">
        <DownloadStatus
          :download="downloadPopup"
          @update:download="downloadPopup = $event"
        />
        <q-separator class="bg-semi-white-24" vertical />
        <MusicButton :music="musicPopup" @update:music="musicPopup = $event" />
        <SubtitlesButton />
        <ObsStatus />
        <MediaDisplayButton />
      </div>
    </q-chip>
    <q-dialog position="bottom" v-model="downloadPopup">
      <q-card flat>
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
                    <q-icon color="positive" name="mmm-cloud-done" size="sm" />
                  </div>
                </div>
              </template>
              <template v-else>
                <template
                  :key="statusObject.status"
                  v-for="statusObject in statusConfig"
                >
                  <!-- <q-scroll-area style="height: 200px; max-width: 100%"> -->
                  <p
                    class="card-section-title text-dark-grey q-mt-md"
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
                  <!-- </q-scroll-area> -->
                </template>
              </template>
            </div>
          </q-slide-transition>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import DownloadStatus from 'src/components/media/DownloadStatus.vue';
import MediaDisplayButton from 'src/components/media/MediaDisplayButton.vue';
import MusicButton from 'src/components/media/MusicButton.vue';
import ObsStatus from 'src/components/media/ObsStatus.vue';
import SubtitlesButton from 'src/components/media/SubtitlesButton.vue';
import { electronApi } from 'src/helpers/electron-api';
import { useCurrentStateStore } from 'src/stores/current-state';
import { DownloadProgressItems } from 'src/types/media';
import { ref } from 'vue';

const { path } = electronApi;
const currentState = useCurrentStateStore();
const { downloadProgress } = storeToRefs(currentState);
const downloadPopup = ref(false);
const musicPopup = ref(false);

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
  { icon: 'mmm-error', label: 'errors', status: 'error' },
  { icon: 'mmm-cloud-done', label: 'complete', status: 'complete' },
] as { icon: string; label: string; status: 'complete' | 'error' | 'loaded' }[];
</script>
