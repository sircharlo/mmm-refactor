import * as Sentry from '@sentry/vue';
import { boot } from 'quasar/wrappers';

import packageInfo from '../../package.json';

export default boot(({ app }) => {
  Sentry.init({
    app,
    dsn: 'https://0f2ab1c7ddfb118d25704c85957b8188@o1401005.ingest.us.sentry.io/4507449197920256',
    integrations: [
      Sentry.rewriteFramesIntegration({ prefix: '~/' }),
      Sentry.vueIntegration(),
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    release: packageInfo.version,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    tracesSampleRate: 1.0,
  });
});
