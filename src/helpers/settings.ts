import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ValidationRule } from 'quasar';

import { useJwStore } from 'src/stores/jw';
const jwStore = useJwStore();
const { jwLanguages } = storeToRefs(jwStore);
const filteredJwLanguages = ref(jwLanguages.value.list);

import { useObsStateStore } from 'stores/obs-state';
const obsState = useObsStateStore();
const { nonMediaScenes, nonStageScenes, scenes } = storeToRefs(obsState)


import { obsConnect } from 'src/helpers/obs';

const requiredRule: ValidationRule = (val: string) =>
  (val && val.length > 0) || 'Required';

const coTuesdays = (date: string) => {
  if (!date) return false;
  return new Date(date).getDay() === 2;
};

const getDateOptions = (options: string[] | undefined) => {
  const filteredOptions = options
    ?.map((option) => {
      if (option == 'coTuesdays') {
        return coTuesdays;
      } else {
        return undefined;
      }
    })
    .filter(Boolean);
  return filteredOptions && filteredOptions.length > 0
    ? filteredOptions[0]
    : undefined;
};

const getRules = (rules: string[] | undefined) => {
  const filteredRules = rules
    ?.map((rule) => {
      return rule == 'notEmpty' ? requiredRule : undefined;
    })
    .filter(Boolean);
  return filteredRules as ValidationRule[];
};

const getActions = (actions: string[] | undefined) => {
  // const filteredActions = actions
  actions
    ?.map(async (action) => {
      return action == 'obsConnect' ? await obsConnect(true) : undefined;
    })
    .filter(Boolean);
  // return filteredActions && filteredActions.length > 0 ? filteredActions[0]() : undefined;
};

const meetingTime = (hr: number, min: number | null) => {
  if (hr < 8 || hr > 22) {
    return false;
  }
  if (min !== null && min % 5 !== 0) {
    return false;
  }
  return true;
};
const getTimeOptions = (options: string[] | undefined) => {
  if (!options) return undefined;
  const filteredOptions = options
    ?.map((option) => {
      if (option == 'meetingTime') {
        return meetingTime;
      } else {
        return undefined;
      }
    })
    .filter(Boolean);
  if (!filteredOptions) return undefined;
  return filteredOptions && filteredOptions.length > 0
    ? filteredOptions[0]
    : undefined;
};

const filterFn = (
  val: string,
  update: (arg0: { (): void; (): void }) => void
) => {
  if (val === '') {
    update(() => {
      filteredJwLanguages.value = jwLanguages.value.list;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredJwLanguages.value = jwLanguages.value.list.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

const getListOptions = (list: string | undefined) => {
  if (list == 'jwLanguages') {
    return filteredJwLanguages.value.map((language) => {
      return { label: language.name, value: language.langcode };
    });
  } else if (list == 'darkModes') {
    return [
      { label: 'Automatic', value: 'auto' },
      { label: 'Dark', value: true },
      { label: 'Light', value: false },
    ];
  } else if (list == 'resolutions') {
    return [
      { label: '240p', value: '240p' },
      { label: '360p', value: '360p' },
      { label: '480p', value: '480p' },
      { label: '720p', value: '720p' },
    ];
  } else if (list == 'days') {
    return [
      { label: 'Monday', value: '0' },
      { label: 'Tuesday', value: '1' },
      { label: 'Wednesday', value: '2' },
      { label: 'Thursday', value: '3' },
      { label: 'Friday', value: '4' },
      { label: 'Saturday', value: '5' },
      { label: 'Sunday', value: '6' },
    ];
  } else if (list?.startsWith('obs')) {
    let sceneArray = scenes.value;
    if (list == 'obsNonMediaScenes') {
      sceneArray = nonMediaScenes.value;
    } else if (list == 'obsNonStageScenes') {
      sceneArray = nonStageScenes.value;
    }
    return sceneArray.map((scene) => {
      return { label: scene.sceneName, value: scene.sceneUuid };
    })
  } else {
    return undefined;
  }
};

export { getRules, getTimeOptions, getDateOptions, getListOptions, filterFn, getActions };
