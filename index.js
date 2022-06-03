// Index.js - Contains express app

require('dotenv').config();
const crypto = require('crypto');
const db = require('./modules/request-bin-db');
const express = require('express');
const exphbs = require('express-handlebars');
const RequestBody = require('./models/request');

const app = express();
app.use(express.json());

// Express Handlerbars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Test Path
app.get('/', (req, res) => {
  res.render('bin', { 
    binData: {
      bin_address: 'abc'
    },
    requests: [
      { request_method: "POST" },
      { request_method: "GET"}
    ]
  })
});

async function queryBin(binUri) {
  try {
    const bin = await db.one('SELECT * FROM bins WHERE url = $1', [binUri]);
    console.log("successfully retrieved bin");
    return bin;
  } catch(e) {
    console.log(e);
  }
}

async function queryBinRequests(binId) {
  try {
    const requests = await db.any('SELECT * FROM requests WHERE bin_id = $1', [binId]);
    console.log("Successfully retrieved all requests for the bin");
    return requests
  } catch(e) {
    console.log(e);
  }
}

async function queryRequestBody(requestId) {
  return await RequestBody.findOne({ requestId, });
}

app.get('/bins/views/:uri', async (request, response) => {
  const binUri = request.params.uri;
  const bin = await queryBin(binUri);
  const requests = await queryBinRequests(bin.id);
  
  for (let i = 0; i < requests.length; i += 1) {
    requests[i].body = await queryRequestBody(requests[i].id);
    requests[i].body = requests[i].body ? requests[i].body.body : "None";
  }

  response.render('bin', {
    binData: bin,
    requests,
  });

  // response.sendFile(`./views/${binUri}.html`, { root: __dirname });
});

// Create a new request bin 
app.post('/bins/views', (request, response) => {
  const dateCreated = new Date();
  const uriHash = crypto.randomBytes(20).toString('hex');
  const uri = `${uriHash}`; // Come back implement this

  db.one('INSERT INTO bins(url, date_created, date_last_used) VALUES($1, $2, $3) RETURNING url', [uri, dateCreated, dateCreated])
    .then(data => {
      console.log(data);
      response.redirect();
    })
    .catch(error => {
      // error handling here
      console.log(error);
    });  
});

async function queryBinId(uri) {
  try {
    const binId = await db.one('Select id FROM bins WHERE url = $1', [uri]);
    return binId.id;
  } catch(e) {
    console.log(e)
  }
}

async function storeNewRequest(cols) {
  try {
    const requestId = await db.one(
      'INSERT INTO requests(bin_id, ip_address, request_method, headers, received_at, content_type, content_length) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [cols.binId, cols.ipAddress, cols.requestMethod, cols.requestHeaders, cols.timeReceived, cols.contentType, cols.contentLength]
      );

      console.log("Success!!!");
      return requestId.id;
  } catch(e) {
    console.log(e);
  }
}

// Store a new request
/*
1. Get binID from db
  a. Query postgres for id that has matching url
2. Parse request
3. Store metadata (request method, headers, ip, ...) in postgres
4. Store raw body string in mongo
5. Trigger bin view to be rerendered
*/

app.post('/api/bins/:uri', async (request, response) => {
  const binUri = request.params.uri;

  const rowCols = {};
  rowCols.binId = await queryBinId(binUri);

  rowCols.ipAddress = request.ip.match(/[^:][0-9.]*$/g)[0]; // Needs error handling later
  rowCols.requestMethod = request.method;
  rowCols.requestHeaders = JSON.stringify(request.headers);
  rowCols.timeReceived = new Date();
  rowCols.contentType = request.headers['content-type'];
  rowCols.contentLength = request.headers['content-length'];

  const requestId = await storeNewRequest(rowCols);

  const requestBody = new RequestBody({
    requestId,
    body: JSON.stringify(request.body),
  });

  requestBody.save()
    .then(result => {
      // rerender bin -- still needs to be implemented
    })
    .catch(error => {
      console.log(error)
    });

});

const PORT = 3007;

app.listen(PORT, () => {
  console.log(`Now listening on port: ${PORT}`);
});