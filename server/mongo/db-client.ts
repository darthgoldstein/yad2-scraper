import { MongoClient } from 'mongodb';
import { config } from '../config';

let connected = false;

const client = new MongoClient(config.mongoUrl);
const db = client.db(config.dbName);

export const connectToDatabase = async () => {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return db;
};

interface ListingSchema {
  listingId: string;
}

export const Listing = db.collection<ListingSchema>('listing');

interface RentalSchema {
  listingId: string;
}

export const Rental = db.collection<RentalSchema>('rental');

interface KeyValueSchema {
  key: string;
  value: any;
}

export const KeyValue = db.collection<KeyValueSchema>('keyValue');

interface TelegramSubscriberSchema {
  userID: number;
}

export const TelegramSubscriber =
  db.collection<TelegramSubscriberSchema>('telegramSubscriber');
