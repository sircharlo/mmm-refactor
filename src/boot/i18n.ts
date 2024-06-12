console.log('i18n start');
import { boot } from 'quasar/wrappers';
import messages from 'src/i18n';
import { createI18n } from 'vue-i18n';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
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

  // Set i18n instance on app
  app.use(i18n);
});
console.log('i18n end');

export { i18n };
