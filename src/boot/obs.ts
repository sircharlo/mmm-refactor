import OBSWebSocket from 'obs-websocket-js';
import { QNotifyCreateOptions, QNotifyUpdateOptions } from 'quasar';
import { Ref, ref } from 'vue';
const obsWebSocket = new OBSWebSocket();
const obsNotification: Ref<null | ((opts: string | QNotifyCreateOptions) => (props?: QNotifyUpdateOptions | undefined) => void)> = ref(null);

export { obsWebSocket, obsNotification }
