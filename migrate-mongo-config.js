require('dotenv').config();

module.exports = {
  mongodb: {
    url: process.env.MONGO_URL,
    databaseName: process.env.DB_NAME,
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
