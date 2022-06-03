const { db } = require('./db-query');

module.exports = class PgPersistence {
  async createBin(url) {
    const CREATE_BIN =
      'INSERT INTO bins(url, date_created, date_last_used, request_count, active) VALUES($1, $2, $3, $4, $5) RETURNING id';
    try {
      const date = new Date();
      const result = await db.one(CREATE_BIN, [url, date, date, 0, true]);
      return result.id;
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  }

  async addRequest(
    binId,
    ipAddress,
    method,
    headers,
    received_at,
    content_type,
    content_length
  ) {
    const ADD_REQUEST =
      'INSERT INTO requests(bin_id, ip_address, request_method, headers, received_at, content_type, content_length) VALUES ($1, $2, $3, $4, $5, $6, $7)';

    await db
      .any(ADD_REQUEST, [
        binId,
        ipAddress,
        method,
        headers,
        received_at,
        content_type,
        content_length,
      ])
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(`ERROR: ${err}`);
      });
  }

  async getBinId(url) {
    const FIND_BIN = 'SELECT id FROM bins WHERE url = $1';

    try {
      const bin = await db.any(FIND_BIN, [url]);
      return bin[0].id;
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  }

  async updateBin(binId, date) {
    const UPDATE_BIN_COUNT =
      'UPDATE bins SET request_count = request_count + 1 WHERE id = $1';
    const UPDATE_BIN_DATE = 'UPDATE bins SET date_last_used = $1 WHERE id = $2';

    try {
      await db.none(UPDATE_BIN_COUNT, [binId]);
      await db.none(UPDATE_BIN_DATE, [date, binId]);
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  }

  async loadBin(binId) {
    const FIND_BIN = 'SELECT * FROM bins WHERE id = $1';

    try {
      const bin = await db.one(FIND_BIN, [binId]);
      return bin;
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  }

  async getRequests(binId) {
    const FIND_REQUESTS = 'SELECT * FROM requests WHERE bin_id = $1';
    try {
      const requests = await db.any(FIND_REQUESTS, [binId]);
      return requests;
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  }
};
