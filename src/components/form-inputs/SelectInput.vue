<template>
  <q-select
    :fill-input="useInput"
    :hide-selected="useInput"
    :options="
      (getListOptions(options) as Array<{ value: string; label: string }>)?.map(
        (option) => {
          return {
            value: option.value,
            label:
              options === 'jwLanguages' || options?.startsWith('obs')
                ? option.label
                : options === 'days'
                  ? getLocaleDayName(
                      currentSettings?.localAppLang,
                      parseInt(option.label),
                    )
                  : $t(option.label),
          };
        },
      )
    "
    :rules="getRules(rules)"
    :use-input="useInput"
    @filter="filterFn"
    class="bg-accent-100"
    clearable
    dense
    emit-value
    hide-bottom-space
    input-debounce="0"
    map-options
    outlined
    v-model="localValue"
    v-bind="{ label: label || undefined }"
    spellcheck="false"
    style="width: 240px"
  >
  </q-select>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { getLocaleDayName } from 'src/helpers/date';
import { filterFn, getListOptions, getRules } from 'src/helpers/settings';
import { useCurrentStateStore } from 'src/stores/current-state';
import { ref, watch } from 'vue';

const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  label?: null | string;
  modelValue?: string;
  options?: string;
  rules?: string[] | undefined;
  useInput?: boolean;
}>();

const localValue = ref(props.modelValue);

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);
</script>
