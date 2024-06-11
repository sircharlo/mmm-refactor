console.log('obs start')
import OBSWebSocket from 'obs-websocket-js';
import { QNotifyCreateOptions, QNotifyUpdateOptions } from 'quasar';
import { Ref, ref } from 'vue';
const obsWebSocket = new OBSWebSocket();
const obsNotification: Ref<((opts: QNotifyCreateOptions | string) => (props?: QNotifyUpdateOptions | undefined) => void) | null> = ref(null);

console.log('obs end')
export { obsNotification, obsWebSocket }
