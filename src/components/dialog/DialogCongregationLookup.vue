<template>
  <q-dialog v-model="open" persistent>
    <div
      class="items-center q-pb-lg q-px-lg q-gutter-y-lg bg-secondary-contrast"
    >
      <div class="text-h6 row">{{ $t('congregation-lookup') }}</div>
      <div class="row">{{ $t('congregation-lookup-explain') }}</div>
      <div class="row">
        <div class="col-grow">
          <q-input
            v-model="congregationName"
            clearable
            dense
            outlined
            spellcheck="false"
            @update:model-value="lookupCongregation"
          >
            <template #prepend>
              <q-icon name="mmm-search" />
            </template>
          </q-input>
        </div>
      </div>
      <div class="row">
        <q-scroll-area
          :bar-style="barStyle()"
          :thumb-style="thumbStyle()"
          style="height: 25vh; width: -webkit-fill-available"
        >
          <q-list class="full-width" padding separator>
            <q-item v-if="!results.length">
              <q-item-section>
                <q-item-label
                  >{{
                    congregationName.length > 2
                      ? $t('no-results')
                      : $t('no-results-short')
                  }}
                </q-item-label>
                <q-item-label caption>{{
                  congregationName.length > 2
                    ? $t('no-results-explain')
                    : $t('no-results-short-explain')
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <template v-for="congregation in results" :key="congregation">
              <q-item clickable @click="selectCongregation(congregation)">
                <q-item-section>
                  <q-item-label>{{
                    congregation.properties.orgName
                  }}</q-item-label>
                  <q-item-label caption
                    >{{
                      getLocaleDayName(
                        currentSettings.localAppLang,
                        congregation.properties.schedule.current.midweek
                          .weekday - 1,
                      )
                    }}
                    {{ congregation.properties.schedule.current.midweek.time }}
                    |
                    {{
                      getLocaleDayName(
                        currentSettings.localAppLang,
                        congregation.properties.schedule.current.weekend
                          .weekday - 1,
                      )
                    }}
                    {{
                      congregation.properties.schedule.current.weekend.time
                    }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side top>
                  <q-item-label caption>{{
                    jwLanguages.list?.find(
                      (l) =>
                        l.langcode === congregation?.properties?.languageCode,
                    )?.name
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-scroll-area>
      </div>
      <div class="row">
        <div class="col text-right">
          <q-btn
            v-close-popup
            color="negative"
            flat
            @click="
              congregationName = '';
              results = [];
            "
            >{{ $t('cancel') }}</q-btn
          >
        </div>
      </div>
    </div>
  </q-dialog>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { get } from 'src/boot/axios';
import { barStyle, thumbStyle } from 'src/boot/globals';
import { getLocaleDayName } from 'src/helpers/date';
import { errorCatcher } from 'src/helpers/error-catcher';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { GeoRecord } from 'src/types/congregation-lookups';
import { Ref, ref } from 'vue';

const jwStore = useJwStore();
const { jwLanguages } = storeToRefs(jwStore);

const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);

const open = defineModel<boolean>({ default: false });
const congregationName = ref('');
const results: Ref<GeoRecord[]> = ref([]);

const lookupCongregation = async () => {
  try {
    if (congregationName.value?.length > 2) {
      await get(
        'https://apps.jw.org/api/public/meeting-search/weekly-meetings?includeSuggestions=true&keywords=' +
          encodeURIComponent(congregationName.value) +
          '&latitude=0&longitude=0&searchLanguageCode=',
      ).then((response) => {
        console.log(response.geoLocationList);
        results.value = response.geoLocationList || [];
      });
    } else {
      results.value = [];
    }
  } catch (error) {
    errorCatcher(error);
    results.value = [];
  }
};

const selectCongregation = (congregation: GeoRecord) => {
  try {
    if (currentSettings.value) {
      currentSettings.value.lang = congregation.properties.languageCode;
      currentSettings.value.langSubtitles =
        congregation.properties.languageCode;
      currentSettings.value.mwDay = (
        congregation.properties.schedule.current.midweek.weekday - 1
      )?.toString();
      currentSettings.value.mwStartTime =
        congregation.properties.schedule.current.midweek.time;
      currentSettings.value.weDay = (
        congregation.properties.schedule.current.weekend.weekday - 1
      )?.toString();
      currentSettings.value.weStartTime =
        congregation.properties.schedule.current.weekend.time;
      currentSettings.value.congregationName = congregation.properties.orgName;
    }
  } catch (error) {
    errorCatcher(error);
  }
  open.value = false;
  results.value = [];
  congregationName.value = '';
};
</script>
