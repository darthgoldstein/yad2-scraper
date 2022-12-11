require('dotenv').config();
const logger = require('pino').pino();

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

logger.info({ mongoUrl, dbName }, 'Loading migrations config');

module.exports = {
  mongodb: {
    url: mongoUrl,
    databaseName: dbName,
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecation warning when connecting
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};
