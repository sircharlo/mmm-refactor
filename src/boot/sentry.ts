import * as Sentry from '@sentry/vue';
import { boot } from 'quasar/wrappers';
import { electronApi } from 'src/helpers/electron-api';

import packageInfo from '../../package.json';

const { path } = electronApi;

function getBasenameFromFileUrl(fileUrl: string | undefined) {
  if (!fileUrl) return '';
  try {
    const parsedUrl = new URL(fileUrl);
    const pathname = decodeURIComponent(parsedUrl.pathname);
    return path.join('~', path.basename(pathname));
  } catch (e) {
    console.error(e);
    return '';
  }
}

export default boot(({ app, router }) => {
  Sentry.init({
    app,
    beforeSend: function (event, hint) {
      console.log('beforeSend', event, hint);
      console.error(hint.originalException || hint.syntheticException);
      const stacktrace =
        event.exception &&
        event.exception.values &&
        event.exception.values.length > 0 &&
        event.exception.values[0].stacktrace;
      if (stacktrace && stacktrace.frames) {
        stacktrace.frames.forEach(function (frame) {
          console.log('before', frame.filename);
          frame.filename = getBasenameFromFileUrl(frame.filename);
          console.log('after', getBasenameFromFileUrl(frame.filename));
        });
      }
      return event;
    },
    debug: true,
    dsn: 'https://0f2ab1c7ddfb118d25704c85957b8188@o1401005.ingest.us.sentry.io/4507449197920256',
    integrations: [
      // Sentry.rewriteFramesIntegration({
      //   // @ts-expect-error Frame typing
      //   iteratee: (frame) => {
      //     frame.filename = frame.filename
      //       ? path.basename(frame.filename)
      //       : frame.filename;
      //   },
      //   prefix: '',
      // }),
      Sentry.vueIntegration({ app }),
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],
    release: packageInfo.version,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    tracesSampleRate: 1.0,
  });
});
