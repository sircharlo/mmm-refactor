import { DynamicMediaObject } from 'src/types/media';

export interface DateInfo {
  complete: boolean;
  date: Date;
  dynamicMedia: DynamicMediaObject[];
  error: boolean;
  meeting: boolean | string;
  today: boolean;
}
