const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const jwtSecret = process.env.JWT_SECRET;

if (!googleClientId || !jwtSecret) {
  console.error('CRITICAL: GOOGLE_CLIENT_ID and JWT_SECRET must be defined in environment variables.');
}
const getFetch = async () => {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
};

class AuthController {
  static async googleLogin(req, res) {
    try {
      const { id_token } = req.body;
      if (!id_token) {
        return res.status(400).json({ error: 'Thiếu Google ID Token.' });
      }

      // Verify token with Google
      const fetch = await getFetch();
      const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`;
      const response = await fetch(googleVerifyUrl);
      
      if (!response.ok) {
        return res.status(400).json({ error: 'ID Token Google không hợp lệ hoặc đã hết hạn.' });
      }

      const payload = await response.json();

      // Check if aud matches our Google Client ID
      if (payload.aud !== googleClientId) {
        return res.status(400).json({ error: 'Token Audience không khớp với Google Client ID của ứng dụng.' });
      }

      const { email, name, picture, sub: google_id } = payload;
      if (!email) {
        return res.status(400).json({ error: 'Không lấy được địa chỉ email từ tài khoản Google.' });
      }

      // Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        // If it's the first user, make them ADMIN
        const userCount = await User.countDocuments({});
        const role = userCount === 0 ? 'ADMIN' : 'OPERATOR';

        user = await User.create({
          email,
          name: name || email.split('@')[0],
          avatar: picture || '',
          role,
          google_id
        });
        console.log(`[USER REGISTRATION] Created new user: ${email} with role: ${role}`);
      } else {
        // Update user name/avatar if they changed in Google
        let updated = false;
        if (name && user.name !== name) { user.name = name; updated = true; }
        if (picture && user.avatar !== picture) { user.avatar = picture; updated = true; }
        if (google_id && !user.google_id) { user.google_id = google_id; updated = true; }
        if (updated) await user.save();
      }

      // Sign local JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        }
      });
    } catch (err) {
      console.error('[AUTH ERROR] Google login failed:', err.message);
      res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống trong quá trình đăng nhập.' });
    }
  }

  static async devLogin(req, res) {
    try {
      const { role } = req.body;
      if (!['ADMIN', 'OPERATOR'].includes(role)) {
        return res.status(400).json({ error: 'Role không hợp lệ. Chỉ chấp nhận ADMIN hoặc OPERATOR.' });
      }

      const email = role === 'ADMIN' ? 'admin@vietcraft.print' : 'operator@vietcraft.print';
      const name = role === 'ADMIN' ? 'Admin Test' : 'Operator Test';
      
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          name,
          role,
          avatar: '',
          google_id: 'dev_mock_id'
        });
        console.log(`[DEV LOGIN] Registered new mock account: ${email} (${role})`);
      }

      // Sign local JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        }
      });
    } catch (err) {
      console.error('[DEV AUTH ERROR]', err.message);
      res.status(500).json({ error: 'Lỗi đăng nhập nhanh thử nghiệm.' });
    }
  }

  // Standard Email/Password Register
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ error: 'Địa chỉ email này đã được đăng ký.' });
      }

      const userRole = ['ADMIN', 'OPERATOR'].includes(role) ? role : 'OPERATOR';
      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        role: userRole
      });

      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar || '',
          role: user.role
        }
      });
    } catch (err) {
      console.error('[REGISTER ERROR]', err.message);
      res.status(500).json({ error: 'Đăng ký tài khoản thất bại.' });
    }
  }

  // Standard Email/Password Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(400).json({ error: 'Email hoặc mật khẩu không chính xác.' });
      }

      if (user.password && user.password !== password) {
        return res.status(400).json({ error: 'Mật khẩu không chính xác.' });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar || '',
          role: user.role
        }
      });
    } catch (err) {
      console.error('[LOGIN ERROR]', err.message);
      res.status(500).json({ error: 'Đăng nhập thất bại.' });
    }
  }

  // Get current logged in user details
  static async getCurrentUser(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập.' });
    }
    res.json({
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      role: req.user.role
    });
  }
}

module.exports = AuthController;
