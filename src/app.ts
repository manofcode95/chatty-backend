import express, { Express } from 'express';
import { ChattyServer } from '@root/setupServer';
import { connectDatabase } from '@root/setupDatabase';
import { config } from '@root/config';

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
