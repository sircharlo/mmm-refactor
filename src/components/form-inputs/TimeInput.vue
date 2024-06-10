<template>
  <q-input filled v-model="localValue" mask="time" :rules="getRules(rules)" class="q-pb-none" dense readonly
    v-bind="{ label: label || undefined }">
    <q-popup-proxy breakpoint="1000" transition-show="scale" transition-hide="scale">
      <q-time format24h v-model="localValue" :options="getTimeOptions(options)"  class="non-selectable">
        <div class="row items-center justify-end">
          <q-btn icon="mdi-close" color="negative" flat @click="clearTime" v-close-popup />
          <q-btn icon="mdi-check" color="positive" flat v-close-popup />
        </div>
      </q-time>
    </q-popup-proxy>
  </q-input>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getTimeOptions, getRules } from 'src/helpers/settings';

export default defineComponent({
  name: 'TimeInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    rules: {
      type: Array as () => Array<string>,
      default: () => [],
    },
    options: {
      type: Array as () => Array<string>,
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

    const clearTime = () => {
      localValue.value = '';
    };

    return {
      localValue,
      getRules,
      getTimeOptions,
      clearTime,
    };
  },
});
</script>
