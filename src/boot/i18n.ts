import { boot } from 'quasar/wrappers';
import messages from 'src/i18n';
import { createI18n } from 'vue-i18n';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['en'];

/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

let i18n: ReturnType<typeof createI18n> = createI18n({});

export default boot(({ app }) => {
  i18n = createI18n({
    fallbackLocale: 'en-US',
    legacy: false,
    locale: 'en-US',
    messages,
  });
  app.use(i18n);
});

export { i18n };
