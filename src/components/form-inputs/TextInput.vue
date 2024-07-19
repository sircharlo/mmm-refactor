<template>
  <q-input
    :rules="getRules(rules)"
    class="q-pb-none bg-accent-100"
    dense
    outlined
    v-model="localValue"
    v-bind="{ label: label || undefined }"
    style="width: 240px;"
  />
</template>

<script setup lang="ts">
import { getActions, getRules } from 'src/helpers/settings';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  actions?: string[];
  label?: null | string;
  modelValue?: string;
  rules?: string[];
}>();

const localValue = ref(props.modelValue);

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
  getActions(props.actions);
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);
</script>
