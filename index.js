const config = require('./lib/config');
const express = require('express');
const path = require('node:path');
const { findRequests, createRequest } = require('./mongo');
const PgPersistence = require('./lib/pg-persistence');
const parseRequests = require('./lib/parseRequests');
const app = express();
const { create } = require('express-handlebars');
const { PORT } = config;
const hbs = create({});
const crypto = require('crypto');

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.json());

// Create DB
app.use((req, res, next) => {
  res.locals.store = new PgPersistence();
  next();
});

app.get('/', (req, res) => {
  res.render('home', {
    title: 'RequestBinge',
  });
});

// Generate bin
app.post('/bin', async (req, res) => {
  const urlHash = crypto.randomBytes(20).toString('hex');

  let store = res.locals.store;
  await store.createBin(urlHash);
  const viewUrl = '/bin/view/' + urlHash;
  res.json(viewUrl);
});

// View bin
app.get('/bin/view/:id', async (req, res) => {
  let store = res.locals.store;
  const binId = await store.getBinId(req.params.id);

  if (!binId) {
    res.redirect('/');
  } else {
    let requests = await store.getRequests(binId); // get requests for bin from psql
    const payLoads = await findRequests(binId); // get payloads for bin
    requests = parseRequests(requests, payLoads); // add payload to requests
    const binData = await store.loadBin(binId);

    res.render('bin', {
      title: 'Your Bins - RequestBinge',
      url: req.headers.host + '/bin/' + req.params.id,
      requests,
      binData,
    });
  }
});

// Requests from webhook URL
app.post('/bin/:id', async (req, res) => {
  const store = res.locals.store;
  const binId = await store.getBinId(req.params.id);
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const method = req.method;
  const payload = JSON.stringify(req.body) || '';
  const headers = req.headers;
  const contentType = headers['content-type'];
  const contentLength = headers['content-length'] || 0;
  const date = new Date();
  // add req to psql
  await store.addRequest(
    binId,
    ipAddress,
    method,
    JSON.stringify(headers),
    date,
    contentType,
    contentLength
  );

  await store.updateBin(binId, date); // update bin count and date
  await createRequest(binId, payload); // add payload to mongo

  res.json(payload);
});

app.get('/bin/:id', async (req, res) => {
  const store = res.locals.store;
  const binId = await store.getBinId(req.params.id);
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const method = req.method;
  const payload = JSON.stringify(req.body) || '';
  const headers = req.headers;
  const contentType = '';
  const contentLength = headers['content-length'] || 0;
  const date = new Date();
  // add req to psql
  await store.addRequest(
    binId,
    ipAddress,
    method,
    JSON.stringify(headers),
    date,
    contentType,
    contentLength
  );

  await store.updateBin(binId, date); // update bin count and date
  await createRequest(binId, payload); // add payload to mongo

  res.json(payload);
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
