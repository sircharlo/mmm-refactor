import { Notify, QNotifyCreateOptions, QNotifyUpdateOptions } from 'quasar';
// import { i18n } from 'src/boot/i18n';
// const global = i18n.global;
// const {tm} = global


const createTemporaryNotification = ({
  message,
  caption,
  icon,
  type,
  group
}: QNotifyCreateOptions) => {
  return Notify.create({
    group: false,
    timeout: 2000,
    message,
    ...(caption && { caption }),
    ...(type && { type }),
    ...(icon && { icon }),
    ...(group && { group }),
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
