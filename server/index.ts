import express from 'express';
import dotenv from 'dotenv';
import { connectToDatabase, Listing } from './mongo/db-client';

dotenv.config();

const startApp = async () => {
  await connectToDatabase();

  Listing.insertOne({ listingId: '456' });
  const result = await Listing.find().toArray();

  const app = express();
  app.use(express.static('./build/client'));
  app.get('/api/getStuff', (_, res) => {
    res.json({ status: true });
  });
  app.get('*', (_, res) => {
    res.sendFile('index.html');
  });
  app.listen(3001, () => {
    console.log('Listening at port 3001');
  });
};

startApp();
