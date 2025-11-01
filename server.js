const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const cors = require('cors');
const Moisture = require('./models/Moisture');

const app = express();
const PORT = process.env.PORT || 3000;

// ====== MIDDLEWARE ======
app.use(express.json());
app.use(cors());

// ====== MONGODB CONNECTION ======
mongoose
  .connect('mongodb://prathampshetty:pragathpshetty@mongo.merc.org.in:27017/iotdb?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ====== MQTT CLIENT SETUP ======
const MQTT_BROKER = 'mqtt://89.233.104.140:1883';
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  mqttClient.subscribe('sensors/moisture', (err) => {
    if (err) console.error('MQTT subscribe error:', err);
    else console.log('Subscribed to topic: sensors/moisture');
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    if (topic === 'sensors/moisture') {
      const payload = JSON.parse(message.toString());
      const reading = new Moisture({
        analog: payload.analog,
        digital: payload.digital,
      });
      await reading.save();
      console.log('💾 Saved reading:', payload);
    }
  } catch (err) {
    console.error('Error processing MQTT message:', err.message);
  }
});

// ====== API ROUTES ======

/**
 * GET /api/moisture?page=1&limit=10
 * Paginated data fetch
 */
app.get('/api/moisture', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = await Moisture.countDocuments();
    const data = await Moisture.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/moisture
 * Clear all records
 */
app.delete('/api/moisture', async (req, res) => {
  await Moisture.deleteMany({});
  res.json({ message: 'All moisture data deleted' });
});

// ====== START SERVER ======
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);