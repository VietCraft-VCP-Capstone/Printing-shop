const express = require('express');
const BlankController = require('../controllers/blank.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', BlankController.getAllBlanks);
router.get('/:id', BlankController.getBlankById);

router.post('/', authenticate, requireRole(['ADMIN']), BlankController.createBlank);
router.put('/:id', authenticate, requireRole(['ADMIN']), BlankController.updateBlank);
router.delete('/:id', authenticate, requireRole(['ADMIN']), BlankController.deleteBlank);

module.exports = router;
