const Blank = require('../models/blank.model');
const PrintOrder = require('../models/order.model');
const Partnership = require('../models/partnership.model');
const User = require('../models/user.model');
const fs = require('fs');
const { isCloudinaryEnabled, uploadToCloudinary } = require('../services/cloudinary.service');

class BlankController {
  static async getAllBlanks(req, res) {
    try {
      const apiKey = req.headers['x-api-key'] || req.query.api_key;
      let filter = req.query.all === '1' ? {} : { is_active: { $ne: false } };
      let printerInfo = {
        printer_id: 'vietcraft-direct',
        printer_name: 'Xưởng In VietCraft Direct Hub'
      };

      if (apiKey) {
        // Truong hop 1: Goi tu VietCraft voi API Key
        if (process.env.PRINTING_SHOP_API_KEY && String(apiKey).trim() === process.env.PRINTING_SHOP_API_KEY.trim()) {
          // Master API Key tu he thong VietCraft
          printerInfo = {
            printer_id: 'vietcraft-direct',
            printer_name: 'Xưởng In VietCraft Direct Hub'
          };
        } else {
          const partnership = await Partnership.findOne({ api_key: String(apiKey).trim(), status: 'ACCEPTED' })
            .populate('printer_id', 'name workshop_name');
          if (!partnership) {
            return res.status(401).json({ error: 'API Key đối tác không hợp lệ hoặc chưa được duyệt.' });
          }
          const pId = partnership.printer_id?._id?.toString() || partnership.printer_id?.toString();
          filter.$or = [
            { printer_id: pId },
            { printer_id: { $exists: false } },
            { printer_id: null }
          ];
          printerInfo = {
            printer_id: pId,
            printer_name: partnership.printer_name || partnership.printer_id?.workshop_name || partnership.printer_id?.name || 'Xưởng In VietCraft Direct Hub'
          };
        }
      } else if (req.user && req.user.role === 'PRINTER') {
        // Truong hop 2: Chu xuong in dang dang nhap tai Printing Shop portal
        const currentPrinterId = req.user._id.toString();
        filter.$or = [
          { printer_id: currentPrinterId },
          // Neu la tai khoan demo xac dinh, cung load cac phoi mac dinh
          ...(req.user.email === 'printer@vietcraft.print' ? [{ printer_id: { $exists: false } }, { printer_id: null }] : [])
        ];
        printerInfo = {
          printer_id: currentPrinterId,
          printer_name: req.user.workshop_name || req.user.name
        };
      } else {
        // Truong hop 3: Seller hoac xem cong khai
        const defaultPrinter = await User.findOne({ role: { $in: ['PRINTER', 'ADMIN'] } }).select('_id name workshop_name').lean();
        if (defaultPrinter) {
          printerInfo = {
            printer_id: defaultPrinter._id.toString(),
            printer_name: defaultPrinter.workshop_name || defaultPrinter.name
          };
        }
      }

      const blanks = await Blank.find(filter).sort({ createdAt: -1 }).lean();

      const enrichedBlanks = blanks.map(b => ({
        ...b,
        printer_id: b.printer_id || printerInfo.printer_id,
        printer_name: b.printer_name || printerInfo.printer_name
      }));

      res.json(enrichedBlanks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getBlankById(req, res) {
    try {
      const blank = await Blank.findById(req.params.id);
      if (!blank) return res.status(404).json({ error: 'Không tìm thấy phôi.' });
      res.json(blank);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng chọn file ảnh để tải lên.' });
      }

      // Ưu tiên lưu lên Cloudinary nếu đã cấu hình
      if (isCloudinaryEnabled()) {
        try {
          const cloudResult = await uploadToCloudinary(req.file.path, 'vietcraft/printing-shop/blanks');
          
          // Xóa file tạm cục bộ sau khi đã upload Cloudinary thành công
          try {
            if (fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }
          } catch (unlinkErr) {
            // Không chặn luồng nếu unlink gặp lỗi
          }

          return res.json({
            url: cloudResult.url,
            storage: 'cloudinary',
            public_id: cloudResult.public_id,
            filename: req.file.filename,
            size: cloudResult.bytes || req.file.size,
            mimetype: req.file.mimetype
          });
        } catch (cloudErr) {
          console.warn('[Cloudinary Warning] Lỗi upload Cloudinary, chuyển sang lưu cục bộ:', cloudErr.message);
        }
      }

      // Fallback: Sử dụng đường dẫn cục bộ nếu Cloudinary chưa bật hoặc gặp sự cố
      const fileUrl = `/uploads/blanks/${req.file.filename}`;
      res.json({
        url: fileUrl,
        storage: 'local',
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createBlank(req, res) {
    try {
      const blankData = {
        ...req.body,
        printer_id: req.user ? req.user._id.toString() : req.body.printer_id,
        printer_name: req.user ? (req.user.workshop_name || req.user.name) : req.body.printer_name
      };
      const blank = await Blank.create(blankData);
      res.status(201).json(blank);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updateBlank(req, res) {
    try {
      const blank = await Blank.findById(req.params.id);
      if (!blank) return res.status(404).json({ error: 'Không tìm thấy phôi.' });

      // Kiem tra quyen so huu cua xuong in
      if (req.user && req.user.role === 'PRINTER') {
        const uId = req.user._id.toString();
        if (blank.printer_id && blank.printer_id !== uId && req.user.email !== 'printer@vietcraft.print') {
          return res.status(403).json({ error: 'Bạn chỉ có quyền chỉnh sửa phôi do xưởng của mình tạo ra.' });
        }
      }

      const updated = await Blank.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async deleteBlank(req, res) {
    try {
      const blank = await Blank.findById(req.params.id);
      if (!blank) return res.status(404).json({ error: 'Không tìm thấy phôi.' });

      // Kiem tra quyen so huu cua xuong in
      if (req.user && req.user.role === 'PRINTER') {
        const uId = req.user._id.toString();
        if (blank.printer_id && blank.printer_id !== uId && req.user.email !== 'printer@vietcraft.print') {
          return res.status(403).json({ error: 'Bạn chỉ có quyền xóa phôi do xưởng của mình tạo ra.' });
        }
      }

      // Data integrity: chặn xóa nếu đã có đơn in dùng sku của phôi này.
      const skus = blank.variations.map(v => v.sku);
      const inUse = await PrintOrder.countDocuments({ 'items.sku': { $in: skus } });
      if (inUse > 0) {
        return res.status(400).json({ error: `Không thể xóa: có ${inUse} đơn in đang dùng phôi này. Hãy tắt (is_active=false) thay vì xóa.` });
      }
      await Blank.findByIdAndDelete(req.params.id);
      res.json({ message: 'Đã xóa phôi.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = BlankController;
