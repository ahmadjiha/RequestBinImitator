const { db } = require('./db-query');
const nextId = require('./next-id');

module.exports = class PgPersistence {
  constructor(session) {
    this.ipAddress = session.ipAddress;
  }

  async createBin(url) {
    const CREATE_BIN =
      'INSERT INTO bins(url, date_created, date_last_used, request_count, active) VALUES($1, $2, $3, $4, $5)';
    await db
      .any(CREATE_BIN, [url, new Date(), new Date(), 0, true])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log(`ERROR: ${err}`);
      });
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

    // binId = binId[0].id;

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

  // async loadBin(url) {
  //   const FIND_BIN = 'SELECT * FROM bins WHERE url = $1';

  //   try {
  //     const bin = await db.any(FIND_BIN, [url]);
  //     return bin;
  //   } catch (err) {
  //     console.log(`ERROR: ${err}`);
  //   }
  // }

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
