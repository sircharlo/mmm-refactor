<template>
  <q-page padding>
    <q-list
      bordered
      class="q-mb-md"
      separator
      v-if="Object.keys(congregations).length"
    >
      <!-- @vue-ignore-->
      <q-item :key="id" clickable v-for="(prefs, id) in congregations" v-ripple>
        <q-item-section @click="chooseCongregation(id)">
          {{ getSettingValue('congregationName', id) || 'no name' }} - {{ id }}
        </q-item-section>
        <q-item-section side>
          <q-btn
            @click="congToDelete = id"
            class="gt-xs"
            flat
            icon="delete"
            round
            size="0.8em"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <q-btn
      @click="createNewCongregation()"
      color="primary"
      icon="mdi-plus"
      label="New congregation"
    />
  </q-page>
  <q-dialog persistent v-model="deletePending">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar color="negative" icon="mdi-alert" text-color="white" />
        <span class="q-ml-sm"
          >Are you sure you want to delete this congregation?</span
        >
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn @click="congToDelete = ''" flat label="Cancel" />
        <q-btn
          @click="
            deleteCongregation(congToDelete);
            congToDelete = '';
          "
          flat
          label="Delete "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Dark } from 'quasar';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useCongregationSettingsStore } from '../stores/congregation-settings';
import { useCurrentStateStore } from '../stores/current-state';
import { useJwStore } from '../stores/jw';

const congregationSettings = useCongregationSettingsStore();
const currentState = useCurrentStateStore();
const { getSettingValue } = currentState;
const jwStore = useJwStore();
const { updateYeartext } = jwStore;
Dark.set('auto');
const { congregationCount, congregations } = storeToRefs(congregationSettings);
const { createCongregation, deleteCongregation } = congregationSettings;
const { setCongregation } = currentState;
const route = useRoute();
const router = useRouter();
const congToDelete = ref<number | string>('');
const deletePending = computed(() => {
  return !!congToDelete.value;
});

function chooseCongregation(
  congregation: number | string,
  initialLoad?: boolean,
) {
  const invalidSettings = setCongregation(congregation);
  updateYeartext();
  if (congregation) {
    if (initialLoad) {
      // if (initialLoad || invalidSettings)
      router.push('/setup-wizard');
    } else if (invalidSettings) {
      router.push('/settings');
    } else {
      router.push('/media-calendar');
    }
  }
}

const isHomePage = computed(() => {
  return route.path === '/';
});

function createNewCongregation() {
  chooseCongregation(createCongregation(), true);
}

if (congregationCount.value === 0) {
  createNewCongregation();
} else if (congregationCount.value === 1 && isHomePage.value) {
  chooseCongregation(Object.keys(congregations.value)[0]);
} else if (!isHomePage.value) {
  chooseCongregation('');
}
</script>
