import { storeToRefs } from 'pinia';
import { ValidationRule, date } from 'quasar';
import { ref } from 'vue';

import { useJwStore } from '../stores/jw';
const jwStore = useJwStore();
const { jwLanguages } = storeToRefs(jwStore);
const filteredJwLanguages = ref(jwLanguages.value.list);

import { useObsStateStore } from '../stores/obs-state';
const obsState = useObsStateStore();
const { nonMediaScenes, nonStageScenes, scenes } = storeToRefs(obsState);

import { obsConnect } from 'src/helpers/obs';
import { localeOptions } from 'src/i18n';

const requiredRule: ValidationRule = (val: string) =>
  (val && val.length > 0) || '';

const coTuesdays = (lookupDate: string) => {
  if (!lookupDate) return false;
  return (
    new Date(lookupDate).getDay() === 2 &&
    date.getDateDiff(lookupDate, new Date(), 'days') >= 0
  );
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

const meetingTime = (hr: number, min: null | number) => {
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
  update: (arg0: { (): void; (): void }) => void,
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
      (v) =>
        v.name.toLowerCase().indexOf(needle) > -1 ||
        v.vernacularName.toLowerCase().indexOf(needle) > -1,
    );
  });
};

const getListOptions = (list: string | undefined) => {
  if (list == 'jwLanguages') {
    return filteredJwLanguages.value.map((language) => {
      return {
        label: `${language.vernacularName} (${language.name})`,
        value: language.langcode,
      };
    });
  } else if (list === 'appLanguages') {
    return localeOptions;
  } else if (list == 'darkModes') {
    return [
      { label: 'automatic', value: 'auto' },
      { label: 'dark', value: true },
      { label: 'light', value: false },
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
      { label: 'monday', value: '0' },
      { label: 'tuesday', value: '1' },
      { label: 'wednesday', value: '2' },
      { label: 'thursday', value: '3' },
      { label: 'friday', value: '4' },
      { label: 'saturday', value: '5' },
      { label: 'sunday', value: '6' },
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
    });
  } else {
    return undefined;
  }
};

export {
  filterFn,
  getActions,
  getDateOptions,
  getListOptions,
  getRules,
  getTimeOptions,
};
