<template>
  <q-select emit-value map-options filled v-model="localValue" :use-input="useInput" input-debounce="0" clearable
    @filter="filterFn" :options="getListOptions(options)" dense :label="label">
  </q-select>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { getListOptions, filterFn } from 'src/helpers/settings';

export default defineComponent({
  name: 'SelectInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: String,
      default: '',
    },
    useInput: {
      type: Boolean,
      default: false,
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

    return {
      localValue,
      getListOptions,
      filterFn,
    };
  },
});
</script>
