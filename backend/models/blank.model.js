const mongoose = require('mongoose');

// Vùng in trên phôi: toạ độ + kích thước (px trên ảnh default_image) để đặt design.
// ponytail: px thẳng trên ảnh phôi, đủ cho mockup 2D; thêm px_per_cm nếu cần in đúng tỉ lệ vật lý.
const PrintAreaSchema = new mongoose.Schema({
  key: { type: String, required: true },        // 'front' | 'back' | 'wrap' ...
  label: { type: String },
  image: { type: String },                      // ảnh phôi (mockup base) cho mặt này
  // Toạ độ vùng in trên ảnh phôi (px). Với surface='flat' là ô đặt design;
  // với surface='wrap' là vùng thân cong nơi ảnh cuộn hiển thị lên.
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  // POD bề mặt: 'flat' (áo/canvas) hoặc 'wrap' (cốc/bình — trải phẳng rồi cuộn).
  surface: { type: String, enum: ['flat', 'wrap'], default: 'flat' },
  // Dieline: kích thước canvas phẳng trải ra (px) — seller design full-bleed trên đây.
  template_w: { type: Number },
  template_h: { type: Number },
  arc: { type: Number },                        // radian cung nhìn thấy khi cuộn (mặc định ~2.3)
}, { _id: false });

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
  }],
  print_areas: { type: [PrintAreaSchema], default: [] },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Blank', BlankSchema, 'blanks');
