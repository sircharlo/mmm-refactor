import { Notify, QNotifyCreateOptions } from 'quasar';

const createTemporaryNotification = ({
  caption,
  group,
  icon,
  message,
  timeout = 2000,
  type,
}: QNotifyCreateOptions) => {
  try {
    return Notify.create({
      actions: [
        {
          color: 'white',
          icon: 'mmm-minus',
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
  } catch (error) {
    console.error(error);
  }
};

export { createTemporaryNotification };
