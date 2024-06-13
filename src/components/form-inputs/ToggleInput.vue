<template>
  <q-toggle
    checked-icon="check"
    color="green"
    unchecked-icon="clear"
    v-model="localValue"
  />
</template>

<script setup lang="ts">
import { getActions } from 'src/helpers/settings';
import { ref, watch } from 'vue';

// Define props and emits
const props = defineProps<{
  actions: string[] | undefined;
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

// Setup component
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
