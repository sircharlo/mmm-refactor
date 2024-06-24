import OBSWebSocket from 'obs-websocket-js';
import PQueue from 'p-queue';
const obsWebSocket = new OBSWebSocket();

const queues = {
  downloads: {} as Record<string, PQueue>,
  meetings: {} as Record<string, PQueue>,
};

export { obsWebSocket, queues };
