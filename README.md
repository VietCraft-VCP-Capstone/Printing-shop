# 🖨️ VietCraft Print — Portal Xưởng In

> Nền tảng quản lý xưởng in chuyên nghiệp, tích hợp trực tiếp với hệ sinh thái thương mại điện tử **VietCraft Marketplace**.

---

## 📋 Tổng quan

**VietCraft Print** là một cổng vận hành (Operator Portal) độc lập dành riêng cho các xưởng in đối tác của VietCraft. Hệ thống xử lý toàn bộ vòng đời của một đơn in ấn — từ khi nhận file thiết kế, sản xuất, đến khi ủy quyền giao vận cho đối tác logistics.

### Luồng vận hành chính

```
VietCraft Marketplace
        │  (Webhook: POST /api/orders)
        ▼
  Nhận đơn (RECEIVED)
        │  (Operator duyệt)
        ▼
  Đang in (PRINTING)
        │  (Operator hoàn tất)
        ▼
  Đóng gói (PACKAGED)
        │  (Admin ủy quyền)
        ▼
  Đã giao (SHIPPED) ──► GHN / GHTK
```

---

## 🏗️ Kiến trúc hệ thống

```
Printing-shop/
├── backend/          # Node.js + Express REST API (Port 8880)
└── frontend/         # React 19 + Vite + Tailwind CSS (Port 3001)
```

### Backend — Mô hình Layered MVC

```
backend/
├── server.js                 # Entry point, Express app bootstrap
├── .env                      # Biến môi trường (KHÔNG commit lên git)
├── config/
│   └── db.js                 # Kết nối MongoDB Atlas + seed dữ liệu
├── models/
│   ├── user.model.js         # Schema người dùng (ADMIN / OPERATOR)
│   ├── order.model.js        # Schema đơn hàng in ấn
│   └── blank.model.js        # Schema phôi sản phẩm (áo thun, cốc...)
├── controllers/
│   ├── auth.controller.js    # Xác thực Google OAuth + cấp JWT
│   ├── order.controller.js   # CRUD & cập nhật trạng thái đơn hàng
│   └── blank.controller.js   # Quản lý catalog phôi
├── middleware/
│   └── auth.middleware.js    # JWT authenticate + RBAC requireRole()
├── routes/
│   ├── index.js              # Tổng hợp tất cả routes
│   ├── auth.routes.js        # /api/auth/*
│   ├── order.routes.js       # /api/orders/*
│   └── blank.routes.js       # /api/blanks/*
└── services/
    └── webhook.service.js    # Gửi callback trạng thái về VietCraft BE
```

### Frontend — Feature-based Architecture

```
frontend/src/
├── App.tsx                         # Root component, quản lý auth state
├── index.css                       # Tailwind v4 + design tokens
├── main.tsx                        # React entry point
├── services/
│   └── api.ts                      # Axios instance + JWT interceptor
├── components/
│   ├── Sidebar.tsx                 # Navigation sidebar (RBAC-aware)
│   └── Header.tsx                  # Header + user profile + logout
└── features/
    ├── auth/
    │   └── LoginPage.tsx           # Google OAuth + dev bypass login
    ├── dashboard/
    │   ├── DashboardTab.tsx        # Tổng quan thống kê & active jobs
    │   └── components/
    │       └── StatCard.tsx        # Card thống kê tái sử dụng
    ├── orders/
    │   ├── OrdersTab.tsx           # Bảng danh sách đơn hàng
    │   └── components/
    │       ├── OrderRow.tsx        # Hàng đơn hàng + action buttons
    │       └── ShippingModal.tsx   # Modal chọn đơn vị vận chuyển
    └── catalog/
        └── CatalogTab.tsx          # Hiển thị danh mục phôi sản phẩm
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| MongoDB Atlas | Cluster đang hoạt động |

---

### 1. Clone và cài dependencies

```bash
# Cài backend
cd Printing-shop/backend
npm install

# Cài frontend
cd ../frontend
npm install
```

---

### 2. Cấu hình biến môi trường

#### `backend/.env`

```env
PORT=8880
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/printing?appName=VietCraft
VIETCRAFT_BE_URL=http://localhost:8080
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
JWT_SECRET=<your-secret-key-min-32-chars>
PRINTER_REFUND_API_KEY=<shared-refund-secret>
PRINTER_REFUND_PRINTER_ID=<assigned-workshop-id>
```

#### `frontend/.env`

```env
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
```

> ⚠️ **Không bao giờ commit file `.env` lên Git.** Cả hai file đã được thêm vào `.gitignore`.

---

### 3. Khởi chạy Development

```bash
# Terminal 1 — Backend (port 8880)
cd Printing-shop/backend
npm run dev

# Terminal 2 — Frontend (port 3001)
cd Printing-shop/frontend
npm run dev
```

Truy cập: **http://localhost:3001**

---

## 🔐 Xác thực & Phân quyền

### Luồng đăng nhập Google OAuth

```
[Frontend] Người dùng click "Sign in with Google"
     │
     ▼
[Google SDK] Trả về id_token
     │
     ▼
[Backend] POST /api/auth/google
  └─ Xác minh id_token với Google API
  └─ Tìm hoặc tạo User trong MongoDB
  └─ Ký JWT (7 ngày) và trả về
     │
     ▼
[Frontend] Lưu token vào localStorage
  └─ Axios interceptor tự động đính token vào mọi request
```

### Bảng phân quyền vai trò (RBAC)

| Thao tác | ADMIN | OPERATOR |
|---|:---:|:---:|
| Xem danh sách đơn hàng | ✅ | ✅ |
| Duyệt & bắt đầu in | ✅ | ✅ |
| Cập nhật trạng thái đóng gói | ✅ | ✅ |
| **Ủy quyền giao vận (GHN/GHTK)** | ✅ | ❌ |
| Xem catalog phôi sản phẩm | ✅ | ❌ |

> **Lưu ý:** Tài khoản **đầu tiên** đăng nhập vào hệ thống sẽ được tự động gán quyền `ADMIN`. Các tài khoản tiếp theo mặc định là `OPERATOR`.

---

### Đăng nhập nhanh (Chế độ Test)

Trong môi trường development, trang Login cung cấp 2 nút bypass để kiểm thử nhanh mà không cần cấu hình Google OAuth:

| Nút | Tài khoản | Quyền |
|---|---|---|
| **ADMIN Login** | admin@vietcraft.print | Toàn quyền |
| **OPERATOR Login** | operator@vietcraft.print | Giới hạn |

Endpoint: `POST /api/auth/dev-login` nhận `{ "role": "ADMIN" | "OPERATOR" }`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| `POST` | `/api/auth/google` | Đăng nhập bằng Google id_token | Public |
| `POST` | `/api/auth/dev-login` | Đăng nhập nhanh (dev only) | Public |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại | JWT |

### Orders

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| `POST` | `/api/orders` | Nhận đơn hàng từ VietCraft BE (webhook) | Public |
| `GET` | `/api/orders` | Lấy danh sách tất cả đơn hàng | JWT |
| `PUT` | `/api/orders/:id/status` | Cập nhật trạng thái đơn hàng | JWT |
| `POST` | `/api/orders/:id/ship` | Ủy quyền giao vận | JWT + **ADMIN** |
| `POST` | `/api/orders/refund-requests` | Nhận yêu cầu hoàn tiền, chống gửi trùng | Shared partner key + printer ID |
| `GET` | `/api/orders/refund-requests` | Danh sách yêu cầu legacy và V3 được giao cho xưởng | JWT |
| `POST` | `/api/orders/refund-requests/:id/respond` | Chấp thuận/từ chối và gửi callback về VietCraft | JWT + **ADMIN** |

### Blanks (Phôi)

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| `GET` | `/api/blanks` | Lấy danh sách phôi sản phẩm | JWT |

---

## 🗄️ Database Schema

### User

```js
{
  email:     String (unique, required),
  name:      String,
  avatar:    String,
  role:      "ADMIN" | "OPERATOR",  // default: "OPERATOR"
  google_id: String
}
```

### Order

```js
{
  order_code:       String (unique),
  buyer_name:       String,
  recipient_phone:  String,
  shipping_address: { recipient_name, phone, address_detail, province },
  items: [{
    sku:         String,
    title:       String,
    quantity:    Number,
    color:       String,
    size:        String,
    artwork_url: String
  }],
  status:          "RECEIVED" | "PRINTING" | "PACKAGED" | "SHIPPED",
  carrier:         "GHN" | "GHTK",
  tracking_number: String
}
```

### Blank (Phôi)

```js
{
  name:       String,
  category:   String,
  variations: [{ sku, color, size, base_cost, stock }]
}
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4
- **Database:** MongoDB Atlas (via Mongoose 7)
- **Auth:** Google Identity API + JSON Web Token (JWT)
- **Dev:** Nodemon

### Frontend
- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **HTTP Client:** Axios (với JWT interceptor)
- **Icons:** Lucide React
- **Font:** Outfit (Google Fonts)

---

## 🔗 Tích hợp với VietCraft Marketplace

### Đổi hàng và hoàn tiền

Cấu hình cùng `PRINTER_REFUND_API_KEY` và `PRINTER_REFUND_PRINTER_ID` trên VietCraft BE và Printing-shop backend. Printer ID phải trùng `printer_info.printer_id` / `printer_partner.printer_id` của các đơn được giao cho xưởng; đây là danh tính của xưởng, không phải tài khoản người dùng VietCraft. BE gửi legacy request tới `POST /api/orders/refund-requests`; cả hai chiều sử dụng header `x-vietcraft-refund-key` và `x-printer-id`. Không đưa shared key vào frontend.

Tab **Đổi hàng & hoàn tiền** lấy hàng chờ từ `GET {VIETCRAFT_BE_URL}/api/printer/refund-requests`, bao gồm yêu cầu V3. Admin xưởng quyết định và backend gọi `POST /api/printer/refund-requests/:id/respond`. Quyết định được lưu trước khi gọi callback; nếu mất kết nối, dùng **Gửi lại quyết định** để gửi đúng quyết định đã lưu. Resend giữ nguyên business key và không tạo quyết định mới. Chấp thuận từ xưởng chuyển yêu cầu hoàn tiền V3 tới Admin VietCraft; trạng thái thanh toán chỉ được xác nhận khi thực thi hoàn tiền thành công.

Công cụ mock development của VietCraft dùng đường dẫn riêng `/api/printer/mock/refund-requests` và `/:id/respond`, header `x-refund-printer-secret` lấy từ `REFUND_PRINTER_MOCK_SECRET`. Các đường dẫn mock bị tắt trong production; đường dẫn partner hoạt động ở production khi đã cấu hình shared key và printer ID.

### Nhận đơn hàng (Inbound Webhook)

VietCraft Backend gửi đơn hàng về Printing Shop khi seller xác nhận in ấn:

```
POST http://localhost:8880/api/orders
Content-Type: application/json

{
  "order_code": "VC-2026-00123",
  "buyer_name": "Nguyễn Văn A",
  "recipient_phone": "0901234567",
  "shipping_address": {
    "recipient_name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address_detail": "123 Đường Lê Lợi",
    "province": "Hồ Chí Minh"
  },
  "items": [{
    "sku": "TSHIRT-WHITE-M",
    "title": "Áo thun trắng - Custom Design",
    "quantity": 2,
    "color": "White",
    "size": "M",
    "artwork_url": "https://cdn.vietcraft.vn/designs/abc123.png"
  }]
}
```

### Cập nhật trạng thái (Outbound Callback)

Khi trạng thái đơn hàng thay đổi, Printing Shop tự động gọi về VietCraft Backend:

```
POST {VIETCRAFT_BE_URL}/api/orders/{order_code}/printing-status
{
  "status": "SHIPPED",
  "carrier": "GHN",
  "tracking_number": "GHN123456789"
}
```

---

## 📦 Scripts

### Backend

```bash
npm run dev      # Khởi chạy với nodemon (hot reload)
npm run start    # Khởi chạy production
```

### Frontend

```bash
npm run dev      # Dev server (http://localhost:3001)
npm run build    # Build production bundle (dist/)
npm run preview  # Xem trước bản build
npm run lint     # Kiểm tra lint với oxlint
```

---

## 🚨 Xử lý sự cố thường gặp

### Lỗi `Error 401: invalid_client` khi đăng nhập Google

**Nguyên nhân:** `localhost:3001` chưa được thêm vào Authorized JavaScript Origins trong Google Cloud Console.

**Cách sửa:**
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Chọn OAuth 2.0 Client ID của bạn
3. Thêm `http://localhost:3001` vào **Authorized JavaScript origins**
4. Thêm `http://localhost:3001` vào **Authorized redirect URIs**
5. Lưu và chờ vài phút để Google cập nhật

### Lỗi kết nối MongoDB

**Kiểm tra:** `MONGO_URI` trong `backend/.env` phải đúng định dạng và IP của máy đã được thêm vào **Network Access** của MongoDB Atlas.

### CSS không hiển thị (trang chỉ có text)

**Nguyên nhân:** Tailwind CSS chưa được cài hoặc `vite.config.ts` chưa có plugin.

**Cách sửa:**
```bash
cd frontend
npm install tailwindcss @tailwindcss/vite --save-dev
```

Kiểm tra `vite.config.ts` có đoạn:
```ts
import tailwindcss from '@tailwindcss/vite'
// ...
plugins: [tailwindcss(), react()]
```

---

## 👥 Phân công nhóm phát triển

| Module | Mô tả |
|---|---|
| `backend/` | API server, xác thực, business logic |
| `frontend/src/features/auth` | Màn hình đăng nhập & OAuth flow |
| `frontend/src/features/dashboard` | Dashboard tổng quan |
| `frontend/src/features/orders` | Quản lý đơn hàng in ấn |
| `frontend/src/features/catalog` | Catalog phôi sản phẩm |

---

## 📄 License

© 2026 VietCraft Platform. Bảo lưu mọi quyền.
