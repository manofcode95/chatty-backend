import { Server } from 'socket.io';

let socketIOImageObject: Server;

export class SocketIOImageHandler {
  constructor(io: Server) {
    socketIOImageObject = io;
  }
}

export { socketIOImageObject };
