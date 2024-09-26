<template>
  <q-dialog v-model="open">
    <div
      class="items-center q-pb-lg q-px-lg q-gutter-y-lg bg-secondary-contrast"
    >
      <div class="row items-center">
        <div class="col-shrink q-mr-md">
          <img col src="favicon.ico" style="max-height: 10vh; display: flex" />
        </div>
        <div class="col">
          <div class="row text-h6">
            {{ $t('meeting-media-manager') }}
          </div>
          <div class="row">v{{ appVersion }}</div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          {{ $t('app-description') }}
        </div>
      </div>
      <div class="row q-gutter-x-md">
        <div class="col">
          <q-btn
            @click="openExternalWebsite(githubLink)"
            class="q-pa-md full-width"
            color="accent-400"
            no-caps
            outline
            target="_blank"
          >
            <div class="row q-gutter-x-md full-width items-center">
              <div class="col-shrink text-primary q-ml-none">
                <q-icon name="mmm-github" />
              </div>
              <div class="col-shrink text-secondary">
                {{ $t('github-repo') }}
              </div>
              <div class="col text-right text-accent-400">
                <q-icon name="mmm-arrow-outward" />
              </div>
            </div>
          </q-btn>
        </div>
        <div class="col">
          <q-btn
            @click="openExternalWebsite(docsLink)"
            class="q-pa-md full-width"
            color="accent-400"
            no-caps
            outline
            target="_blank"
          >
            <div class="row q-gutter-x-md full-width items-center">
              <div class="col-shrink text-primary q-ml-none">
                <q-icon name="mmm-guide" />
              </div>
              <div class="col-shrink text-secondary">
                {{ $t('user-guide') }}
              </div>
              <div class="col text-right text-accent-400">
                <q-icon name="mmm-arrow-outward" />
              </div>
            </div>
          </q-btn>
        </div>
      </div>
      <div class="row">
        <div class="col">
          {{ $t('app-issues') }}
        </div>
      </div>
      <div class="row justify-end">
        <q-btn flat v-close-popup>{{ $t('close') }}</q-btn>
      </div>
    </div>
  </q-dialog>
</template>
<script setup lang="ts">
import { electronApi } from 'src/helpers/electron-api';

const { getAppVersion, openExternalWebsite } = electronApi;

const open = defineModel<boolean>({ default: false });
const appVersion = getAppVersion();
const githubLink = 'https://github.com/sircharlo/mmm-refactor';
const docsLink = 'https://sircharlo.github.io/mmm-refactor/';
</script>
