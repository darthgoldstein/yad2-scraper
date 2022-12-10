import dotenv from 'dotenv';

dotenv.config();

export const config = {
    serverPort: process.env.PORT ?? 3000,
    mongoUrl: process.env.MONGO_URL,
    dbName: process.env.DB_NAME,
};
