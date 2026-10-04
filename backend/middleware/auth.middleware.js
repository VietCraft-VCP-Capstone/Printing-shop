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

// Middleware for optional authentication (extracts user if token present)
async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireRole
};
