const mongoose = require('mongoose');

const PrintOrderSchema = new mongoose.Schema({
  vietcraft_order_id: { type: String, required: true },
  order_code: { type: String, required: true, unique: true },
  printer_id: { type: String, index: true },
  printer_name: { type: String },
  shop_name: { type: String },
  seller_id: { type: String },
  buyer_name: { type: String, required: true },
  recipient_phone: { type: String, required: true },
  shipping_address: {
    recipient_name: { type: String, required: true },
    phone: { type: String, required: true },
    address_detail: { type: String, required: true },
    province_id: { type: String },
    district_id: { type: String },
    ward_code: { type: String }
  },
  items: [{
    sku: { type: String, required: true },
    title: { type: String, required: true },
    color: { type: String },
    size: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    artwork_url: { type: String },
    design_options: {
      scale: { type: Number, default: 100 },
      rotation: { type: Number, default: 0 },
      align: { type: String, default: 'center' }
    }
  }],
  status: {
    type: String,
    enum: ['RECEIVED', 'PRINTING', 'PACKAGED', 'SHIPPED', 'DELIVERED', 'REJECTED'],
    default: 'RECEIVED'
  },
  rejection_reason: { type: String },
  carrier: { type: String },
  tracking_number: { type: String },
  shipped_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PrintOrder', PrintOrderSchema, 'print_orders');
