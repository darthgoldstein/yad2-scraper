import dotenv from 'dotenv';

dotenv.config();

export const config = {
    serverPort: process.env.PORT,
    mongoUrl: process.env.MONGO_URL,
    dbName: process.env.DB_NAME,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    homePageUrl: process.env.CYCLIC_URL,
};
