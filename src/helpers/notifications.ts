import { Notify, QNotifyCreateOptions } from 'quasar';

const createTemporaryNotification = ({
  caption,
  group,
  icon,
  message,
  timeout = 2000,
  type,
}: QNotifyCreateOptions) => {
  return Notify.create({
    actions: [
      {
        color: 'white',
        icon: 'mdi-close',
        round: true,
      },
    ],
    group: false,
    message,
    timeout,
    ...(caption && { caption }),
    ...(type && { type }),
    ...(icon && { icon }),
    ...(group && { group }),
  });
};

export { createTemporaryNotification };
