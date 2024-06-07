import { DynamicMediaObject } from './media';

export interface DateInfo {
  loading: boolean;
  date: Date;
  meeting: boolean;
  dynamicMedia: DynamicMediaObject[];
}
