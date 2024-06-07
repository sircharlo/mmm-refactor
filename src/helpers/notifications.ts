import { Notify, QNotifyUpdateOptions } from 'quasar';

const createTemporaryNotification = ({
  message,
  caption,
  icon,
  type
}: QNotifyUpdateOptions) => {
  return Notify.create({
    group: false,
    timeout: 2000,
    message,
    ...(caption && { caption }),
    ...(type && { type }),
    ...(icon && { icon }),
  });
};
const createUpdatableNotification = ({
  message,
  caption,
  spinner,
  icon,
  type,
  progress,
  onDismiss
}: QNotifyUpdateOptions) => {
  return Notify.create({
    group: false,
    timeout: 0, // we want to be in control when it gets dismissed
    ...(caption !== undefined ? { caption } : {}),
    ...(icon !== undefined ? { icon } : {}),
    ...(message !== undefined ? { message } : {}),
    ...(progress !== undefined ? { progress } : {}),
    ...(spinner !== undefined ? { spinner } : {}),
    ...(type !== undefined ? { type } : {}),
    ...(onDismiss !== undefined ? { onDismiss } : {}),
  }) as typeof Notify.create;
};

const updateNotification = (
  // @ts-expect-error ddd
  notification,
  { message, caption, spinner, progress, timeout, icon, type }: QNotifyUpdateOptions
) => {
  notification({
    ...(caption !== undefined ? { caption } : {}),
    ...(icon !== undefined ? { icon } : {}),
    ...(message !== undefined ? { message } : {}),
    ...(progress !== undefined ? { progress } : {}),
    ...(spinner !== undefined ? { spinner } : {}),
    ...(timeout !== undefined ? { timeout } : {}),
    ...(type !== undefined ? { type } : {}),
  });
};

export {
  createUpdatableNotification,
  updateNotification,
  createTemporaryNotification,
};
