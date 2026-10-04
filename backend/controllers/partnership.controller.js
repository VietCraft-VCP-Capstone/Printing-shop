const crypto = require('crypto');
const Partnership = require('../models/partnership.model');
const User = require('../models/user.model');

class PartnershipController {
  // Lấy danh sách các xưởng in đang hoạt động để Seller chọn gửi yêu cầu
  static async getAvailablePrinters(req, res) {
    try {
      let printers = await User.find({ role: { $in: ['PRINTER', 'ADMIN'] } })
        .select('_id name email role workshop_name phone address description')
        .lean();

      // Nếu database chưa có xưởng in nào ngoài ADMIN, tự tạo default printer
      if (printers.length === 0) {
        const defaultPrinter = await User.create({
          name: 'VietCraft Print Workshop Hub',
          workshop_name: 'VietCraft Direct Hub',
          email: 'printer@vietcraft.print',
          role: 'PRINTER',
          address: 'Khu Công Nghệ Cao, TP. Thủ Đức, TP. HCM',
          phone: '0908889999',
          description: 'Xưởng in tiêu chuẩn công nghệ cao VietCraft Direct, chuyên phôi áo thun cotton và quà tặng POD.'
        });
        printers = [defaultPrinter];
      }

      const formatted = printers.map(p => ({
        id: p._id,
        name: p.workshop_name || p.name,
        email: p.email,
        role: p.role,
        phone: p.phone || '0901234567',
        address: p.address || 'Hồ Chí Minh, Việt Nam',
        description: p.description || 'Chuyên in ấn phôi cao cấp theo công nghệ Direct-to-Garment và Sublimation.',
        api_url: process.env.PRINTER_PUBLIC_API_URL || 'http://localhost:8880'
      }));

      res.json(formatted);
    } catch (err) {
      console.error('[PARTNERSHIP] Lỗi lấy danh sách xưởng:', err.message);
      res.status(500).json({ error: 'Không thể tải danh sách xưởng in.' });
    }
  }

  // Seller gửi yêu cầu thỏa thuận hợp tác với xưởng in
  static async requestPartnership(req, res) {
    try {
      const sellerId = req.user.id || req.user._id;
      const { printer_id, shop_name, notes } = req.body;

      if (!printer_id) {
        return res.status(400).json({ error: 'Vui lòng chọn xưởng in cần hợp tác.' });
      }

      const printer = await User.findById(printer_id);
      if (!printer || !['PRINTER', 'ADMIN'].includes(printer.role)) {
        return res.status(404).json({ error: 'Xưởng in không tồn tại hoặc không hợp lệ.' });
      }

      const seller = await User.findById(sellerId);
      if (!seller) {
        return res.status(404).json({ error: 'Tài khoản người bán không tồn tại.' });
      }

      // Kiểm tra yêu cầu cũ
      let partnership = await Partnership.findOne({ printer_id, seller_id: sellerId });
      if (partnership) {
        if (partnership.status === 'ACCEPTED') {
          return res.status(400).json({ 
            error: 'Bạn đã có thỏa thuận hợp tác thành công với xưởng in này.',
            partnership 
          });
        }
        if (partnership.status === 'PENDING') {
          return res.status(400).json({ 
            error: 'Yêu cầu hợp tác đang chờ xưởng in phê duyệt.',
            partnership 
          });
        }
        // Nếu bị REJECTED trước đó, cho phép gửi lại
        partnership.status = 'PENDING';
        partnership.shop_name = shop_name || seller.name;
        partnership.notes = notes || '';
        partnership.rejection_reason = undefined;
        await partnership.save();
        return res.json({ message: 'Đã gửi lại yêu cầu hợp tác thành công!', partnership });
      }

      partnership = await Partnership.create({
        printer_id,
        printer_name: printer.workshop_name || printer.name,
        printer_api_url: process.env.PRINTER_PUBLIC_API_URL || 'http://localhost:8880',
        seller_id: seller._id,
        seller_name: seller.name,
        seller_email: seller.email,
        shop_name: shop_name || seller.name,
        notes: notes || '',
        status: 'PENDING'
      });

      res.status(201).json({ message: 'Gửi yêu cầu hợp tác thành công!', partnership });
    } catch (err) {
      console.error('[PARTNERSHIP] Lỗi gửi yêu cầu hợp tác:', err.message);
      res.status(500).json({ error: err.message || 'Lỗi gửi yêu cầu hợp tác.' });
    }
  }

  // Lấy danh sách thỏa thuận của người dùng đang đăng nhập
  static async getMyPartnerships(req, res) {
    try {
      const user = req.user;
      let query = {};

      if (user.role === 'SELLER') {
        query = { seller_id: user.id || user._id };
      } else if (user.role === 'PRINTER') {
        query = { printer_id: user.id || user._id };
      } else {
        // ADMIN xưởng xem tất cả hoặc theo xưởng
        query = {};
      }

      const list = await Partnership.find(query)
        .populate('printer_id', 'name email workshop_name phone address')
        .populate('seller_id', 'name email phone')
        .sort({ updatedAt: -1 })
        .lean();

      res.json(list);
    } catch (err) {
      console.error('[PARTNERSHIP] Lỗi lấy danh sách thỏa thuận:', err.message);
      res.status(500).json({ error: 'Không thể tải danh sách thỏa thuận.' });
    }
  }

  // Xưởng in phê duyệt hoặc từ chối thỏa thuận (Accept -> Tự sinh API Key)
  static async updatePartnershipStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, rejection_reason } = req.body;

      if (!['ACCEPTED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ. Chỉ chấp nhận ACCEPTED hoặc REJECTED.' });
      }

      const partnership = await Partnership.findById(id);
      if (!partnership) {
        return res.status(404).json({ error: 'Không tìm thấy thỏa thuận hợp tác.' });
      }

      partnership.status = status;
      if (status === 'ACCEPTED') {
        // Tự động sinh API Key bảo mật duy nhất cho Seller này
        const randomKey = crypto.randomBytes(20).toString('hex');
        partnership.api_key = `psk_live_${randomKey}`;
        partnership.accepted_at = new Date();
        partnership.rejection_reason = undefined;
      } else {
        partnership.rejection_reason = rejection_reason || 'Xưởng in từ chối yêu cầu kết nối.';
      }

      await partnership.save();

      res.json({
        message: status === 'ACCEPTED' 
          ? 'Đã chấp thuận hợp tác và cấp API Key cho Seller thành công!' 
          : 'Đã từ chối thỏa thuận hợp tác.',
        partnership
      });
    } catch (err) {
      console.error('[PARTNERSHIP] Lỗi cập nhật trạng thái:', err.message);
      res.status(500).json({ error: err.message || 'Lỗi cập nhật thỏa thuận.' });
    }
  }

  // Endpoint xác thực dành cho VietCraft Backend
  // POST /api/partnerships/verify-seller
  // Body: { email, password, api_key, api_url }
  static async verifySellerConnection(req, res) {
    try {
      const { email, password, api_key } = req.body;

      if (!api_key) {
        return res.status(400).json({ 
          error: 'Vui lòng cung cấp khóa API Key do xưởng in cấp cho thỏa thuận của bạn.' 
        });
      }

      const cleanApiKey = String(api_key).trim();

      // Kiểm tra thỏa thuận hợp tác và API Key
      const partnership = await Partnership.findOne({
        api_key: cleanApiKey,
        status: 'ACCEPTED'
      }).populate('seller_id').populate('printer_id');

      if (!partnership) {
        return res.status(400).json({ 
          error: 'Khóa API không hợp lệ hoặc xưởng in chưa phê duyệt thỏa thuận hợp tác cho tài khoản này. Vui lòng kiểm tra lại trạng thái thỏa thuận trên Cổng Printing Shop.' 
        });
      }

      const sellerUser = partnership.seller_id;
      if (!sellerUser) {
        return res.status(404).json({ 
          error: 'Không tìm thấy thông tin Người bán (Seller) gắn với khóa API này.' 
        });
      }

      // Nếu có cung cấp email, kiểm tra xem có khớp với tài khoản Seller sở hữu API Key này không
      if (email) {
        const cleanEmail = String(email).toLowerCase().trim();
        if (sellerUser.email.toLowerCase() !== cleanEmail) {
          return res.status(403).json({ 
            error: `Khóa API này thuộc về tài khoản Seller "${sellerUser.email}", không khớp với Email "${cleanEmail}" bạn vừa nhập.` 
          });
        }
      }

      // Xác thực mật khẩu:
      // - Nếu tài khoản đăng nhập qua Google (hoặc không có password đặt sẵn), bỏ qua kiểm tra mật khẩu.
      // - Nếu tài khoản có password và người dùng nhập password, xác thực xem có khớp không.
      const isGoogleAccount = Boolean(sellerUser.google_id || !sellerUser.password);
      if (!isGoogleAccount && sellerUser.password) {
        if (password && sellerUser.password !== password) {
          return res.status(401).json({ 
            error: 'Mật khẩu tài khoản Printing Shop không chính xác.' 
          });
        }
      }

      const printerUser = partnership.printer_id;

      return res.json({
        success: true,
        message: 'Xác thực tài khoản và liên kết xưởng in thành công!',
        seller: {
          id: sellerUser._id,
          name: sellerUser.name,
          email: sellerUser.email
        },
        printer: {
          id: partnership.printer_id?._id?.toString() || partnership.printer_id?.toString(),
          name: partnership.printer_name || printerUser?.workshop_name || printerUser?.name || 'Xưởng in đối tác',
          api_url: partnership.printer_api_url || process.env.PRINTER_PUBLIC_API_URL || 'http://localhost:8880'
        },
        partnership_id: partnership._id
      });
    } catch (err) {
      console.error('[PARTNERSHIP VERIFY ERROR]', err.message);
      res.status(500).json({ error: 'Lỗi hệ thống khi xác thực tài khoản với xưởng in: ' + err.message });
    }
  }
}

module.exports = PartnershipController;
