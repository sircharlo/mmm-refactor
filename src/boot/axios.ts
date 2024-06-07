import { boot } from 'quasar/wrappers';
import axios, { AxiosRequestConfig } from 'axios';
export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
});

const get = async (url: string, params?: AxiosRequestConfig) => {
  try {
    return (await axios.get(url, { params })).data;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const getLanguages = async () =>
  (await get('https://www.jw.org/en/languages/')).languages;

const urlWithParamsToString = (url: string, params: object) => {
  const urlWithParams = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    urlWithParams.searchParams.append(key, value);
  }
  return urlWithParams.toString();
};

const getYeartext = async (lang: string, year?: number) => {
  const url = 'https://wol.jw.org/wol/finder';
  const params = {
    format: 'json',
    docid: `110${year || new Date().getFullYear()}800`,
    wtlocale: lang,
    snip: 'yes',
  };
  return await get(urlWithParamsToString(url, params));
};

export {
  getYeartext,
  getLanguages,
  get,
  urlWithParamsToString,
};
