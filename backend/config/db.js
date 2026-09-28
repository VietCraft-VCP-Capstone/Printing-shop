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

    // Seed default Operator
    let operator = await User.findOne({ email: 'operator@vietcraft.print' });
    if (!operator) {
      await User.create({
        email: 'operator@vietcraft.print',
        name: 'Kỹ Thuật Viên Vận Hành',
        password: '123456',
        role: 'OPERATOR',
        avatar: ''
      });
      console.log('Seeded default Operator: operator@vietcraft.print / 123456');
    } else if (!operator.password) {
      operator.password = '123456';
      await operator.save();
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
