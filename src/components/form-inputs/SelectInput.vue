<template>
    <q-select emit-value map-options filled v-model="localValue" :use-input="useInput" input-debounce="0"
      :hide-selected="useInput" :fill-input="useInput" @filter="filterFn"
      :options="(getListOptions(options) as Array<{ value: string, label: string }>)?.map(option => {
    return {
      value: option.value,
      label: $t(option.label)
    }
    }) " dense
      v-bind="{ label: label || undefined }">
    </q-select>
</template>

<script lang="ts">
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
