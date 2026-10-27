const mongoose = require('mongoose');

// Vùng in trên phôi: toạ độ + kích thước (px trên ảnh default_image) để đặt design.
// ponytail: px thẳng trên ảnh phôi, đủ cho mockup 2D; thêm px_per_cm nếu cần in đúng tỉ lệ vật lý.
const PrintAreaSchema = new mongoose.Schema({
  key: { type: String, required: true },        // 'front' | 'back' | 'sleeve_left' | 'wrap' ...
  label: { type: String },
  image: { type: String },                      // ảnh phôi (mockup base) cho mặt này
  // Toạ độ vùng in trên ảnh phôi (px)
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  // POD bề mặt: 'flat' (áo/canvas) hoặc 'wrap' (cốc/bình).
  surface: { type: String, enum: ['flat', 'wrap'], default: 'flat' },
  // Kích thước in vật lý thực tế (cm) - Printify standard
  physical_width_cm: { type: Number },
  physical_height_cm: { type: Number },
  // Dieline: kích thước canvas phẳng trải ra (px)
  template_w: { type: Number },
  template_h: { type: Number },
  arc: { type: Number },                        // radian cung nhìn thấy khi cuộn
}, { _id: false });

const BlankSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, default: '' },         // Hãng/Nhà sản xuất: Bella+Canvas, Gildan, VietCraft,...
  description: { type: String },
  category: { type: String, required: true },
  default_image: { type: String, required: true },
  print_technique: { type: String, default: 'DTG' }, // 'DTG', 'DTF', 'In lụa', 'Thêu vi tính', 'In UV', 'In chuyển nhiệt'
  production_time: { type: String, default: '1 - 3 ngày làm việc' }, // Thời gian xử lý SLA
  care_instructions: { type: String, default: '' }, // Hướng dẫn bảo quản
  dimensions_info: { type: String, default: '' },   // Thông số form dáng / Bảng size
  variations: [{
    sku: { type: String, required: true },
    color: { type: String },
    color_hex: { type: String, default: '#FFFFFF' }, // Mã màu HEX để render swatch
    size: { type: String },
    material: { type: String },
    weight_gram: { type: Number, default: 200 },    // Khối lượng tính phí vận chuyển
    base_cost: { type: Number, required: true },
    in_stock: { type: Boolean, default: true }      // Trạng thái còn hàng / hết hàng
  }],
  print_areas: { type: [PrintAreaSchema], default: [] },
  printer_id: { type: String, index: true },
  printer_name: { type: String },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Blank', BlankSchema, 'blanks');
