const mongoose = require('mongoose');

const BlankSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  default_image: { type: String, required: true },
  variations: [{
    sku: { type: String, required: true, unique: true },
    color: { type: String },
    size: { type: String },
    material: { type: String },
    base_cost: { type: Number, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Blank', BlankSchema, 'blanks');
