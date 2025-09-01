// models/Subscriber.js
const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  preferences: { type: String, default: 'weekly' },
  subscribedAt: { type: Date, default: Date.now },
});

// Vérifie si le modèle existe déjà avant de le redéfinir
const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
