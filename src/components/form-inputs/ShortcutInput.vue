<template>
  <div @click="shortcutPicker = true" class="row" style="width: 240px">
    <template v-if="localValue">
      <template
        :key="keyboardKey"
        v-for="(keyboardKey, index) in localValue.split('+')"
      >
        <div :class="'col ' + (index > 0 ? 'q-ml-sm' : '')">
          <q-btn
            :key="keyboardKey"
            :label="keyboardKey"
            class="full-width text-smaller"
            color="primary"
            unelevated
          />
        </div>
      </template>
    </template>
    <q-btn
      :label="$t('enter-key-combination')"
      @click="shortcutPicker = true"
      class="full-width col-12 text-smaller"
      color="primary"
      outline
      v-else
    />
  </div>
  <q-dialog
    @hide="stopListening()"
    @show="startListening()"
    v-model="shortcutPicker"
  >
    <q-card class="modal-confirm">
      <q-card-section
        class="row items-center text-bigger text-semibold q-pb-none"
      >
        {{ $t('enter-a-key-combination') }}
      </q-card-section>
      <q-card-section class="row items-center">
        {{ $t('enter-a-key-combination-now-using-your-keyboard') }}
      </q-card-section>
      <q-card-section class="q-pt-none text-center row">
        <template v-if="localValue.length > 0">
          <template :key="key" v-for="(key, index) in localValue.split('+')">
            <div
              :class="
                'col text-uppercase bg-primary text-white q-pa-sm rounded-borders ' +
                (index > 0 ? 'q-ml-sm' : '')
              "
            >
              {{ key }}
            </div>
          </template>
        </template>
        <!-- <template v-else>
          <div
            class="col text-uppercase bg-primary q-px-sm q-py-md rounded-borders"
          ></div>
        </template> -->
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn
          :label="$t('clear')"
          @click="localValue = ''"
          color="negative"
          flat
          v-close-popup
        />
        <q-btn :label="$t('confirm')" flat v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { errorCatcher } from 'src/helpers/error-catcher';
import {
  getCurrentShortcuts,
  registerCustomShortcut,
  unregisterShortcut,
} from 'src/helpers/keyboardShortcuts';
import { SettingsValues } from 'src/types/settings';
import { ref, watch } from 'vue';

// Define props and emits
const props = defineProps<{
  modelValue: string;
  shortcutName: keyof SettingsValues;
}>();

const emit = defineEmits(['update:modelValue']);

// Setup component
const localValue = ref(props.modelValue);

watch(localValue, (newValue, oldValue) => {
  if (!getCurrentShortcuts().includes(newValue)) {
    emit('update:modelValue', newValue);
    unregisterShortcut(oldValue);
    registerCustomShortcut(props.shortcutName, newValue);
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);

const handleKeyPress = (event: KeyboardEvent) => {
  try {
    const { altKey, ctrlKey, key, metaKey, shiftKey } = event;
    const keys = [];
    if (ctrlKey) keys.push('Ctrl');
    if (shiftKey) keys.push('Shift');
    if (altKey) keys.push('Alt');
    if (metaKey) keys.push('Meta');
    if (key?.length < 3 && keys.length > 0) {
      keys.push(key);
      localValue.value = keys.join('+');
    }
  } catch (e) {
    errorCatcher(e);
  }
};

const startListening = () => window.addEventListener('keydown', handleKeyPress);
const stopListening = () =>
  window.removeEventListener('keydown', handleKeyPress);
const shortcutPicker = ref(false);
</script>
