// Index.js - Contains express app

const db = require('./modules/request-bin-db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>');
});

app.get('/bins/views/:id', (request, response) => {
  const binId = request.params.id;
  response.sendFile('./views/1.html', { root: __dirname });
});

// Create a new request bin 
app.post('/bins/views', (request, response) => {
  const dateCreated = new Date();
  const url = `tempurl: ${dateCreated}`; // Come back implement this

  db.one('INSERT INTO bins(url, date_created, date_last_used) VALUES($1, $2, $3) RETURNING id', [url, dateCreated, dateCreated])
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      // error handling here
      console.log(error);
    });
  
  response.send('<h1>Bin Added</h1>') // return a 302 redirect with path
});



const PORT = 3007;

app.listen(PORT, () => {
  console.log(`Now listening on port: ${PORT}`);
});