import { DynamicMediaObject } from 'src/types/media';

export interface DateInfo {
  complete: boolean;
  date: Date;
  dynamicMedia: DynamicMediaObject[];
  error: boolean;
  loading: boolean;
  meeting: boolean | string;
  today: boolean;
}
