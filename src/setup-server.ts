import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import 'express-async-errors';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { config } from '@root/config';
import { createAdapter } from '@socket.io/redis-adapter';
import { CustomError, IErrorResponse } from '@globals/helpers/error-handler';
import applicationRoutes from '@root/routes';
import { currentUserMiddleware } from '@root/shared/globals/middlewares/current-user.middleware';
import { SocketIOPostHandler } from '@sockets/post.socket';
import { SocketIOFollowerHandler } from '@sockets/follower.socket';
import { SocketIOUserHandler } from '@sockets/user.socket';
import { SocketIONotificationHandler } from '@sockets/notification.socket';

const log = config.createLogger('server');
const SERVER_PORT = 5000;

export class ChattyServer {
  constructor(private app: Application) {}

  public start(): void {
    this.securityMiddleware();
    this.standardMiddleware();
    this.routesMiddleware();
    this.globalErrorHandler();
    this.startServer();
  }

  private securityMiddleware(): void {
    this.app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
      })
    );

    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(): void {
    this.app.use(compression());
    this.app.use(json({ limit: '50mb' }));
    this.app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routesMiddleware(): void {
    this.app.use(currentUserMiddleware.getCurrentUser);
    applicationRoutes(this.app);
  }

  private globalErrorHandler(): void {
    this.app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    this.app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }

      next();
    });
  }

  private async startServer(): Promise<void> {
    try {
      const httpServer: http.Server = http.createServer(this.app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (err) {
      log.error(err);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });

    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Worker with process id of ${process.pid} has started...`);
    log.info(`Server has started with process ${process.pid}`);

    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    new SocketIONotificationHandler(io);
    const socketIOPostHandler = new SocketIOPostHandler(io);
    const socketIOFollowerHandler = new SocketIOFollowerHandler(io);
    const socketIOUserHandler = new SocketIOUserHandler(io);

    socketIOPostHandler.listen();
    socketIOFollowerHandler.listen();
    socketIOUserHandler.listen();
  }
}
