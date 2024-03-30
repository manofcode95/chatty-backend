import express, { Express } from 'express';
import { ChattyServer } from '@root/setup-server';
import { connectDatabase } from '@root/setup-database';
import { config } from '@root/config';

class Application {
  async initialize() {
    config.validateConfig();
    config.configCloudinary();
    await connectDatabase();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
  }
}
const application = new Application();
application.initialize();
