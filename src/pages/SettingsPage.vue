<template>
  <q-page padding>
    <q-form greedy no-error-focus novalidate ref="settingsFormDynamic" v-if="currentSettings">
      <q-badge color="negative" v-if="invalidSettingsLength">
        <q-toggle color="white" label="Only show settings that are not valid" v-model="onlyShowInvalid"> </q-toggle>
      </q-badge>
      <!-- {{ currentSettings }} -->
      <template :key="groupId" v-for="[groupId, { name, description }] in Object.entries(settingsGroups)">
        <q-expansion-item :caption="$t(description)" :label="$t(name)" expand-separator icon="mdi-home-account"
          v-if="!invalidSettingsLength || !onlyShowInvalid || Object.entries(settingsDefinitions).filter(([settingId, item]) => item.group === groupId).map(([settingId, _]) => settingId).some(settingId => invalidSettings.includes(settingId as keyof SettingsItems))"
          v-model="expansionState[groupId as keyof SettingsItems]">
          <template :key="settingId"
            v-for="[settingId, item] in Object.entries(settingsDefinitions).filter(([settingId, item]) => item.group === groupId)">
            <q-item :class="{
              'q-py-lg': invalidSettings.includes(settingId as keyof SettingsItems),
              'bg-grey-8': item.depends && $q.dark.isActive,
              'bg-grey-3': item.depends && !$q.dark.isActive
            }"
              v-if="(!item.depends || currentSettings[item.depends as keyof SettingsItems]) && (!onlyShowInvalid || !invalidSettingsLength || invalidSettings.includes(settingId as keyof SettingsItems))">
              <q-item-section class="col-4">
                {{ $t(settingId) }}
              </q-item-section>
              <q-item-section>
                <!-- <pre>{{ item }}</pre> -->
                <ToggleInput :actions="item.actions" v-if="item.type === 'toggle'"
                  v-model="currentSettings[settingId as keyof SettingsItems] as boolean" />
                <TextInput :actions="item.actions" :rules="item.rules" v-else-if="item.type === 'text'"
                  v-model="currentSettings[settingId as keyof SettingsItems] as string" />
                <SliderInput :max="item.max" :min="item.min" :step="item.step" v-else-if="item.type === 'slider'"
                  v-model="currentSettings[settingId as keyof SettingsItems] as number" />
                <DateInput :options="item.options" :rules="item.rules" v-else-if="item.type === 'date'"
                  v-model="currentSettings[settingId as keyof SettingsItems] as string" />
                <TimeInput :options="item.options" :rules="item.rules" v-else-if="item.type === 'time'"
                  v-model="currentSettings[settingId as keyof SettingsItems] as string" />
                <PathInput v-else-if="item.type === 'path'"
                  v-model="currentSettings[settingId as keyof SettingsItems] as string" />
                <SelectInput :options="item.list" :use-input="settingId === 'lang'" v-else-if="item.type === 'list'"
                  v-model="currentSettings[settingId as keyof SettingsItems] as string" />
                <pre v-else>{{ item }}</pre>
              </q-item-section>
            </q-item>
          </template>
        </q-expansion-item>
      </template>
    </q-form>
    <q-list bordered class="rounded-borders">
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import DateInput from 'src/components/form-inputs/DateInput.vue';
import PathInput from 'src/components/form-inputs/PathInput.vue';
import SelectInput from 'src/components/form-inputs/SelectInput.vue';
import SliderInput from 'src/components/form-inputs/SliderInput.vue';
import TextInput from 'src/components/form-inputs/TextInput.vue';
import TimeInput from 'src/components/form-inputs/TimeInput.vue';
import ToggleInput from 'src/components/form-inputs/ToggleInput.vue';
import { SettingsItems } from 'src/types/settings';
import { computed, onMounted, ref, watch } from 'vue';

import { settingsDefinitions, settingsGroups } from '../defaults/settings';
import { useCurrentStateStore } from '../stores/current-state';
import { useJwStore } from '../stores/jw';

// Store initializations
const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);
const { getInvalidSettings } = currentState;

const jwStore = useJwStore();
const { updateYeartext } = jwStore;

// Ref and reactive initializations
const expansionState = ref({} as { [key in keyof SettingsItems]: boolean });
const settingsFormDynamic = ref();
const settingsValid = ref(true);
const onlyShowInvalid = ref(false);

// Validation function
const validateSettingsLocal = () => {
  if (settingsFormDynamic.value) {
    settingsFormDynamic.value.validate().then((success: boolean) => {
      settingsValid.value = success;
    });
  }
  for (const invalidSetting of getInvalidSettings()) {
    expansionState.value[settingsDefinitions[invalidSetting as keyof SettingsItems].group as keyof SettingsItems] = true;
  }
};

// Lifecycle hooks
onMounted(() => {
  validateSettingsLocal();
});

watch(() => currentSettings.value?.lang, (newVal) => {
  if (newVal) {
    updateYeartext();
  }
});

// Computed properties
const invalidSettings = computed(() => getInvalidSettings());

const invalidSettingsLength = computed(() => getInvalidSettings().length > 0);

</script>
