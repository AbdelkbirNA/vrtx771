const mongoose = require('mongoose');

// Définir le schéma pour les emails
const emailSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  recipient: { type: String, required: true },
  status: { type: String, enum: ['sent', 'opened', 'clicked'], default: 'sent' },
  body: { type: String },
  open_count: { type: Number, default: 0 },
  click_count: { type: Number, default: 0 },
  date_sent: { type: Date, default: Date.now },
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
