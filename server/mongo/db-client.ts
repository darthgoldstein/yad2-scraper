import { MongoClient } from 'mongodb';
import { config } from '../lib/config';

let connected = false;

const client = new MongoClient(config.mongoUrl);
const db = client.db(config.dbName);

export const connectToDatabase = async () => {
  while (!connected) {
    connected = await new Promise<boolean>((res) => {
      setTimeout(() => res(false), 4000);
      client.connect().then(() => res(true));
    });
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
