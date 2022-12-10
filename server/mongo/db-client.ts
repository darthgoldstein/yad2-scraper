import { MongoClient } from 'mongodb';
import { config } from '../config';

let connected = false;

const client = new MongoClient(config.mongoUrl);
const db = client.db(config.dbName);

export const connectToDatabase = async () => {
  const client = new MongoClient(config.mongoUrl);
  if (!connected) {
    await client.connect();
  }
  return db;
};

interface ListingSchema {
  listingId: string;
}

export const Listing = db.collection<ListingSchema>('listing');
