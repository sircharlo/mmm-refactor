import { storeToRefs } from 'pinia';
import { date } from 'quasar';
import { DateInfo } from 'src/types/dates';
import { DynamicMediaObject } from 'src/types/media';
import { useCurrentStateStore } from 'stores/current-state';
// import { computed } from 'vue';
const currentState = useCurrentStateStore();
const { getSettingValue } = currentState
const { selectedDateObject } = storeToRefs(currentState);

const daysInFuture = 35;

const dateFromString = (lookupDate?: string | undefined | Date) => {
  if (!lookupDate) {
    const now = new Date();
    lookupDate = date.buildDate(
      {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      false
    );
  }
  let dateBuilder;
  if (typeof lookupDate === 'string') {
    dateBuilder = new Date(lookupDate);
    dateBuilder = date.buildDate(
      {
        year: dateBuilder.getFullYear(),
        month: dateBuilder.getMonth() + 1,
        day: dateBuilder.getDate(),
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      false
    );
  } else {
    dateBuilder = lookupDate;
  }
  const outputDate = date.buildDate(
    {
      year: dateBuilder.getFullYear(),
      month: dateBuilder.getMonth() + 1,
      day: dateBuilder.getDate(),
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    false
  );
  return outputDate;
};

const isInPast = (lookupDate: Date) => {
  const now = dateFromString();
  return date.getDateDiff(lookupDate, now, 'days') < 0;
};

const getWeekDay = (lookupDate: Date) => {
  if (!lookupDate) lookupDate = selectedDateObject.value?.date || new Date();
  const dayNumber =
    lookupDate.getDay() === 0
      ? lookupDate.getDay() + 6
      : lookupDate.getDay() - 1;
  return dayNumber;
};

function getSpecificWeekday(date: Date, desiredWeekday: number) {
  desiredWeekday++;
  desiredWeekday = desiredWeekday === 7 ? 0 : desiredWeekday;
  const difference = (date.getDay() - desiredWeekday + 7) % 7;
  const newDate = new Date(date.valueOf());
  newDate.setDate(newDate.getDate() - difference);
  return newDate;
}

function datesAreSame(date1: Date, date2: Date) {
  return date1.toDateString() === date2.toDateString();
}

function isCoWeek(lookupDate: Date) {
  const coWeekSet = !!(getSettingValue('coWeek') as string);
  if (!coWeekSet) return false;
  const coWeekTuesday = dateFromString(getSettingValue('coWeek') as string);
  const coMonday = getSpecificWeekday(coWeekTuesday, 0);
  const lookupWeekMonday = getSpecificWeekday(lookupDate, 0);
  return datesAreSame(coMonday, lookupWeekMonday);
}

const isMwMeetingDay = (lookupDate: Date) => {
  const coWeek = isCoWeek(lookupDate);
  if (coWeek) {
    const coWeekTuesday = dateFromString(getSettingValue('coWeek') as string);
    return datesAreSame(coWeekTuesday, lookupDate);
  } else {
    return getSettingValue('mwDay') == getWeekDay(lookupDate);
  }
};

const isWeMeetingDay = (lookupDate: Date) =>
  getSettingValue('weDay') == getWeekDay(lookupDate);

function isMeetingDay(lookupDate: Date) {
  const mwMeetingDay = isMwMeetingDay(lookupDate);
  const weMeetingDay = isWeMeetingDay(lookupDate);
  return mwMeetingDay || weMeetingDay;
}

function getLookupPeriod() {
  return Array.from({ length: daysInFuture }, (_, i) => {
    const dayDate = date.addToDate(new Date(), { days: i });
    return {
      loading: false,
      date: dayDate as Date,
      meeting: isMeetingDay(dayDate),
      dynamicMedia: [] as DynamicMediaObject[],
    };
  }) as DateInfo[];
}

export {
  dateFromString,
  getWeekDay,
  getSpecificWeekday,
  datesAreSame,
  isMeetingDay,
  isMwMeetingDay,
  isWeMeetingDay,
  isCoWeek,
  isInPast,
  daysInFuture,
  getLookupPeriod,
};
