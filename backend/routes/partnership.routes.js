const express = require('express');
const PartnershipController = require('../controllers/partnership.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// 1. Endpoint công khai/đối tác cho VietCraft gọi xác thực
router.post('/verify-seller', PartnershipController.verifySellerConnection);

// 2. Danh sách xưởng in khả dụng (cho Seller xem và gửi yêu cầu)
router.get('/printers', authenticate, PartnershipController.getAvailablePrinters);

// 3. Seller gửi yêu cầu hợp tác với xưởng
router.post('/request', authenticate, requireRole(['SELLER']), PartnershipController.requestPartnership);

// 4. Lấy danh sách thỏa thuận của user đang đăng nhập
router.get('/my', authenticate, PartnershipController.getMyPartnerships);

// 5. Xưởng in duyệt / từ chối thỏa thuận (tự động cấp API Key khi ACCEPTED)
router.put('/:id/status', authenticate, requireRole(['ADMIN', 'PRINTER']), PartnershipController.updatePartnershipStatus);

module.exports = router;
