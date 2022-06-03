// Index.js - Contains express app

const crypto = require('crypto');
const db = require('./modules/request-bin-db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>');
});

app.get('/bins/views/:uri', (request, response) => {
  const binUri = request.params.uri;
  response.sendFile(`./views/${binUri}.html`, { root: __dirname });
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

const PORT = 3007;

app.listen(PORT, () => {
  console.log(`Now listening on port: ${PORT}`);
});