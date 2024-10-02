type GeoLocation = {
  latitude: number;
  longitude: number;
};

type Schedule = {
  time: string;
  weekday: number;
};

type CurrentSchedule = {
  midweek: Schedule;
  weekend: Schedule;
};

type ScheduleDetails = {
  changeStamp: null | string;
  current: CurrentSchedule;
  futureDate: null | string;
};

type PhoneDetails = {
  ext: string;
  phone: string;
};

type Properties = {
  address: string;
  isPrivateMtgPlace: boolean;
  languageCode: string;
  memorialAddress: string;
  memorialTime: string;
  orgGuid: string;
  orgName: string;
  orgTransliteratedName: string;
  orgType: string;
  phones: PhoneDetails[];
  relatedLanguageCodes: string[];
  schedule: ScheduleDetails;
  transliteratedAddress: string;
};

export type GeoRecord = {
  geoId: string;
  isPrimary: boolean;
  location: GeoLocation;
  properties: Properties;
  type: string;
};
