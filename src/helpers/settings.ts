import { storeToRefs } from 'pinia';
import { ValidationRule, date } from 'quasar';
import { useJwStore } from 'src/stores/jw';
import { ref } from 'vue';
const jwStore = useJwStore();
const { jwLanguages } = storeToRefs(jwStore);
const filteredJwLanguages = ref(jwLanguages.value.list);

import { useObsStateStore } from 'src/stores/obs-state';
const obsState = useObsStateStore();
const { nonMediaScenes, nonStageScenes, scenes } = storeToRefs(obsState);

import { localeOptions } from 'src/i18n';

const requiredRule: ValidationRule = (val: string) =>
  (val && val.length > 0) || '';

const coTuesdays = (lookupDate: string) => {
  try {
    if (!lookupDate) return false;
    return (
      new Date(lookupDate).getDay() === 2 &&
      date.getDateDiff(lookupDate, new Date(), 'days') >= 0
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};

const getDateOptions = (options: string[] | undefined) => {
  try {
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
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

const getRules = (rules: string[] | undefined) => {
  try {
    const filteredRules = rules
      ?.map((rule) => {
        return rule == 'notEmpty' ? requiredRule : undefined;
      })
      .filter(Boolean);
    return filteredRules as ValidationRule[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

const getActions = (actions: string[] | undefined) => {
  try {
    return actions
      ?.map(async (action) => {
        return action == 'obsConnect'
          ? window.dispatchEvent(new CustomEvent('obsConnectFromSettings'))
          : undefined;
      })
      .filter(Boolean);
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

const meetingTime = (hr: number, min: null | number) => {
  try {
    if (hr < 8 || hr > 22) {
      return false;
    }
    if (min !== null && min % 5 !== 0) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
const getTimeOptions = (options: string[] | undefined) => {
  try {
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
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

const filterFn = (
  val: string,
  update: (arg0: { (): void; (): void }) => void,
) => {
  try {
    if (val === '') throw new Error('No language');
    update(() => {
      const needle = val.toLowerCase();
      filteredJwLanguages.value = jwLanguages.value.list.filter(
        (v) =>
          v.name.toLowerCase().indexOf(needle) > -1 ||
          v.vernacularName.toLowerCase().indexOf(needle) > -1,
      );
    });
  } catch (error) {
    console.warn(error);
    update(() => {
      filteredJwLanguages.value = jwLanguages.value.list;
    });
  }
};

const getListOptions = (list: string | undefined) => {
  try {
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
      throw new Error('List not found: ' + list);
    }
  } catch (error) {
    console.warn(error);
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
