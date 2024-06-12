<template>
  <q-input
    @click="localValue = getFolderPath()"
    dense
    filled
    readonly
    v-model="localValue"
    v-bind="{ label: label || undefined, rules: rules || undefined }"
    class="q-pb-none"
  >
    <template v-slot:append>
      <q-icon name="mdi-folder" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ValidationRule } from 'quasar';
import { electronApi } from 'src/helpers/electron-api';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  label?: null | string;
  modelValue?: string;
  rules?: ValidationRule[];
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

const { openFolderDialog } = electronApi;
const getFolderPath = () => {
  const folderPath = openFolderDialog();
  if (folderPath?.length > 0) {
    return folderPath[0];
  } else {
    return undefined;
  }
};
</script>
