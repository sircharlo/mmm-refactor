<template>
  <q-input
    :rules="getRules(rules)"
    class="q-pb-none"
    dense
    filled
    mask="date"
    readonly
    style="width: 240px"
    v-model="localValue"
    v-bind="{ label: label || undefined }"
  >
    <q-popup-proxy
      breakpoint="1000"
      transition-hide="scale"
      transition-show="scale"
    >
      <q-date
        :options="getDateOptions(options)"
        :rules="rules"
        dense
        v-model="localValue"
      >
        <div class="row items-center justify-end q-gutter-sm">
          <q-btn
            :label="$t('clear')"
            @click="clearDate"
            color="negative"
            flat
            v-close-popup
          />
          <q-btn :label="$t('save')" color="primary" flat v-close-popup />
        </div>
      </q-date>
    </q-popup-proxy>
  </q-input>
</template>

<script setup lang="ts">
import { getDateOptions, getRules } from 'src/helpers/settings';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  label?: null | string;
  modelValue?: string;
  options?: string[];
  rules?: string[];
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

const clearDate = () => {
  localValue.value = '';
};
</script>
