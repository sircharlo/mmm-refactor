<template>
  <q-toggle v-model="localValue" />
</template>

<script>
import { getActions } from 'src/helpers/settings';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  emits: ['update:modelValue'],
  name: 'ToggleInput',
  props: {
    actions: {
      default: () => [],
      type: Array,
    },
    modelValue: {
      default: false,
      type: Boolean,
    },
  },
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
