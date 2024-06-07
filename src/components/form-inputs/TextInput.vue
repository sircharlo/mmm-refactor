<template>
  <q-input :rules="getRules(rules)" dense filled v-model="localValue" class="q-pb-none"
    v-bind="{ label: label || undefined }" />
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { getRules, getActions } from 'src/helpers/settings';

export default defineComponent({
  name: 'TextInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    rules: {
      type: Array,
      default: () => [],
    },
    actions: {
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
      getRules,
    };
  },
});
</script>
