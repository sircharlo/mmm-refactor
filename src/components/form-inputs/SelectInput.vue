<template>
    <q-select :fill-input="useInput" :hide-selected="useInput" :options="(getListOptions(options) as Array<{ value: string, label: string }>)?.map(option => {
    return {
      value: option.value,
      label: (options === 'jwLanguages' || options?.startsWith('obs')) ? option.label : $t(option.label)
    }
    }) " :use-input="useInput" @filter="filterFn" dense
      emit-value filled input-debounce="0"
      map-options v-model="localValue"
      v-bind="{ label: label || undefined }">
    </q-select>
</template>

<script setup lang="ts">
import { filterFn, getListOptions } from 'src/helpers/settings';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  label?: null | string;
  modelValue?: string;
  options?: string;
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
  }
);

</script>
