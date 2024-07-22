import OBSWebSocket from 'obs-websocket-js';
import PQueue from 'p-queue';
const obsWebSocket = new OBSWebSocket();

const queues = {
  downloads: {} as Record<string, PQueue>,
  meetings: {} as Record<string, PQueue>,
};

const thumbStyle = {
  backgroundColor: '#027be3',
  borderRadius: '5px',
  opacity: '0.75',
  right: '4px',
  width: '5px',
};

const barStyle = {
  backgroundColor: '#027be3',
  borderRadius: '9px',
  opacity: '0.2',
  right: '2px',
  width: '9px',
};

export { barStyle, obsWebSocket, queues, thumbStyle };
