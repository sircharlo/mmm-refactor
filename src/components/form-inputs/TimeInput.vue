<template>
  <q-input
    :rules="getRules(rules)"
    class="q-pb-none bg-accent-100"
    dense
    mask="time"
    outlined
    readonly
    style="width: 240px;"
    v-model="localValue"
    v-bind="{ label: label || undefined }"
  >
    <q-popup-proxy
      breakpoint="1000"
      transition-hide="scale"
      transition-show="scale"
    >
      <q-time
        :options="getTimeOptions(options)"
        format24h
        v-model="localValue"
      >
        <div class="row items-center justify-end">
          <q-btn
            @click="clearTime"
            color="negative"
            flat
            icon="mdi-close"
            v-close-popup
          />
          <q-btn color="positive" flat icon="mdi-check" v-close-popup />
        </div>
      </q-time>
    </q-popup-proxy>
  </q-input>
</template>

<script setup lang="ts">
import { getRules, getTimeOptions } from 'src/helpers/settings';
import { ref, watch } from 'vue';

const props = defineProps<{
  label?: string;
  modelValue: string;
  options: string[] | undefined;
  rules?: string[] | undefined;
}>();

const emit = defineEmits(['update:modelValue']);

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

const clearTime = () => {
  localValue.value = '';
};
</script>
