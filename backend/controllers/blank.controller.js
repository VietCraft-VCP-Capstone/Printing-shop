const Blank = require('../models/blank.model');
const PrintOrder = require('../models/order.model');

class BlankController {
  static async getAllBlanks(req, res) {
    try {
      // Public: seller/marketplace chỉ cần phôi đang bật. Admin xem tất cả qua ?all=1.
      const filter = req.query.all === '1' ? {} : { is_active: { $ne: false } };
      const blanks = await Blank.find(filter).sort({ createdAt: -1 });
      res.json(blanks);
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

  static async createBlank(req, res) {
    try {
      const blank = await Blank.create(req.body);
      res.status(201).json(blank);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updateBlank(req, res) {
    try {
      const blank = await Blank.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!blank) return res.status(404).json({ error: 'Không tìm thấy phôi.' });
      res.json(blank);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async deleteBlank(req, res) {
    try {
      const blank = await Blank.findById(req.params.id);
      if (!blank) return res.status(404).json({ error: 'Không tìm thấy phôi.' });
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
