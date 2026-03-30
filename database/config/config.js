require('dotenv').config({ quiet: true });

module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME || 'postgres',
    password: process.env.DEV_DB_PASSWORD || '',
    database: process.env.DEV_DB_NAME || 'agcera',
    host: process.env.DEV_DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'agcera_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.PROD_DB_USERNAME || 'postgres',
    password: process.env.PROD_DB_PASSWORD || '',
    database: process.env.PROD_DB_NAME || 'agcera',
    host: process.env.PROD_DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  },
};
