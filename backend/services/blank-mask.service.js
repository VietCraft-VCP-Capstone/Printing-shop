const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { isCloudinaryEnabled, uploadToCloudinary } = require('./cloudinary.service');

// Service AI tách nền (ai-analysic). Cùng secret với backend VietCraft.
const AI_URL = () => (process.env.AI_ANALYTICS_URL || '').replace(/\/$/, '');
const AI_SECRET = () => process.env.AI_GATEWAY_SECRET || '';

const UPLOAD_ROOT = path.join(__dirname, '../uploads');
const MASK_DIR = path.join(UPLOAD_ROOT, 'blanks', 'masks');

class MaskError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/** Đọc ảnh phôi: file trong uploads của xưởng, hoặc URL http(s). */
async function readImage(url) {
  if (typeof url !== 'string' || !url.trim()) throw new MaskError(400, 'Thiếu ảnh phôi.');
  const u = url.trim();
  if (u.startsWith('/uploads/')) {
    const abs = path.resolve(UPLOAD_ROOT, u.replace('/uploads/', ''));
    if (!abs.startsWith(UPLOAD_ROOT) || !fs.existsSync(abs)) throw new MaskError(404, 'Không tìm thấy ảnh phôi trên máy chủ.');
    return fs.promises.readFile(abs);
  }
  if (!/^https?:\/\//i.test(u)) throw new MaskError(400, 'Đường dẫn ảnh không hợp lệ.');
  const res = await fetch(u, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new MaskError(400, `Không tải được ảnh phôi (${res.status}).`);
  const len = Number(res.headers.get('content-length') || 0);
  if (len > 15 * 1024 * 1024) throw new MaskError(413, 'Ảnh phôi quá lớn (tối đa 15MB).');
  return Buffer.from(await res.arrayBuffer());
}

async function saveMask(png) {
  fs.mkdirSync(MASK_DIR, { recursive: true });
  const name = `mask-${crypto.randomUUID()}.png`;
  const abs = path.join(MASK_DIR, name);
  await fs.promises.writeFile(abs, png);
  if (isCloudinaryEnabled()) {
    try {
      const up = await uploadToCloudinary(abs, 'vietcraft/printing-shop/masks');
      fs.promises.unlink(abs).catch(() => {});
      return up.url;
    } catch (err) {
      console.warn('[Mask] Cloudinary lỗi, lưu cục bộ:', err.message);
    }
  }
  return `/uploads/blanks/masks/${name}`;
}

/**
 * Tạo mask vùng phôi tự động bằng AI cho một ảnh phôi.
 * Trả { mask_url, coverage }; xưởng xem lại rồi bấm xác nhận (mask_status = 'confirmed').
 */
async function generateMask(imageUrl) {
  if (!AI_URL()) throw new MaskError(503, 'Máy chủ chưa cấu hình AI_ANALYTICS_URL để tách nền tự động. Bạn có thể tải PNG nền trong suốt thay thế.');
  const image = await readImage(imageUrl);

  const form = new FormData();
  form.append('file', new Blob([image]), 'blank.png');
  let res;
  try {
    res = await fetch(`${AI_URL()}/api/internal/vision/segment`, {
      method: 'POST',
      body: form,
      headers: AI_SECRET() ? { 'X-Gateway-Secret': AI_SECRET() } : {},
      signal: AbortSignal.timeout(120000),
    });
  } catch (err) {
    throw new MaskError(503, 'Không kết nối được dịch vụ AI tách nền. Thử lại sau hoặc tải PNG nền trong suốt.');
  }
  if (!res.ok) {
    throw new MaskError(res.status === 503 ? 503 : 502, `Dịch vụ AI tách nền trả lỗi ${res.status}.`);
  }
  const png = Buffer.from(await res.arrayBuffer());
  const coverage = Number(res.headers.get('x-seg-coverage')) || null;
  return { mask_url: await saveMask(png), coverage };
}

module.exports = { generateMask, MaskError };
