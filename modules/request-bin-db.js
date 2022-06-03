const pgp = require('pg-promise')()

const connection = {
  host: 'localhost',
  port: 5432,
  database: 'requestbin',
  user: 'ahmadjiha',
  max: 30 // use up to 30 connections

  // "types" - in case you want to set custom type parsers on the pool level
};

const requestBinDb = pgp(connection);

module.exports = requestBinDb;