import { DynamicMediaObject } from './media';

export interface DateInfo {
  date: Date;
  dynamicMedia: DynamicMediaObject[];
  loading: boolean;
  meeting: boolean | string;
}
