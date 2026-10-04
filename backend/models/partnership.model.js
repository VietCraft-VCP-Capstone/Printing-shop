const mongoose = require('mongoose');

const PartnershipSchema = new mongoose.Schema({
  printer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  printer_name: { type: String, required: true },
  printer_api_url: { type: String, default: 'http://localhost:8880' },
  
  seller_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  seller_name: { type: String, required: true },
  seller_email: { type: String, required: true, lowercase: true, trim: true, index: true },
  shop_name: { type: String },
  
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'], 
    default: 'PENDING',
    index: true 
  },
  
  api_key: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true 
  },
  
  notes: { type: String },
  rejection_reason: { type: String },
  accepted_at: { type: Date }
}, { timestamps: true });

PartnershipSchema.index({ printer_id: 1, seller_id: 1 }, { unique: true });

module.exports = mongoose.model('Partnership', PartnershipSchema, 'partnerships');
