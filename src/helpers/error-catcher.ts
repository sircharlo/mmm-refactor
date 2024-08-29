import * as Sentry from '@sentry/vue';

const errorCatcher = (error: Error | string | unknown) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
};

const warningCatcher = (warning: string) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(warning);
  } else {
    console.warn(warning);
  }
};

export { errorCatcher, warningCatcher };
