const crypto = require('crypto');

function partnerConfig(env = process.env) {
  const key = env.PRINTER_REFUND_API_KEY || '';
  const printerId = (env.PRINTER_REFUND_PRINTER_ID || '').trim();
  if (!key || !printerId) throw Object.assign(new Error('Chưa cấu hình kết nối hoàn tiền VietCraft.'), { statusCode: 503 });
  return { key, printerId, marketplaceUrl: (env.VIETCRAFT_BE_URL || 'http://localhost:8080').replace(/\/$/, '') };
}

function verifyRefundPartner(req, res, next) {
  try {
    const { key, printerId } = partnerConfig();
    const expected = Buffer.from(key), supplied = Buffer.from(String(req.headers['x-vietcraft-refund-key'] || ''));
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied) || String(req.headers['x-printer-id'] || '') !== printerId) {
      return res.status(401).json({ error: 'Unauthorized VietCraft partner' });
    }
    req.printerActorId = printerId;
    next();
  } catch (error) {
    res.status(error.statusCode || 503).json({ error: error.message });
  }
}

module.exports = { partnerConfig, verifyRefundPartner };
