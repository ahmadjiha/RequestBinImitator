const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

console.log('conntecting to', url);

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message);
  });

const requestSchema = new mongoose.Schema({
  requestId: Number,
  body: String
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;