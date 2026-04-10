// ===== LUMIER Configuration Constants =====

export const BRAND = {
  name: 'LUMIER',
  slogan: 'Chạm tri thức, rực bản nguyên',
  description:
    'Mỗi cuốn sách là một tác phẩm nghệ thuật thủ công, được đúc kết từ sự vàng ròng và niềm đam mê với tri thức.',
  disclaimer:
    'Website nhằm phục vụ cho môn học Digital Marketing của Đại học Kinh tế Thành phố Hồ Chí Minh (UEH) - KHÔNG PHỤC VỤ CHO BẤT KỲ MỤC ĐÍCH THƯƠNG MẠI NÀO',
};

export const NAV_LINKS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Sản phẩm', path: '/san-pham' },
  { label: 'Khám phá', path: '/kham-pha' },
  { label: 'Bài viết', path: '/bai-viet' },
];

export const PRICING = {
  BASE_CHARM: 100000,       // Sách có sẵn
  CUSTOM_COVER: 50000,      // Tự tay lựa/tải ảnh (+50k = 200k tổng)
  CUSTOMIZE_ADDON: 50000,   // Mỗi hình thức customize khác (chain, khắc tên)
};

export const CHARM_TYPES = [
  { id: 'silver', label: 'Charm Bạc', color: '#C0C0C0' },
  { id: 'gold', label: 'Charm Vàng', color: '#FFD700' },
];

export const SPINE_COLORS = [
  { id: 'navy', label: 'Navy', hex: '#00205B' },
  { id: 'amber', label: 'Vàng Amber', hex: '#F2A900' },
  { id: 'forest', label: 'Xanh Rêu', hex: '#2D5016' },
  { id: 'burgundy', label: 'Đỏ Burgundy', hex: '#800020' },
  { id: 'black', label: 'Đen', hex: '#1A1A1A' },
  { id: 'cream', label: 'Kem', hex: '#F5E6C8' },
];

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { id: 'qr', label: 'Chuyển khoản QR MBBank' },
];

// API Endpoints (for future Spring Boot backend)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  orders: `${API_BASE_URL}/orders`,
  auth: `${API_BASE_URL}/auth`,
  users: `${API_BASE_URL}/users`,
  audiobooks: `${API_BASE_URL}/audiobooks`,
  leads: `${API_BASE_URL}/leads`,
};
