import { Server } from 'socket.io';

let socketIONotificationObject: Server;

export class SocketIONotificationHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIONotificationObject = io;
  }
}

export { socketIONotificationObject };
