import { Notify, QNotifyCreateOptions } from 'quasar';

import { errorCatcher } from './error-catcher';

const createTemporaryNotification = ({
  badgeStyle,
  caption,
  group,
  icon,
  message,
  noClose = false,
  timeout = 2000,
  type,
}: { noClose?: boolean } & QNotifyCreateOptions) => {
  try {
    return Notify.create({
      // actions: [
      //   {
      //     color: 'white',
      //     icon: 'mmm-minus',
      //     round: true,
      //   },
      // ],
      group: false,
      message,
      timeout,
      ...(caption && { caption }),
      ...(type && { type }),
      ...(icon && { icon }),
      ...(group && { group }),
      ...(badgeStyle && { badgeStyle }),
      ...(!noClose && {
        actions: [
          {
            color: 'white',
            icon: 'close',
            round: true,
          },
        ],
      }),
      position: 'top',
    });
  } catch (error) {
    errorCatcher(error);
  }
};

export { createTemporaryNotification };
