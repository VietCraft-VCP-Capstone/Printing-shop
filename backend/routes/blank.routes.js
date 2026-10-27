const express = require('express');
const BlankController = require('../controllers/blank.controller');
const { authenticate, optionalAuthenticate, requireRole } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Reads — Hỗ trợ nhận diện Xưởng in đăng nhập hoặc lấy phôi theo X-API-Key đối tác
router.get('/', optionalAuthenticate, BlankController.getAllBlanks);
router.get('/:id', BlankController.getBlankById);

// Upload ảnh phôi từ máy tính
router.post('/upload', optionalAuthenticate, upload.single('image'), BlankController.uploadImage);

// Writes — PRINTER và ADMIN xưởng in.
router.post('/', authenticate, requireRole(['PRINTER', 'ADMIN']), BlankController.createBlank);
router.put('/:id', authenticate, requireRole(['PRINTER', 'ADMIN']), BlankController.updateBlank);
router.delete('/:id', authenticate, requireRole(['PRINTER', 'ADMIN']), BlankController.deleteBlank);

module.exports = router;
