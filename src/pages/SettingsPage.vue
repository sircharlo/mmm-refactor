<template>
  <q-page padding>
    <q-form
      greedy
      no-error-focus
      novalidate
      ref="settingsFormDynamic"
      v-if="currentSettings"
    >
      <template
        :key="groupId"
        v-for="[groupId, { name, description, icon }] in Object.entries(
          settingsGroups,
        )"
      >
        <q-expansion-item
          :caption="$t(description)"
          :icon="icon"
          :label="$t(name)"
          class="media-section text-subtitle2 text-weight-medium q-pr-md"
          v-if="
            !invalidSettingsLength ||
            !onlyShowInvalidSettings ||
            Object.entries(settingsDefinitions)
              .filter(([settingId, item]) => item.group === groupId)
              .map(([settingId, _]) => settingId)
              .some((settingId) =>
                invalidSettings.includes(settingId as keyof SettingsItems),
              )
          "
          v-model="expansionState[groupId as keyof SettingsItems]"
        >
          <template
            :key="settingId"
            v-for="([settingId, item], index) in Object.entries(
              settingsDefinitions,
            ).filter(([settingId, item]) => item.group === groupId)"
          >
            <template
              v-if="
                item.subgroup &&
                (index === 0 ||
                  item.subgroup !==
                    Object.entries(settingsDefinitions).filter(
                      ([settingId, item]) => item.group === groupId,
                    )[index - 1]?.[1].subgroup)
              "
            >
              <q-separator class="bg-accent-200" spaced v-if="index > 0" />
              <q-item-label
                class="q-pl-xl q-ml-lg text-accent-400 text-uppercase"
                header
                >{{ $t(item.subgroup) }}</q-item-label
              >
            </template>
            <q-item
              :class="{
                'q-py-lg': invalidSettings.includes(
                  settingId as keyof SettingsItems,
                ),
                'q-mt-sm': index === 0,
              }"
              :inset-level="1"
              tag="label"
              v-if="
                (!item.depends ||
                  currentSettings[item.depends as keyof SettingsItems]) &&
                (!onlyShowInvalidSettings ||
                  !invalidSettingsLength ||
                  invalidSettings.includes(settingId as keyof SettingsItems))
              "
            >
              <q-item-section>
                <q-item-label>{{ $t(settingId) }}</q-item-label>
                <q-item-label caption>{{
                  $t(settingId + '-explain')
                }}</q-item-label>
              </q-item-section>
              <q-item-section side style="align-items: end">
                <ToggleInput
                  :actions="item.actions"
                  v-if="item.type === 'toggle'"
                  v-model="
                    currentSettings[settingId as keyof SettingsItems] as boolean
                  "
                />
                <TextInput
                  :actions="item.actions"
                  :rules="item.rules"
                  v-else-if="item.type === 'text'"
                  v-model="
                    currentSettings[settingId as keyof SettingsItems] as string
                  "
                />
                <SliderInput
                  :max="item.max"
                  :min="item.min"
                  :step="item.step"
                  v-else-if="item.type === 'slider'"
                  v-model="
                    currentSettings[settingId as keyof SettingsItems] as number
                  "
                />
                <DateInput
                  :options="item.options"
                  :rules="item.rules"
                  v-else-if="item.type === 'date'"
                  v-model="
                    currentSettings[settingId as keyof SettingsItems] as string
                  "
                />
                <TimeInput
                  :options="item.options"
                  :rules="item.rules"
                  v-else-if="item.type === 'time'"
                  v-model="
                    currentSettings[settingId as keyof SettingsItems] as string
                  "
                />
                <SelectInput
                  :options="item.list"
                  :use-input="
                    settingId === 'lang' ||
                    settingId === 'langFallback' ||
                    settingId === 'langSubtitles'
                  "
                  v-else-if="item.type === 'list'"
                  v-model="
                    currentSettings[settingId as keyof SettingsItems] as string
                  "
                />
                <ShortcutInput
                  :shortcutName="settingId as keyof SettingsItems"
                  v-else-if="item.type === 'shortcut'"
                  v-model="
                    currentSettings[settingId as keyof SettingsItems] as string
                  "
                />
                <pre v-else>{{ item }}</pre>
              </q-item-section>
            </q-item>
          </template>
        </q-expansion-item>
      </template>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import DateInput from 'src/components/form-inputs/DateInput.vue';
import SelectInput from 'src/components/form-inputs/SelectInput.vue';
import ShortcutInput from 'src/components/form-inputs/ShortcutInput.vue';
import SliderInput from 'src/components/form-inputs/SliderInput.vue';
import TextInput from 'src/components/form-inputs/TextInput.vue';
import TimeInput from 'src/components/form-inputs/TimeInput.vue';
import ToggleInput from 'src/components/form-inputs/ToggleInput.vue';
import { settingsDefinitions, settingsGroups } from 'src/defaults/settings';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { SettingsItems } from 'src/types/settings';
import { computed, onMounted, ref, watch } from 'vue';

// Store initializations
const currentState = useCurrentStateStore();
const { currentSettings, onlyShowInvalidSettings } = storeToRefs(currentState);
const { getInvalidSettings } = currentState;

const jwStore = useJwStore();
const { updateYeartext } = jwStore;

// Ref and reactive initializations
const expansionState = ref({} as { [key in keyof SettingsItems]: boolean });
const settingsFormDynamic = ref();
const settingsValid = ref(true);

// Validation function
const validateSettingsLocal = () => {
  try {
    if (settingsFormDynamic.value) {
      settingsFormDynamic.value
        .validate()
        .then((success: boolean) => {
          settingsValid.value = success;
        })
        .catch(() => {
          settingsValid.value = false;
        });
    }
    for (const invalidSetting of getInvalidSettings()) {
      expansionState.value[
        settingsDefinitions[invalidSetting as keyof SettingsItems]
          .group as keyof SettingsItems
      ] = true;
    }
  } catch (error) {
    console.error(error);
  }
};

// Lifecycle hooks
onMounted(() => {
  validateSettingsLocal();
});

watch(
  () => currentSettings.value?.lang,
  (newLang) => {
    if (newLang) updateYeartext();
  },
);

const invalidSettings = computed(() => getInvalidSettings());
const invalidSettingsLength = computed(() => invalidSettings.value.length > 0);
</script>
