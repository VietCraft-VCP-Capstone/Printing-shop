const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  name: { type: String, required: true },
  password: { type: String },
  avatar: { type: String },
  role: { 
    type: String, 
    enum: ['ADMIN', 'OPERATOR'], 
    default: 'OPERATOR' 
  },
  google_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema, 'users');
