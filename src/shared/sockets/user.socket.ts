import { ILogin, IUserSocketData } from '@user/interfaces/user.interface';
import { Server, Socket } from 'socket.io';

export let socketIOUserObject: Server;
export const connectedUsersMap: Map<string, { socketId: string; username: string }> = new Map();
export class SocketIOUserHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOUserObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('setup', (data: ILogin) => {
        this.addClientToMap(data.userId, socket.id, data.username);
        this.io.emit('user online', Object.values(connectedUsersMap));
      });

      socket.on('block user', (data: IUserSocketData) => {
        this.io.emit('blocked user id', data);
      });

      socket.on('unblock user', (data: IUserSocketData) => {
        this.io.emit('unblocked user id', data);
      });

      socket.on('disconnect', () => {
        this.removeClientFromMap(socket.id);
        this.io.emit('user online', Object.values(connectedUsersMap));
      });
    });
  }

  private addClientToMap(userId: string, socketId: string, username: string): void {
    if (!connectedUsersMap.has(userId)) {
      connectedUsersMap.set(userId, { socketId, username });
    }
  }

  private removeClientFromMap(socketId: string): void {
    const disconnectedUserId = Array.from(connectedUsersMap.keys()).find((userId) => connectedUsersMap.get(userId)?.socketId === socketId);

    if (disconnectedUserId) {
      connectedUsersMap.delete(disconnectedUserId);
    }
  }
}
