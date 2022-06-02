const config = require('./config');
const initOptions = {
  connect(client) {
    const cp = client.connectionParameters;
    console.log('Connected to database:', cp.database);
  },
  query(e) {
    console.log('QUERY:', e.query);
  },
  disconnect(client, dc) {
    const cp = client.connectionParameters;
    console.log('Disconnecting from database:', cp.database);
  },
};

const pgp = require('pg-promise')(initOptions);

const cn = {
  host: 'localhost',
  database: 'requestbin',
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASS,
};

const db = pgp(cn);
module.exports = { db };
