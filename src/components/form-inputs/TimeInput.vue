<template>
  <q-input
    :rules="getRules(rules)"
    @focus="focusHandler($event)"
    class="q-pb-none bg-accent-100 date-time-input"
    dense
    hide-bottom-space
    mask="time"
    outlined
    style="width: 240px"
    v-model="localValue"
    v-bind="{ label: label || undefined }"
  >
    <template v-slot:append>
      <q-icon name="mmm-time" size="xs" />
    </template>
    <q-popup-proxy
      breakpoint="1000"
      transition-hide="scale"
      transition-show="scale"
    >
      <q-time :options="getTimeOptions(options)" format24h v-model="localValue">
        <div class="row items-center justify-end">
          <q-btn
            :label="$t('clear')"
            @click="clearTime"
            color="negative"
            flat
            v-close-popup
          />
          <q-btn :label="$t('save')" color="primary" flat v-close-popup />
        </div>
      </q-time>
    </q-popup-proxy>
  </q-input>
  <!-- {{ localValue }}
  </q-btn> -->
</template>

<script setup lang="ts">
// import { getTimeOptions } from 'src/helpers/settings';
import { getRules, getTimeOptions } from 'src/helpers/settings';
import { ref, watch } from 'vue';

const props = defineProps<{
  label?: string;
  modelValue: string;
  options: string[] | undefined;
  rules?: string[] | undefined;
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = ref(props.modelValue);

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);

const clearTime = () => {
  localValue.value = '';
};

const focusHandler = (evt: Event) => {
  (evt.target as HTMLInputElement)?.blur();
};
</script>
