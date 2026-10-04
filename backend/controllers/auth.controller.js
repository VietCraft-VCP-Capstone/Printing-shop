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
      const { id_token, role: requestedRole, workshop_name } = req.body;
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
        const effectiveRole = (requestedRole === 'SELLER') ? 'SELLER' : 'PRINTER';

        user = await User.create({
          email,
          name: name || email.split('@')[0],
          avatar: picture || '',
          role: effectiveRole,
          workshop_name: effectiveRole === 'PRINTER' ? (workshop_name || `${name || email.split('@')[0]} Workshop`) : undefined,
          google_id
        });
        console.log(`[USER REGISTRATION - GOOGLE] Created new user: ${email} with role: ${effectiveRole}`);
      } else {
        // Update user name/avatar if they changed in Google
        let updated = false;
        if (name && user.name !== name) { user.name = name; updated = true; }
        if (picture && user.avatar !== picture) { user.avatar = picture; updated = true; }
        if (google_id && !user.google_id) { user.google_id = google_id; updated = true; }
        if (requestedRole === 'PRINTER' && workshop_name && !user.workshop_name) {
          user.workshop_name = workshop_name;
          updated = true;
        }
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
          role: user.role,
          workshop_name: user.workshop_name
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
      const effectiveRole = (role === 'SELLER') ? 'SELLER' : 'PRINTER';

      let email = 'printer@vietcraft.print';
      let name = 'Chủ Xưởng In VietCraft Direct';
      let workshop_name = 'Xưởng In VietCraft Direct Hub';

      if (effectiveRole === 'SELLER') {
        email = 'seller@vietcraft.vn';
        name = 'Seller Đối Tác POD Demo';
        workshop_name = '';
      }
      
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          name,
          role: effectiveRole,
          workshop_name,
          password: 'password123',
          avatar: '',
          google_id: 'dev_mock_id'
        });
        console.log(`[DEV LOGIN] Registered new mock account: ${email} (${effectiveRole})`);
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
          role: user.role,
          workshop_name: user.workshop_name
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
      const { name, email, password, role, workshop_name, phone, address } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ error: 'Địa chỉ email này đã được đăng ký.' });
      }

      const userRole = (role === 'SELLER') ? 'SELLER' : 'PRINTER';
      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        role: userRole,
        workshop_name: userRole === 'PRINTER' ? (workshop_name || `${name} Printing Workshop`) : undefined,
        phone,
        address
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
          role: user.role,
          workshop_name: user.workshop_name
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
          role: user.role,
          workshop_name: user.workshop_name
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
      role: req.user.role,
      workshop_name: req.user.workshop_name,
      phone: req.user.phone,
      address: req.user.address,
      description: req.user.description
    });
  }

  // Update workshop / user profile
  static async updateProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Chưa đăng nhập.' });
      }

      const { name, workshop_name, phone, address, description, role } = req.body;
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
      }

      if (name) user.name = name.trim();
      if (workshop_name !== undefined) user.workshop_name = workshop_name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (address !== undefined) user.address = address.trim();
      if (description !== undefined) user.description = description.trim();
      if (role && ['PRINTER', 'SELLER'].includes(role)) {
        user.role = role;
      }

      await user.save();

      // Đồng bộ tên xưởng sang các phôi và quan hệ đối tác đã tạo
      if (user.role === 'PRINTER' && user.workshop_name) {
        const Blank = require('../models/blank.model');
        const Partnership = require('../models/partnership.model');
        await Blank.updateMany(
          { printer_id: user._id.toString() },
          { $set: { printer_name: user.workshop_name } }
        );
        await Partnership.updateMany(
          { printer_id: user._id },
          { $set: { printer_name: user.workshop_name } }
        );
      }

      console.log(`[PROFILE UPDATE] User ${user.email} updated profile. Workshop: ${user.workshop_name}, Role: ${user.role}`);

      res.json({
        message: 'Cập nhật thông tin thành công.',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          workshop_name: user.workshop_name,
          phone: user.phone,
          address: user.address,
          description: user.description
        }
      });
    } catch (err) {
      console.error('[PROFILE UPDATE ERROR]', err);
      res.status(500).json({ error: 'Lỗi cập nhật thông tin: ' + err.message });
    }
  }
}

module.exports = AuthController;
