import { ICommentDocument } from '@comment/interfaces/comment.interface';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { config } from '@root/config';
import Logger from 'bunyan';
import { Server, Socket } from 'socket.io';

export let socketIOPostObject: Server;

export class SocketIOPostHandler {
  private io: Server;
  private log: Logger;

  constructor(io: Server) {
    this.log = config.createLogger('SocketIOPostHandler');
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      this.log.info('Post socket io handler');

      this.io.on('connection', (socket: Socket) => {
        socket.on('reaction', (reaction: IReactionDocument) => {
          this.io.emit('update like', reaction);
        });

        socket.on('comment', (data: ICommentDocument) => {
          this.io.emit('update comment', data);
        });
      });
    });
  }
}
