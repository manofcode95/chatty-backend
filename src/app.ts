import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import { connectDatabase } from './setupDatabase';
import { config } from './config';

class Application {
  async initialize() {
    config.validateConfig();
    await connectDatabase();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
  }
}
const application = new Application();
application.initialize();
