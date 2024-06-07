<template>
  <q-input filled v-model="localValue" mask="date" readonly :rules="getRules(rules)" dense class="q-pb-none"
    v-bind="{ label: label || undefined }">
    <q-popup-proxy breakpoint="1000" transition-show="scale" transition-hide="scale">
      <q-date v-model="localValue" :options="getDateOptions(options)" :rules="rules" dense>
        <div class="row items-center justify-end q-gutter-sm">
          <q-btn icon="mdi-close" color="negative" flat @click="clearDate" v-close-popup />
          <q-btn icon="mdi-check" color="positive" flat v-close-popup />
        </div>
      </q-date>
    </q-popup-proxy>
  </q-input>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { getRules, getDateOptions } from 'src/helpers/settings';

export default defineComponent({
  name: 'DateInput',
  props: {
    modelValue: {
      type: [String, Date],
      default: null,
    },
    rules: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
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

    const clearDate = () => {
      localValue.value = null;
    };

    return {
      localValue,
      getRules,
      getDateOptions,
      clearDate,
    };
  },
});
</script>
