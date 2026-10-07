const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  refund_request_id: { type: String, required: true, unique: true },
  printer_id: { type: String, required: true },
  order_code: { type: String, required: true },
  is_v3: { type: Boolean, default: false },
  reason_category: { type: String },
  description: { type: String },
  evidence: { type: [String], default: [] },
  refund_type: { type: String, enum: ['FULL', 'PARTIAL', 'EXCHANGE'], required: true },
  refund_amount: { type: Number, min: 0, required: true },
  sla_deadline: { type: Date },
  status: { type: String, enum: ['PENDING_PRINTER', 'CALLBACK_PENDING', 'RESPONDED'], default: 'PENDING_PRINTER' },
  decision: { type: String, enum: ['APPROVE', 'REJECT'] },
  note: { type: String, maxlength: 1000 },
  decided_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responded_at: { type: Date },
  callback_error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PrinterRefundRequest', schema, 'printer_refund_requests');
