import { Notify, QNotifyCreateOptions, QNotifyUpdateOptions } from 'quasar';

const createTemporaryNotification = ({
  caption,
  group,
  icon,
  message,
  type
}: QNotifyCreateOptions) => {
  return Notify.create({
    group: false,
    message,
    timeout: 2000,
    ...(caption && { caption }),
    ...(type && { type }),
    ...(icon && { icon }),
    ...(group && { group }),
  });
};
const createUpdatableNotification = ({
  caption,
  icon,
  message,
  onDismiss,
  progress,
  spinner,
  type
}: QNotifyCreateOptions) => {
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
  { caption, icon, message, progress, spinner, timeout, type }: QNotifyUpdateOptions
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
  createTemporaryNotification,
  createUpdatableNotification,
  updateNotification,
};
