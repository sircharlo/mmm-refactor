<template>
  <q-input :rules="getRules(rules)" class="q-pb-none" dense filled mask="time" readonly v-model="localValue"
    v-bind="{ label: label || undefined }">
    <q-popup-proxy breakpoint="1000" transition-hide="scale" transition-show="scale">
      <q-time :options="getTimeOptions(options)" class="non-selectable" format24h  v-model="localValue">
        <div class="row items-center justify-end">
          <q-btn @click="clearTime" color="negative" flat icon="mdi-close" v-close-popup />
          <q-btn color="positive" flat icon="mdi-check" v-close-popup />
        </div>
      </q-time>
    </q-popup-proxy>
  </q-input>
</template>

<script lang="ts">
import { getRules, getTimeOptions } from 'src/helpers/settings';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  emits: ['update:modelValue'],
  name: 'TimeInput',
  props: {
    label: {
      default: null,
      type: String,
    },
    modelValue: {
      default: '',
      type: String,
    },
    options: {
      default: () => [],
      type: Array as () => Array<string>,
    },
    rules: {
      default: () => [],
      type: Array as () => Array<string>,
    },
  },
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
      clearTime,
      getRules,
      getTimeOptions,
      localValue,
    };
  },
});
</script>
