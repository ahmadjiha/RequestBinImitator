// Index.js - Contains express app

const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>');
});

const PORT = 3007;

app.listen(PORT, () => {
  console.log(`Now listening on port: ${PORT}`);
});