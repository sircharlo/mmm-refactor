<template>
  <q-page padding>
    <q-list v-if="Object.keys(congregations).length">
      <!-- @vue-ignore-->
      <div
        :key="id"
        @click="chooseCongregation(id)"
        @mouseleave="hoveredCongregation = null"
        @mouseover="hoveredCongregation = id"
        class="meeting-section meeting-section-begin meeting-section-end cursor-pointer"
        v-for="(prefs, id) in congregations"
        v-ripple
      >
        <q-item
          :class="
            'meeting-section-internal begin end congregation items-center ' +
            (invalidSettings(id)
              ? 'error'
              : currentCongregation === id
                ? 'active'
                : '')
          "
        >
          <!-- <q-item-section > -->
          <div class="col">
            <div
              :class="
                'text-subtitle1 row ' +
                (currentCongregation === id ? 'text-primary' : '')
              "
            >
              {{ congregations[id]?.congregationName || $t('noName') }}
            </div>
            <div class="row text-caption text-grey">
              <template v-if="congregations[id]?.disableMediaFetching">
                {{ $t('no-regular-meetings') }}
              </template>
              <template
                v-else-if="
                  parseInt(congregations[id]?.mwDay) >= 0 &&
                  parseInt(congregations[id]?.weDay) >= 0
                "
              >
                {{
                  getLocaleDayName(
                    congregations[id]?.localAppLang,
                    parseInt(congregations[id]?.mwDay),
                  )
                }}
                {{ congregations[id]?.mwStartTime }} |
                {{
                  getLocaleDayName(
                    congregations[id]?.localAppLang,
                    parseInt(congregations[id]?.weDay),
                  )
                }}
                {{ congregations[id]?.weStartTime }}
              </template>
              <template v-else-if="invalidSettings(id)">{{
                $t('incomplete-configuration')
              }}</template>
            </div>
          </div>
          <div class="col-shrink">
            <q-btn
              :class="hoveredCongregation !== id ? 'invisible' : ''"
              :label="$t('delete')"
              @click.stop="congToDelete = id"
              color="negative"
              flat
              icon="mdi-delete-forever"
              size="md"
            />
          </div>
        </q-item>
      </div>
    </q-list>
  </q-page>
  <!-- todo: restyle this dialog -->
  <q-dialog persistent v-model="deletePending">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar color="negative" icon="mdi-alert" text-color="white" />
        <span class="q-ml-sm">{{
          $t('are-you-sure-you-want-to-delete-this-profile')
        }}</span>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn :label="$t('cancel')" @click="congToDelete = ''" flat />
        <q-btn
          :label="$t('delete')"
          @click="
            deleteCongregation(congToDelete);
            congToDelete = '';
          "
          flat
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { getLocaleDayName } from 'src/helpers/date';
import { useCongregationSettingsStore } from 'src/stores/congregation-settings';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const congregationSettings = useCongregationSettingsStore();
const currentState = useCurrentStateStore();
const jwStore = useJwStore();
const { updateYeartext } = jwStore;
const { congregationCount, congregations } = storeToRefs(congregationSettings);
const { createCongregation, deleteCongregation } = congregationSettings;
const { invalidSettings, setCongregation } = currentState;
const { currentCongregation } = storeToRefs(currentState);
const route = useRoute();
const router = useRouter();
const congToDelete = ref<number | string>('');
const deletePending = computed(() => {
  return !!congToDelete.value;
});
const hoveredCongregation = ref<number | string>('');

function chooseCongregation(
  congregation: number | string,
  initialLoad?: boolean,
) {
  try {
    const invalidSettings = setCongregation(congregation);
    if (congregation) {
      updateYeartext();
      if (initialLoad) {
        // if (initialLoad || invalidSettings)
        router.push('/setup-wizard');
      } else if (invalidSettings) {
        router.push('/settings');
      } else {
        router.push('/media-calendar');
      }
    }
  } catch (error) {
    console.error(error);
    router.push('/');
  }
}

const isHomePage = computed(() => {
  return route?.path === '/initial-congregation-selector';
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

onMounted(() => {
  window.addEventListener('createNewCongregation', createNewCongregation);
});

onUnmounted(() => {
  window.removeEventListener('createNewCongregation', createNewCongregation);
});
</script>
