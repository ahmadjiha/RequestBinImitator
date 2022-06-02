// Index.js - Contains express app

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

const PORT = 3007;

app.listen(PORT, () => {
  console.log(`Now listening on port: ${PORT}`);
});