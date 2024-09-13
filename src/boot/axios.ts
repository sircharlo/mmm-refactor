import axios, { AxiosRequestConfig } from 'axios';
import { warningCatcher } from 'src/helpers/error-catcher';

const get = async (url: string, params?: AxiosRequestConfig) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let returnVal: { data: any | undefined } = { data: undefined };
  try {
    returnVal = await axios.get(url, { params }).catch((error) => {
      warningCatcher(error + ': ' + url);
      return { data: undefined };
    });
  } catch (error) {
    warningCatcher(error + ': ' + url);
  }
  return returnVal?.data ?? undefined;
};

const getLanguages = async () => {
  const req = await get('https://www.jw.org/en/languages/');
  return req?.languages;
};

const urlWithParamsToString = (url: string, params: object) => {
  if (!url) return '';
  if (!params) return url;
  const urlWithParams = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    urlWithParams.searchParams.append(key, value);
  }
  return urlWithParams.toString();
};

const getYeartext = async (lang: string, year?: number) => {
  const url = 'https://wol.jw.org/wol/finder';
  const params = {
    docid: `110${year || new Date().getFullYear()}800`,
    format: 'json',
    snip: 'yes',
    wtlocale: lang,
  };
  return await get(urlWithParamsToString(url, params));
};

export { get, getLanguages, getYeartext, urlWithParamsToString };
