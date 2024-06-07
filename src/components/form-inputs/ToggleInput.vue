<template>
  <q-toggle v-model="localValue" />
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { getActions } from 'src/helpers/settings';

export default defineComponent({
  name: 'ToggleInput',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    actions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const localValue = ref(props.modelValue);
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
      getActions(props.actions)
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        localValue.value = newValue;
      }
    );

    return {
      localValue,
    };
  },
});
</script>
