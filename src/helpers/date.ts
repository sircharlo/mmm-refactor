import { storeToRefs } from 'pinia';
import { date } from 'quasar';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { DateInfo } from 'src/types/dates';
import { DynamicMediaObject } from 'src/types/media';

const daysInFuture = 35;

const dateFromString = (lookupDate?: Date | string | undefined) => {
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
};

const isInPast = (lookupDate: Date) => {
  const now = dateFromString();
  return date.getDateDiff(lookupDate, now, 'days') < 0;
};

const getWeekDay = (lookupDate: Date) => {
  const currentState = useCurrentStateStore();
  const { selectedDateObject } = storeToRefs(currentState);
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
  const currentState = useCurrentStateStore();
  const { getSettingValue } = currentState;
  const coWeekSet = !!(getSettingValue('coWeek') as string);
  if (!coWeekSet) return false;
  const coWeekTuesday = dateFromString(getSettingValue('coWeek') as string);
  const coMonday = getSpecificWeekday(coWeekTuesday, 0);
  const lookupWeekMonday = getSpecificWeekday(lookupDate, 0);
  return datesAreSame(coMonday, lookupWeekMonday);
}

const isMwMeetingDay = (lookupDate: Date) => {
  const currentState = useCurrentStateStore();
  const { getSettingValue } = currentState;
  const coWeek = isCoWeek(lookupDate);
  if (coWeek) {
    const coWeekTuesday = dateFromString(getSettingValue('coWeek') as string);
    return datesAreSame(coWeekTuesday, lookupDate);
  } else {
    return getSettingValue('mwDay') == getWeekDay(lookupDate);
  }
};

const isWeMeetingDay = (lookupDate: Date) => {
  const currentState = useCurrentStateStore();
  const { getSettingValue } = currentState;
  return getSettingValue('weDay') == getWeekDay(lookupDate);
};

function updateLookupPeriod() {
  const currentState = useCurrentStateStore();
  const { currentCongregation } = storeToRefs(currentState);
  const jwStore = useJwStore();
  const { lookupPeriod } = storeToRefs(jwStore);
  if (!lookupPeriod.value[currentCongregation.value]?.length)
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
      loading: false,
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
}

export {
  dateFromString,
  datesAreSame,
  daysInFuture,
  getSpecificWeekday,
  getWeekDay,
  isCoWeek,
  isInPast,
  isMwMeetingDay,
  updateLookupPeriod,
};
