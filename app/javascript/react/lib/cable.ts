import * as ActionCable from '@rails/actioncable';

// const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3000/cable';
const WEBSOCKET_URL = 'ws://localhost:3000/cable';
export const cable = ActionCable.createConsumer(WEBSOCKET_URL);
