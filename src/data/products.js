// ===== Mock Product Data =====
// Replace image paths with actual product photos later

export const PRODUCTS = [
  // === BOOKCHARM (Ngăn 1 & 2) ===
  {
    id: 'bc-001',
    name: 'Trên đồi mở mắt và mơ',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Mỗi cuốn sách là một tác phẩm nghệ thuật thủ công, được đúc kết từ sự vàng ròng và niềm đam mê với tri thức. Chúng tôi mang đến sự sang trọng tìm ẩn cho trang sách bạn đã mở, biến trải nghiệm đọc thành một hành trình thức thường xúc đầy cảm hứng.',
    image: '/showing/cover/A1.jpg',
    shelf: 1,
    customizable: true,
    bestSeller: true,
    salesCount: 342,
  },
  {
    id: 'bc-002',
    name: 'The Other Side',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm hình hoa hồng cổ điển, mang phong cách vintage thanh lịch.',
    image: '/showing/cover/A2.jpg',
    shelf: 1,
    customizable: true,
    bestSeller: true,
    salesCount: 289,
  },
  {
    id: 'bc-003',
    name: 'Takahashi',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm phiên bản thư viện đêm, thiết kế tối giản với tông xanh navy.',
    image: '/showing/cover/A3.jpg',
    shelf: 1,
    customizable: true,
    bestSeller: false,
    salesCount: 156,
  },
  {
    id: 'bc-004',
    name: 'Ngọn đèn không tắt',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm lấy cảm hứng từ kho tàng tri thức phương Đông.',
    image: '/showing/cover/A4.jpg',
    shelf: 2,
    customizable: true,
    bestSeller: false,
    salesCount: 198,
  },
  {
    id: 'bc-005',
    name: 'Cho tôi xin một vé đi tuổi thơ',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm phong cách thư viện Victoria, sang trọng và quý phái.',
    image: '/showing/cover/A5.jpg',
    shelf: 2,
    customizable: true,
    bestSeller: true,
    salesCount: 267,
  },
  {
    id: 'bc-006',
    name: 'Trốn lên mái nhà để khóc',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm dành cho những tâm hồn yêu du lịch và khám phá.',
    image: '/showing/cover/A6.jpg',
    shelf: 2,
    customizable: true,
    bestSeller: false,
    salesCount: 134,
  },

  // === BOOKMARK (Ngăn 3) ===
  {
    id: 'bm-001',
    name: 'Golden Book Charms Bookmark',
    category: 'BOOKMARK',
    basePrice: 50000,
    description: 'Bookmark nghệ thuật đính kèm charm vàng tinh xảo.',
    image: '/showing/bookmark/D1.jpg',
    shelf: 3,
    customizable: false,
    bestSeller: false,
    salesCount: 78,
  },
  {
    id: 'bm-002',
    name: 'Artistic Bookmarks Set',
    category: 'BOOKMARK',
    basePrice: 50000,
    description: 'Bộ bookmark nghệ thuật với các họa tiết hoa văn tinh tế.',
    image: '/showing/bookmark/D2.jpg',
    shelf: 3,
    customizable: false,
    bestSeller: false,
    salesCount: 95,
  },
  {
    id: 'bm-003',
    name: 'Masterpiece Book Nooks',
    category: 'BOOKMARK',
    basePrice: 65000,
    description: 'Bookmark 3D tạo không gian sách thu nhỏ độc đáo.',
    image: '/showing/bookmark/D3.jpg',
    shelf: 3,
    customizable: false,
    bestSeller: true,
    salesCount: 112,
  },

  // === NOTEBOOK (Ngăn 4) ===
  {
    id: 'nb-001',
    name: 'Lumier Classic Notebook',
    category: 'NOTEBOOK',
    basePrice: 85000,
    description: 'Sổ note bìa cứng phong cách cổ điển Lumier, 120 trang giấy Premium.',
    image: '/showing/notes/B1.jpg',
    shelf: 4,
    customizable: false,
    bestSeller: false,
    salesCount: 67,
  },
  {
    id: 'nb-002',
    name: 'The Storyteller Journal',
    category: 'NOTEBOOK',
    basePrice: 95000,
    description: 'Sổ nhật ký phong cách The Storyteller với bìa da cao cấp.',
    image: '/showing/notes/B2.jpg',
    shelf: 4,
    customizable: false,
    bestSeller: false,
    salesCount: 54,
  },
];

// Bestseller ranking computed from salesCount
export const getBestSellers = () =>
  [...PRODUCTS]
    .filter((p) => p.category === 'CHARM')
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

export const getProductsByShelf = (shelfNumber) =>
  PRODUCTS.filter((p) => p.shelf === shelfNumber);

export const getProductById = (id) =>
  PRODUCTS.find((p) => p.id === id);
