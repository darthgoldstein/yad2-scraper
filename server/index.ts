import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import { connectToDatabase, Listing, Rental } from './mongo/db-client';
import { config } from './config';
import { getRentals, getCars, getRentalFilters, updateRentalFilters } from './yad2/yad2-scraper';
import path from 'path';
import { createTelegramBot } from './telegram/telegram-bot';
import { logger } from './lib/logger';

dotenv.config();

const startApp = async () => {
  // await connectToDatabase();
  const bot = createTelegramBot();
  bot.startPolling();

  // const rentals = await Rental.find().toArray();
  // const rentals = await getRentals();

  const app = express();
  app.use(bodyParser.json())
  app.use(express.static('./build/client'));
  app.get('/api/getStuff', (_, res) => {
    res.json({ status: true });
  });
  app.get('/api/checkForRentalUpdates', async (_, res) => {
    const newRentals = await getRentals();
    await bot.updateSubscribers(newRentals);
    res.json({ status: true });
  });
  app.get('/api/getFilters', async (req, res) => {
    const filters = await getRentalFilters();
    res.json({ status: true, data: filters });
  });
  app.post('/api/updateFilters', async (req, res) => {
    const filters = req.body || {};
    await updateRentalFilters(filters);
    res.json({ status: true });
  });
  app.get('*', (_, res) => {
    res.sendFile(path.resolve('index.html'));
  });

  app.listen(config.serverPort, () => {
    console.log(`Listening at port ${config.serverPort}`);
  });
};

startApp();

process.on('unhandledRejection', (error: Error) => {
  const reason = error instanceof Error ? error?.message ?? '' : error;
  logger.error({ reason }, 'unhandled rejection');
});
