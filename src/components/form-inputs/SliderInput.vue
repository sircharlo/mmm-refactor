<template>
  <q-slider
    :max="max"
    :min="min"
    :step="step"
    class="q-pb-none q-mr-md"
    dense
    filled
    style="width: 240px"
    v-model="localValue"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  actions?: string[];
  max?: number;
  min?: number;
  modelValue?: number;
  step?: number;
}>();

const localValue = ref(props.modelValue);

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
  if (props?.actions?.includes('setBackgroundMusicVolume')) {
    const bc = new BroadcastChannel('volumeSetter');
    bc.postMessage(newValue);
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);
</script>
