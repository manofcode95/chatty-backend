import express, { Express } from 'express';
import { ChattyServer } from '@root/setup-server';
import { connectDatabase } from '@root/setup-database';
import { config } from '@root/config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('app');

class Application {
  async initialize() {
    config.validateConfig();
    config.configCloudinary();
    await connectDatabase();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
    this.handleExit();
  }

  private handleExit(): void {
    process.on('uncaughtException', (error: Error) => {
      log.error(`There was an uncaught error: ${error}`);
      this.shutDownProperly(1);
    });

    process.on('unhandleRejection', (reason: Error) => {
      log.error(`Unhandled rejection at promise: ${reason}`);
      this.shutDownProperly(2);
    });

    process.on('SIGTERM', () => {
      log.error('Caught SIGTERM');
      this.shutDownProperly(2);
    });

    process.on('SIGINT', () => {
      log.error('Caught SIGINT');
      this.shutDownProperly(2);
    });

    process.on('exit', () => {
      log.error('Exiting');
    });
  }

  private shutDownProperly(exitCode: number): void {
    try {
      log.info('Shutdown complete');
      process.exit(exitCode);
    } catch (error) {
      log.error(`Error during shutdown: ${error}`);
      process.exit(1);
    }
  }
}

const application = new Application();
application.initialize();
