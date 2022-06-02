const config = require('./lib/config');
const express = require('express');
const session = require('express-session');
const store = require('connect-loki');
const { findRequests, createRequest } = require('./mongo');
const PgPersistence = require('./lib/pg-persistence');
const parseRequests = require('./lib/parseRequests');
const app = express();
const { create } = require('express-handlebars');
const LokiStore = store(session);

const hbs = create({
  /* config */
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.json());

app.use(
  session({
    cookie: {
      httpOnly: true,
      maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in millseconds
      path: '/',
      secure: false,
    },
    name: 'reqbin-session-id',
    resave: false,
    saveUninitialized: true,
    secret: config.SECRET,
    store: new LokiStore({}),
  })
);

// Create DB
app.use((req, res, next) => {
  res.locals.store = new PgPersistence(req.session);
  next();
});

app.get('/', (req, res) => {
  res.render('home', {
    title: 'RequestBin',
  });
});

// Show requests and webhook URL
app.get('/bin/:id', async (req, res) => {
  let store = res.locals.store;
  const url = req.originalUrl;
  let binId = await store.getBinId(url);

  if (!binId) {
    binId = await store.createBin(url);
  }

  let requests = await store.getRequests(binId);
  let payLoads = await findRequests(binId); // mongo
  requests = parseRequests(requests, payLoads);
  console.log(requests);

  res.render('home-bin', {
    title: 'Your Bins',
    url: req.headers.host + url,
    requests,
  });
});

// Receive request from webhook URL
app.post('/bin/:id', async (req, res) => {
  let store = res.locals.store;
  let binId = await store.getBinId(req.originalUrl);
  let ipAddress = req.headers['x-forwarded-for'];
  let method = req.method;
  let payload = JSON.stringify(req.body) || '';
  let headers = req.headers;
  let contentType = headers['content-type'];
  let contentLength = headers['content-length'] || 0;

  await createRequest(binId, payload); // mongo

  store.addRequest(
    binId,
    ipAddress,
    method,
    JSON.stringify(headers),
    new Date(),
    contentType,
    contentLength
  );
  res.json(payload);
});

const { PORT } = config;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
