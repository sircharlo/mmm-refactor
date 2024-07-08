<template>
  <q-btn-group push v-if="localValue">
    <q-btn
      :color="'blue-' + (8 + index)"
      :key="keyboardKey"
      :label="keyboardKey"
      @click="shortcutPicker = true"
      v-for="(keyboardKey, index) in localValue.split('+')"
    />
  </q-btn-group>
  <q-btn
    :label="$t('enter-key-combination')"
    @click="shortcutPicker = true"
    color="primary"
    outline
    v-else
  />
  <q-dialog
    @hide="stopListening()"
    @show="startListening()"
    persistent
    v-model="shortcutPicker"
  >
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Enter a key combination</div>
      </q-card-section>

      <q-card-section
        :class="'q-pt-none ' + (localValue.length > 0 ? 'text-center' : '')"
      >
        <template v-if="localValue.length > 0">
          <q-chip
            :key="key"
            class="glossy text-center text-uppercase"
            color="primary"
            size="lg"
            square
            text-color="white"
            v-for="key in localValue.split('+')"
            >{{ key }}</q-chip
          >
        </template>
        <p v-else>{{ $t('no-key-combination') }}</p>
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
    console.error(e);
  }
};

const startListening = () => window.addEventListener('keydown', handleKeyPress);
const stopListening = () =>
  window.removeEventListener('keydown', handleKeyPress);
const shortcutPicker = ref(false);
</script>
