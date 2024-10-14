import type { DateInfo, DynamicMediaObject } from 'src/types';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { storeToRefs } from 'pinia';
import { date } from 'quasar';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';

import { errorCatcher } from './error-catcher';

const daysInFuture = 35;

const dateFromString = (lookupDate?: Date | string | undefined) => {
  try {
    if (!lookupDate) {
      const now = new Date();
      lookupDate = date.buildDate(
        {
          day: now.getDate(),
          hours: 0,
          minutes: 0,
          month: now.getMonth() + 1,
          seconds: 0,
          year: now.getFullYear(),
        },
        false,
      );
    }
    let dateBuilder;
    if (typeof lookupDate === 'string') {
      dateBuilder = new Date(lookupDate);
      dateBuilder = date.buildDate(
        {
          day: dateBuilder.getDate(),
          hours: 0,
          minutes: 0,
          month: dateBuilder.getMonth() + 1,
          seconds: 0,
          year: dateBuilder.getFullYear(),
        },
        false,
      );
    } else {
      dateBuilder = lookupDate;
    }
    const outputDate = date.buildDate(
      {
        day: dateBuilder.getDate(),
        hours: 0,
        minutes: 0,
        month: dateBuilder.getMonth() + 1,
        seconds: 0,
        year: dateBuilder.getFullYear(),
      },
      false,
    );
    return outputDate;
  } catch (error) {
    errorCatcher(error);
    return new Date();
  }
};

const isInPast = (lookupDate: Date) => {
  try {
    if (!lookupDate) throw new Error('No lookup date');
    const now = dateFromString();
    return date.getDateDiff(lookupDate, now, 'days') < 0;
  } catch (error) {
    errorCatcher(error);
    return false;
  }
};

const getWeekDay = (lookupDate: Date) => {
  try {
    if (!lookupDate) throw new Error('No lookup date');
    const currentState = useCurrentStateStore();
    const { selectedDateObject } = storeToRefs(currentState);
    if (!lookupDate) lookupDate = selectedDateObject.value?.date || new Date();
    const dayNumber =
      lookupDate.getDay() === 0
        ? lookupDate.getDay() + 6
        : lookupDate.getDay() - 1;
    return dayNumber.toString();
  } catch (error) {
    errorCatcher(error);
    return '0';
  }
};

function getSpecificWeekday(lookupDate: Date, desiredWeekday: number): Date {
  try {
    if (!lookupDate) throw new Error('No lookupDate provided');

    // Get the day of the week for the lookupDate (0 = Sunday, 6 = Saturday)
    const currentWeekday = lookupDate.getDay();

    // Calculate difference between current day and desired day in the same week
    const difference = desiredWeekday - currentWeekday;

    // Adjust the date
    const newDate = new Date(lookupDate);
    newDate.setDate(lookupDate.getDate() + difference);
    return newDate;
  } catch (error) {
    errorCatcher(error);
    return new Date();
  }
}

function datesAreSame(date1: Date, date2: Date) {
  try {
    if (!date1 || !date2) throw new Error('Missing date for comparison');
    return date1.toDateString() === date2.toDateString();
  } catch (error) {
    errorCatcher(error);
    return false;
  }
}

function isCoWeek(lookupDate: Date) {
  try {
    if (!lookupDate) throw new Error('No lookup date');
    const currentState = useCurrentStateStore();
    const { currentSettings } = storeToRefs(currentState);
    const coWeekSet = !!currentSettings.value?.coWeek;
    if (!coWeekSet) return false;
    const coWeekTuesday = dateFromString(currentSettings.value?.coWeek);
    const coMonday = getSpecificWeekday(coWeekTuesday, 1);
    const lookupWeekMonday = getSpecificWeekday(lookupDate, 1);
    return datesAreSame(coMonday, lookupWeekMonday);
  } catch (error) {
    errorCatcher(error);
    return false;
  }
}

const isMwMeetingDay = (lookupDate: Date) => {
  try {
    if (!lookupDate) throw new Error('No lookup date');
    const currentState = useCurrentStateStore();
    const { currentSettings } = storeToRefs(currentState);
    const coWeek = isCoWeek(lookupDate);
    if (coWeek) {
      const coWeekTuesday = dateFromString(currentSettings.value?.coWeek);
      return datesAreSame(coWeekTuesday, lookupDate);
    } else {
      return currentSettings.value?.mwDay == getWeekDay(lookupDate);
    }
  } catch (error) {
    errorCatcher(error);
    return false;
  }
};

const isWeMeetingDay = (lookupDate: Date) => {
  try {
    if (!lookupDate) throw new Error('No lookup date');
    const currentState = useCurrentStateStore();
    const { currentSettings } = storeToRefs(currentState);
    return currentSettings.value?.weDay == getWeekDay(lookupDate);
  } catch (error) {
    errorCatcher(error);
    return false;
  }
};

function updateLookupPeriod(reset = false) {
  try {
    const currentState = useCurrentStateStore();
    const { currentCongregation } = storeToRefs(currentState);
    if (!currentCongregation.value) return;
    const jwStore = useJwStore();
    const { lookupPeriod } = storeToRefs(jwStore);
    if (!lookupPeriod.value[currentCongregation.value]?.length || reset)
      lookupPeriod.value[currentCongregation.value] = [];
    lookupPeriod.value[currentCongregation.value] = lookupPeriod.value[
      currentCongregation.value
    ]?.filter((day) => {
      return !isInPast(day.date);
    });
    const futureDates = Array.from({ length: daysInFuture }, (_, i) => {
      const dayDate = date.addToDate(
        date.buildDate({ hour: 0, milliseconds: 0, minute: 0, second: 0 }),
        { day: i },
      );
      return {
        date: dayDate as Date,
        dynamicMedia: [] as DynamicMediaObject[],
        meeting: isMwMeetingDay(dayDate)
          ? 'mw'
          : isWeMeetingDay(dayDate)
            ? 'we'
            : false,
      };
    }) as DateInfo[];
    lookupPeriod.value[currentCongregation.value].push(
      ...futureDates.filter(
        (day) =>
          !lookupPeriod.value[currentCongregation.value]
            ?.map((d) => date.formatDate(d.date, 'YYYY/MM/DD'))
            .includes(date.formatDate(day.date, 'YYYY/MM/DD')),
      ),
    );
    const todayDate = lookupPeriod.value[currentCongregation.value]?.find((d) =>
      datesAreSame(new Date(d.date), new Date()),
    );
    if (todayDate) todayDate.today = true;
  } catch (error) {
    errorCatcher(error);
  }
}

const getLocaleDayName = (lang: string, day: number) => {
  if (!day) day = 0;
  day++;
  if (!lang) return dayjs().day(day).format('dddd');
  try {
    return dayjs().locale(lang).day(day).format('dddd');
  } catch (error) {
    // warningCatcher(lang + ' / ' + day);
    errorCatcher(error);
    return dayjs().day(day).format('dddd');
  }
};

const getDateLocaleFormatted = (lang: string, date: Date | string) => {
  try {
    dayjs.extend(localizedFormat);
    if (!date || !lang) return (date || '') as string;
    return dayjs(date).locale(lang).format('LL');
  } catch (error) {
    errorCatcher(error);
    return (date || '') as string;
  }
};

export {
  dateFromString,
  datesAreSame,
  daysInFuture,
  getDateLocaleFormatted,
  getLocaleDayName,
  getSpecificWeekday,
  isCoWeek,
  isInPast,
  isMwMeetingDay,
  isWeMeetingDay,
  updateLookupPeriod,
};
