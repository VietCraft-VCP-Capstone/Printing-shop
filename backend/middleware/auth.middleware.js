const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('CRITICAL: JWT_SECRET must be defined in environment variables.');
}
// Middleware to authenticate user via JWT
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Truy cập bị từ chối. Thiếu token xác thực.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Người dùng không tồn tại hoặc đã bị xóa.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

// Middleware to restrict access to specific roles
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa xác thực người dùng.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền thực hiện hành động này. Yêu cầu quyền quản trị viên.' });
    }

    next();
  };
}

/**
 * Cho phép truy cập nếu có X-API-Key hợp lệ (Partner VietCraft) HOẶC Bearer JWT hợp lệ (Nhân viên xưởng)
 */
async function authenticatePartnerOrStaff(req, res, next) {
  const expectedKey = process.env.PRINTING_SHOP_API_KEY;
  const providedKey = req.headers['x-api-key'] || (req.headers['authorization']?.startsWith('ApiKey ') ? req.headers['authorization'].replace('ApiKey ', '') : null);

  // 1. Kiểm tra X-API-Key từ sàn VietCraft
  if (expectedKey && providedKey && providedKey === expectedKey) {
    req.isPartner = true;
    return next();
  }

  // 2. Kiểm tra JWT Token đăng nhập từ nhân viên xưởng
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch {
      // Bỏ qua lỗi verify để trả về 401 chung bên dưới
    }
  }

  return res.status(401).json({
    error: 'Unauthorized: Endpoint này được bảo vệ. Yêu cầu cung cấp X-API-Key hợp lệ hoặc Token đăng nhập.'
  });
}

module.exports = {
  authenticate,
  requireRole,
  authenticatePartnerOrStaff
};
