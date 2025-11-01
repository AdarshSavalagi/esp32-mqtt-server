const mongoose = require('mongoose');

const MoistureSchema = new mongoose.Schema({
  analog: Number,
  digital: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Moisture', MoistureSchema);
