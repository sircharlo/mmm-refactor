<template>
  <q-page padding>
    <q-list bordered separator class="q-mb-md" v-if="Object.keys(congregations).length">
      <!-- @vue-ignore-->
      <q-item clickable v-ripple v-for="( prefs, id ) in congregations" :key="id">
        <q-item-section @click="chooseCongregation(id)">
          {{ getSettingValue("congregationName", id) || 'no name' }} - {{ id }}
        </q-item-section>
        <q-item-section side>
          <q-btn @click="congToDelete = id" class="gt-xs" size="0.8em" flat round icon="delete" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-btn @click="createNewCongregation()" color="primary" icon="mdi-plus" label="New congregation" />
  </q-page>
  <q-dialog v-model="deletePending" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="mdi-alert" color="negative" text-color="white" />
        <span class="q-ml-sm">Are you sure you want to delete this congregation?</span>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="congToDelete = ''" />
        <q-btn flat label="Delete " @click="deleteCongregation(congToDelete); congToDelete = ''" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Ref, defineComponent } from 'vue'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useCongregationSettingsStore } from 'stores/congregation-settings';
const congregationSettings = useCongregationSettingsStore();

import { useCurrentStateStore } from 'stores/current-state';
const currentState = useCurrentStateStore();
const { getSettingValue } = currentState;

import { useJwStore } from 'stores/jw';
import { Dark } from 'quasar';
const jwStore = useJwStore();
const { updateYeartext } = jwStore;



export default defineComponent({
  setup() {
    Dark.set('auto');
    const { congregationCount, congregations } = storeToRefs(congregationSettings);
    const { createCongregation, deleteCongregation } = congregationSettings
    const { setCongregation } = currentState
    const route = useRoute();
    const router = useRouter();
    const congToDelete: Ref<number | string> = ref('')
    const deletePending = computed(() => {
      return !!congToDelete.value
    })
    function chooseCongregation(congregation: string | number, initialLoad?: boolean) {
      const invalidSettings = setCongregation(congregation)
      updateYeartext()
      if (congregation) {
        if (initialLoad) {
          // if (initialLoad || invalidSettings) {
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
    })

    function createNewCongregation() {
      chooseCongregation(createCongregation(), true)
    }

    if (congregationCount.value === 0) {
      createNewCongregation()
    } else if (congregationCount.value === 1 && isHomePage.value) {
      chooseCongregation(Object.keys(congregations.value)[0])
    } else if (!isHomePage.value) {
      chooseCongregation('')
    }

    return {
      isHomePage,
      chooseCongregation,
      deleteCongregation,
      createNewCongregation,
      congToDelete,
      deletePending,
      congregations,
      getSettingValue
    }
  },
})

</script>
