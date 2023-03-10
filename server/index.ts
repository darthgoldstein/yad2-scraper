import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import { config } from './lib/config';
import { logger } from './lib/logger';
import { connectToDatabase } from './mongo/db-client';
import { createAppRouter } from './routers/app-router';
import { createTelegramBot } from './telegram/telegram-bot';

dotenv.config();

process.on('unhandledRejection', (error: Error) => {
  const reason = error instanceof Error ? error?.message ?? '' : error;
  logger.error({ reason }, 'unhandled rejection');
});

process.on('uncaughtException', (error: Error) => {
  const reason = error instanceof Error ? error?.message ?? '' : error;
  logger.error({ reason }, 'uncaught exception');
  process.exit(1);
});

const startApp = async () => {
  await connectToDatabase();
  const bot = createTelegramBot();
  bot.startPolling();

  const app = express();
  app.use(bodyParser.json());
  app.use(express.static('./build/client'));
  app.use(createAppRouter(bot));

  app.listen(config.serverPort, () => {
    console.log(`Listening at port ${config.serverPort}`);
  });
};

startApp();
