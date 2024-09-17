import OBSWebSocket from 'obs-websocket-js';
import PQueue from 'p-queue';
import { Dark } from 'quasar';
const obsWebSocket = new OBSWebSocket();

const queues = {
  downloads: {} as Record<string, PQueue>,
  meetings: {} as Record<string, PQueue>,
};

const thumbStyle = () => {
  return {
    backgroundColor: Dark.isActive
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(0, 0, 0, 0.9)',
    borderRadius: '5px',
    opacity: '0.75',
    right: '4px',
    width: '6px',
  };
};

const barStyle = () => {
  return {
    backgroundColor: Dark.isActive
      ? 'rgba(255, 255, 255, 0.75)'
      : 'rgba(0, 0, 0, 0.75)',
    borderRadius: '9px',
    opacity: '0.2',
    right: '2px',
    width: '10px',
  };
};

export { barStyle, obsWebSocket, queues, thumbStyle };
