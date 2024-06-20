import { DynamicMediaObject } from 'src/types/media';

export interface DateInfo {
  date: Date;
  dynamicMedia: DynamicMediaObject[];
  loading: boolean;
  meeting: boolean | string;
  today: boolean;
}
