<template>
  <q-page padding>
    <q-form ref="settingsFormDynamic" no-error-focus novalidate greedy>
      <q-badge color="negative" v-if="invalidSettingsLength">
        <q-toggle color="white" label="Only show settings that are not valid" v-model="onlyShowInvalid"> </q-toggle>
      </q-badge>
      <!-- {{ currentSettings }} -->
      <template v-for="[groupId, { name, description }] in Object.entries(settingsGroups)" :key="groupId">
        <q-expansion-item expand-separator icon="mdi-home-account" :label="$t(name)" :caption="$t(description)"
          v-model="expansionState[groupId]"
          v-if="!invalidSettingsLength || !onlyShowInvalid || Object.entries(settingsDefinitions).filter(([settingId, item]) => item.group === groupId).map(([settingId, _]) => settingId).some(settingId => invalidSettings.includes(settingId))">
          <template
            v-for="[settingId, item] in Object.entries(settingsDefinitions).filter(([settingId, item]) => item.group === groupId)"
            :key="settingId">
            <q-item :class="{
              'q-py-lg': invalidSettings.includes(settingId),
              'bg-grey-8': item.subgroup && $q.dark.isActive,
              'bg-grey-3': item.subgroup && !$q.dark.isActive
            }"
              v-if="(!item.subgroup || currentSettings[item.subgroup]) && (!onlyShowInvalid || !invalidSettingsLength || invalidSettings.includes(settingId))">
              <q-item-section class="col-4">
                {{ $t(settingId) }}
              </q-item-section>
              <q-item-section>
                <!-- <pre>{{ item }}</pre> -->
                <ToggleInput v-if="item.type === 'toggle'" v-model="currentSettings[settingId]"
                  :actions="item.actions" />
                <TextInput v-else-if="item.type === 'text'" :rules="item.rules" :actions="item.actions"
                  v-model="currentSettings[settingId]" />
                <SliderInput v-else-if="item.type === 'slider'" :max="item.max" :min="item.min" :step="item.step"
                  v-model="currentSettings[settingId]" />
                <DateInput v-else-if="item.type === 'date'" :rules="item.rules" :options="item.options"
                  v-model="currentSettings[settingId]" />
                <TimeInput v-else-if="item.type === 'time'" :rules="item.rules" :options="item.options"
                  v-model="currentSettings[settingId]" />
                <PathInput v-else-if="item.type === 'path'" v-model="currentSettings[settingId]" />
                <SelectInput v-else-if="item.type === 'list'" v-model="currentSettings[settingId]"
                  :use-input="settingId === 'lang'" :options="item.list" />
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

<script lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { settingsGroups, settingsDefinitions } from '../defaults/settings';

import { useCurrentStateStore } from 'stores/current-state';
const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);
const { getInvalidSettings } = currentState;

import { useJwStore } from 'src/stores/jw';
const jwStore = useJwStore();
const { updateYeartext } = jwStore;

export default {
  setup() {
    const expansionState = ref({} as { [key: string]: boolean })
    const settingsFormDynamic = ref()
    const settingsValid = ref(true)
    const validateSettingsLocal = () => {
      if (settingsFormDynamic.value) {
        settingsFormDynamic.value.validate().then((success: boolean) => {
          settingsValid.value = success
        })
      }
      for (const invalidSetting of getInvalidSettings()) {
        expansionState.value[settingsDefinitions[invalidSetting]['group']] = true
      }
    }
    onMounted(() => {
      validateSettingsLocal();
    });
    watch(() => currentSettings.value?.lang, (newVal) => {
      if (newVal) {
        updateYeartext()
      }
    })

    return {
      settingsFormDynamic,
      settingsGroups,
      settingsDefinitions,
      currentSettings,
      expansionState,
      onlyShowInvalid: ref(false),
      invalidSettings: computed(() => {
        return getInvalidSettings()
      }),
      invalidSettingsLength: computed(() => {
        return getInvalidSettings().length > 0
      }),
    }
  }
}
</script>
