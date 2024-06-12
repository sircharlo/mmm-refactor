<template>
  <!-- :loading="
      Object.values(downloadProgress).filter((item) => item.loaded).length > 0
    " -->
  <!-- <q-btn
    flat
    icon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cg transform='matrix(0.77 0 0 0.77 12 12)' %3E%3Cpath style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;' transform=' translate(-16, -16)' d='M 16 3 C 8.82 3 3 8.82 3 16 C 3 23.18 8.82 29 16 29 C 23.18 29 29 23.18 29 16 C 29 8.82 23.18 3 16 3 z M 16 5 C 22.065 5 27 9.935 27 16 C 27 16.50788 26.953696 17.004343 26.886719 17.494141 C 26.520485 15.461275 25.274395 13.591986 23.345703 12.513672 C 22.376703 11.970672 21.336969 11.691672 20.292969 11.638672 C 19.860969 12.439672 19.2195 13.106594 18.4375 13.558594 C 17.6665 14.003594 16.772547 14.236313 15.810547 14.195312 C 15.431547 14.179312 15.048359 14.140687 14.693359 14.054688 C 12.637359 13.471687 11.129344 11.587609 11.152344 9.3496094 C 11.168648 7.7089655 12.014884 6.24578 13.277344 5.3554688 C 14.149701 5.1321017 15.059033 5 16 5 z M 11.707031 5.8730469 C 9.9593818 7.197907 8.8307222 9.3171916 8.8632812 11.662109 C 8.8772812 12.773109 9.1568125 13.814141 9.6328125 14.744141 C 10.541813 14.718141 11.442609 14.938625 12.224609 15.390625 C 12.995609 15.835625 13.643844 16.494656 14.089844 17.347656 C 14.264844 17.682656 14.414625 18.00575 14.515625 18.34375 C 15.060625 20.42675 14.182703 22.696734 12.220703 23.802734 C 11.169801 24.395897 9.974626 24.559981 8.8574219 24.347656 C 6.501292 22.328555 5 19.338626 5 16 C 5 11.457453 7.768964 7.5491323 11.707031 5.8730469 z M 21.886719 14.984375 C 22.677699 15.005146 23.474953 15.220719 24.205078 15.652344 C 25.487851 16.409673 26.310364 17.684901 26.556641 19.064453 C 25.225431 23.641945 21.000983 27 16 27 C 14.008698 27 12.144256 26.46055 10.53125 25.53125 C 12.146679 25.801922 13.865799 25.524862 15.369141 24.628906 C 16.324141 24.060906 17.084344 23.300828 17.652344 22.423828 C 17.175344 21.649828 16.917969 20.759469 16.917969 19.855469 C 16.917969 18.965469 17.163688 18.073719 17.679688 17.261719 C 17.881688 16.942719 18.071594 16.662109 18.308594 16.412109 C 19.265469 15.455859 20.568418 14.949756 21.886719 14.984375 z' stroke-linecap='round' /%3E%3C/g%3E%3C/svg%3E"
    push
    round
    size="md"
    v-if="currentSettings.obsEnable"
  > -->
  <q-btn
    @click="obsConnectionState === 'disconnected' && obsConnect()"
    flat
    round
    v-if="currentSettings.obsEnable"
  >
    <q-icon>
      <q-tooltip v-if="obsMessage">{{ $t(obsMessage) }}</q-tooltip>
      <svg
        height="48"
        viewBox="0 0 24 24"
        width="48"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <rect height="48" opacity="0" stroke="none" width="48" />

        <g transform="matrix(0.77 0 0 0.77 12 12)">
          <path
            d="M 16 3 C 8.82 3 3 8.82 3 16 C 3 23.18 8.82 29 16 29 C 23.18 29 29 23.18 29 16 C 29 8.82 23.18 3 16 3 z M 16 5 C 22.065 5 27 9.935 27 16 C 27 16.50788 26.953696 17.004343 26.886719 17.494141 C 26.520485 15.461275 25.274395 13.591986 23.345703 12.513672 C 22.376703 11.970672 21.336969 11.691672 20.292969 11.638672 C 19.860969 12.439672 19.2195 13.106594 18.4375 13.558594 C 17.6665 14.003594 16.772547 14.236313 15.810547 14.195312 C 15.431547 14.179312 15.048359 14.140687 14.693359 14.054688 C 12.637359 13.471687 11.129344 11.587609 11.152344 9.3496094 C 11.168648 7.7089655 12.014884 6.24578 13.277344 5.3554688 C 14.149701 5.1321017 15.059033 5 16 5 z M 11.707031 5.8730469 C 9.9593818 7.197907 8.8307222 9.3171916 8.8632812 11.662109 C 8.8772812 12.773109 9.1568125 13.814141 9.6328125 14.744141 C 10.541813 14.718141 11.442609 14.938625 12.224609 15.390625 C 12.995609 15.835625 13.643844 16.494656 14.089844 17.347656 C 14.264844 17.682656 14.414625 18.00575 14.515625 18.34375 C 15.060625 20.42675 14.182703 22.696734 12.220703 23.802734 C 11.169801 24.395897 9.974626 24.559981 8.8574219 24.347656 C 6.501292 22.328555 5 19.338626 5 16 C 5 11.457453 7.768964 7.5491323 11.707031 5.8730469 z M 21.886719 14.984375 C 22.677699 15.005146 23.474953 15.220719 24.205078 15.652344 C 25.487851 16.409673 26.310364 17.684901 26.556641 19.064453 C 25.225431 23.641945 21.000983 27 16 27 C 14.008698 27 12.144256 26.46055 10.53125 25.53125 C 12.146679 25.801922 13.865799 25.524862 15.369141 24.628906 C 16.324141 24.060906 17.084344 23.300828 17.652344 22.423828 C 17.175344 21.649828 16.917969 20.759469 16.917969 19.855469 C 16.917969 18.965469 17.163688 18.073719 17.679688 17.261719 C 17.881688 16.942719 18.071594 16.662109 18.308594 16.412109 C 19.265469 15.455859 20.568418 14.949756 21.886719 14.984375 z"
            stroke-linecap="round"
            style="
              stroke: none;
              stroke-width: 1;
              stroke-dasharray: none;
              stroke-linecap: butt;
              stroke-dashoffset: 0;
              stroke-linejoin: miter;
              stroke-miterlimit: 4;
              fill-rule: nonzero;
              opacity: 1;
            "
            transform=" translate(-16, -16)"
          />
        </g>
      </svg>
      <!-- <template v-slot:loading>
      <q-spinner-rings />
    </template> -->
      <!-- <q-popup-proxy> -->
      <!-- <div
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
          <q-item
            style="align-items: center"
            v-if="Object.values(downloadProgress).length === 0"
          >
            <q-item-section class="q-pt-md">
              {{ $t('noDownloadsInProgress') }}
            </q-item-section>
            <q-space />
            <q-item-section avatar class="q-pr-none" style="align-items: end">
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
            <q-item
              :key="url"
              style="align-items: center"
              v-for="(item, url) in filteredDownloads(
                downloadProgress,
                statusObject.status,
              )"
            >
              <q-item-label caption lines="1">
                {{ basename(url as string) }}
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
          </template>
        </q-list>
      </div> -->
      <!-- </q-popup-proxy> -->
    </q-icon>
    <q-badge
      :color="
        obsConnectionState === 'connected'
          ? 'positive'
          : obsConnectionState === 'disconnected'
          ? 'negative'
          : 'warning'
      "
      floating
      rounded
      style="margin-top: 1.5em"
    />
  </q-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
// import { electronApi } from 'src/helpers/electron-api';
// import { DownloadProgressItems } from 'src/types/media';

import { useCurrentStateStore } from '../../stores/current-state';
import { useObsStateStore } from '../../stores/obs-state';

// Initialize store and destructure reactive properties
const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);

const obsState = useObsStateStore();
const { obsConnectionState, obsMessage } = storeToRefs(obsState);

import { obsConnect } from 'src/helpers/obs';

// Setup component
// const { path } = electronApi;
// const basename = path.basename;

// Method to filter downloads by status
// const filteredDownloads = (
//   obj: DownloadProgressItems,
//   status: 'complete' | 'error' | 'loaded',
// ) =>
//   Object.fromEntries(
//     Object.entries(obj)
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       .filter(([_, item]) => item[status])
//       .sort(([keyA], [keyB]) =>
//         path.basename(keyA).localeCompare(path.basename(keyB)),
//       ),
//   ) as DownloadProgressItems;

// Method to check if downloads have a specific status
// const hasStatus = (
//   obj: DownloadProgressItems,
//   status: 'complete' | 'error' | 'loaded',
// ) => Object.values(obj).some((item) => item[status]);

// Method to calculate progress value
// const progressValue = (item: { loaded?: number; total?: number }) =>
//   item.loaded && item.total ? (item.loaded / item.total) * 100 : 0;

// // Method to check if progress is available
// const showProgress = (item: { loaded?: number; total?: number }) =>
//   item.loaded && item.total;

// // Method to determine status color
// const statusColor = (status: string) =>
//   status === 'complete' ? 'positive' : 'negative';

// // Status configuration
// const statusConfig = [
//   { icon: '', label: 'inProgress', status: 'loaded' },
//   { icon: 'mdi-alert-circle', label: 'errors', status: 'error' },
//   { icon: 'mdi-check-circle', label: 'complete', status: 'complete' },
// ] as { icon: string; label: string; status: 'complete' | 'error' | 'loaded' }[];
</script>
