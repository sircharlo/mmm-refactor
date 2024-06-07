<template>
  <q-input @click="localValue = getFolderPath()" :rules="rules" dense filled v-model="localValue" readonly
    class="q-pb-none">
    <template v-slot:append>
      <q-icon name="mdi-folder" />
    </template>
  </q-input>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { electronApi } from 'src/helpers/electron-api';

export default defineComponent({
  name: 'PathInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    rules: {
      type: Array,
      default: () => [],
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

    // const getRules = (rules) => rules;
    const { openFolderDialog } = electronApi;
    const getFolderPath = () => {
      const folderPath = openFolderDialog();
      if (folderPath?.length > 0) {
        return folderPath[0]
      } else {
        return undefined
      }
    }
    return {
      localValue,
      // getRules,
      getFolderPath,
    };
  },
});
</script>
