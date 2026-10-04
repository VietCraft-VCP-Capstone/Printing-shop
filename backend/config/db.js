const mongoose = require('mongoose');
const dns = require('dns');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {
      // ignore
    }
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('Connected to MongoDB Atlas (database: printing) successfully.');
    await seedBlanksIfEmpty();
    await seedUsersIfEmpty();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

async function seedUsersIfEmpty() {
  try {
    const User = require('../models/user.model');

    // Seed default Admin
    let admin = await User.findOne({ email: 'admin@vietcraft.print' });
    if (!admin) {
      await User.create({
        email: 'admin@vietcraft.print',
        name: 'Quản Trị Viên Xưởng In',
        password: '123456',
        role: 'ADMIN',
        avatar: ''
      });
      console.log('Seeded default Admin: admin@vietcraft.print / 123456');
    } else if (!admin.password) {
      admin.password = '123456';
      await admin.save();
    }

    // Seed default Printer Workshop
    let printer = await User.findOne({ email: 'printer@vietcraft.print' });
    if (!printer) {
      printer = await User.create({
        email: 'printer@vietcraft.print',
        name: 'Chủ Xưởng VietCraft Direct',
        workshop_name: 'Xưởng In VietCraft Direct Hub',
        password: '123456',
        role: 'PRINTER',
        phone: '0908889999',
        address: 'Khu Công Nghệ Cao, TP. Thủ Đức, TP. HCM',
        description: 'Xưởng in chính hãng VietCraft, công nghệ in Direct-to-Garment hiện đại.'
      });
      console.log('Seeded default Printer: printer@vietcraft.print / 123456');
    }

    // Migrate any legacy roles to PRINTER
    await User.updateMany(
      { role: { $in: ['OPERATOR', 'POD_FACTORY', 'GARMENT_FACTORY', 'LOGISTICS'] } },
      { $set: { role: 'PRINTER' } }
    );

    // Backfill legacy blanks and orders with default printer if not assigned
    if (printer) {
      const Blank = require('../models/blank.model');
      await Blank.updateMany(
        { $or: [{ printer_id: { $exists: false } }, { printer_id: null }] },
        { $set: { printer_id: printer._id.toString(), printer_name: printer.workshop_name || printer.name } }
      );
      const PrintOrder = require('../models/order.model');
      await PrintOrder.updateMany(
        { $or: [{ printer_id: { $exists: false } }, { printer_id: null }] },
        { $set: { printer_id: printer._id.toString(), printer_name: printer.workshop_name || printer.name } }
      );
    }

    // Seed default Seller
    let seller = await User.findOne({ email: 'seller@vietcraft.vn' });
    if (!seller) {
      seller = await User.create({
        email: 'seller@vietcraft.vn',
        name: 'Seller Đối Tác POD Demo',
        password: '123456',
        role: 'SELLER',
        phone: '0901234567'
      });
      console.log('Seeded default Seller: seller@vietcraft.vn / 123456');
    }

    // Seed default Partnership
    const Partnership = require('../models/partnership.model');
    let demoPartnership = await Partnership.findOne({ seller_id: seller._id, printer_id: printer._id });
    if (!demoPartnership) {
      await Partnership.create({
        printer_id: printer._id,
        printer_name: printer.workshop_name || printer.name,
        printer_api_url: process.env.PRINTER_PUBLIC_API_URL || 'http://localhost:8880',
        seller_id: seller._id,
        seller_name: seller.name,
        seller_email: seller.email,
        shop_name: 'VietCraft Custom T-Shirt Studio',
        status: 'ACCEPTED',
        api_key: 'psk_live_demo_vietcraft_2026',
        notes: 'Thỏa thuận hợp tác sản xuất phôi POD mặc định cho đối tác VietCraft.',
        accepted_at: new Date()
      });
      console.log('Seeded demo Partnership with API Key: psk_live_demo_vietcraft_2026');
    }
  } catch (err) {
    console.error('Seeding users error:', err);
  }
}

async function seedBlanksIfEmpty() {
  try {
    const Blank = require('../models/blank.model');
    const count = await Blank.countDocuments();
    if (count > 0) return;

    console.log('Seeding initial Blank products for Printing Shop...');
    
    await Blank.create([
      {
        title: 'Áo Thun Cotton Basic 2D',
        description: 'Phôi áo thun 100% cotton, co giãn 4 chiều, thích hợp in chuyển nhiệt hoặc in trực tiếp (DTG).',
        category: 'Trang phục',
        default_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400',
        variations: [
          { sku: 'BLANK-TSHIRT-W-S', color: 'Trắng', size: 'S', material: 'Cotton 100%', base_cost: 120000 },
          { sku: 'BLANK-TSHIRT-W-M', color: 'Trắng', size: 'M', material: 'Cotton 100%', base_cost: 120000 },
          { sku: 'BLANK-TSHIRT-W-L', color: 'Trắng', size: 'L', material: 'Cotton 100%', base_cost: 125000 },
          { sku: 'BLANK-TSHIRT-B-S', color: 'Đen', size: 'S', material: 'Cotton 100%', base_cost: 120000 },
          { sku: 'BLANK-TSHIRT-B-M', color: 'Đen', size: 'M', material: 'Cotton 100%', base_cost: 120000 },
          { sku: 'BLANK-TSHIRT-B-L', color: 'Đen', size: 'L', material: 'Cotton 100%', base_cost: 125000 }
        ]
      },
      {
        title: 'Cốc Sứ Trắng Quai C',
        description: 'Cốc sứ cao cấp chịu nhiệt, phủ men bóng dùng cho in chuyển nhiệt chuyển sắc sắc nét.',
        category: 'Đồ gia dụng',
        default_image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
        variations: [
          { sku: 'BLANK-MUG-W-STD', color: 'Trắng', size: 'Standard', material: 'Gốm sứ', base_cost: 65000 }
        ]
      },
      {
        title: 'Tranh Canvas Khung Gỗ',
        description: 'Vải canvas sợi cotton bọc trên khung gỗ thông chắc chắn, độ bền màu trên 10 năm.',
        category: 'Trang trí nhà cửa',
        default_image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=400',
        variations: [
          { sku: 'BLANK-CANVAS-3040', color: 'Vải bố', size: '30x40 cm', material: 'Vải Canvas & Gỗ', base_cost: 150000 },
          { sku: 'BLANK-CANVAS-4060', color: 'Vải bố', size: '40x60 cm', material: 'Vải Canvas & Gỗ', base_cost: 210000 }
        ]
      }
    ]);
    console.log('Seeding blanks successfully.');
  } catch (err) {
    console.error('Seeding blanks error:', err);
  }
}

module.exports = connectDB;
