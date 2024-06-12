<template>
  <q-slider
    :max="max"
    :min="min"
    :step="step"
    class="q-pb-none"
    dense
    filled
    v-model="localValue"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  max?: number;
  min?: number;
  modelValue?: number;
  step?: number;
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
