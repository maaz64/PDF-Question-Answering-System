const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: String,
  content: String,
});

module.exports = mongoose.model('Document', DocumentSchema);