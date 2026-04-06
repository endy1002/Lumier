// ===== Mock Product Data =====
// Replace image paths with actual product photos later

export const PRODUCTS = [
  // === BOOKCHARM (Ngăn 1 & 2) ===
  {
    id: 'bc-001',
    name: 'The Golden Book Charm',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Mỗi cuốn sách là một tác phẩm nghệ thuật thủ công, được đúc kết từ sự vàng ròng và niềm đam mê với tri thức. Chúng tôi mang đến sự sang trọng tìm ẩn cho trang sách bạn đã mở, biến trải nghiệm đọc thành một hành trình thức thường xúc đầy cảm hứng.',
    image: '/images/products/charm-golden.jpg',
    shelf: 1,
    customizable: true,
    bestSeller: true,
    salesCount: 342,
  },
  {
    id: 'bc-002',
    name: 'The Classic Rose',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm hình hoa hồng cổ điển, mang phong cách vintage thanh lịch.',
    image: '/images/products/charm-rose.jpg',
    shelf: 1,
    customizable: true,
    bestSeller: true,
    salesCount: 289,
  },
  {
    id: 'bc-003',
    name: 'The Midnight Library',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm phiên bản thư viện đêm, thiết kế tối giản với tông xanh navy.',
    image: '/images/products/charm-midnight.jpg',
    shelf: 1,
    customizable: true,
    bestSeller: false,
    salesCount: 156,
  },
  {
    id: 'bc-004',
    name: 'The Aurelian Archive',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm lấy cảm hứng từ kho tàng tri thức phương Đông.',
    image: '/images/products/charm-aurelian.jpg',
    shelf: 2,
    customizable: true,
    bestSeller: false,
    salesCount: 198,
  },
  {
    id: 'bc-005',
    name: 'Victoria Library',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm phong cách thư viện Victoria, sang trọng và quý phái.',
    image: '/images/products/charm-victoria.jpg',
    shelf: 2,
    customizable: true,
    bestSeller: true,
    salesCount: 267,
  },
  {
    id: 'bc-006',
    name: 'The Wanderer Tale',
    category: 'CHARM',
    basePrice: 150000,
    description: 'Bookcharm dành cho những tâm hồn yêu du lịch và khám phá.',
    image: '/images/products/charm-wanderer.jpg',
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
    image: '/images/products/bookmark-golden.jpg',
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
    image: '/images/products/bookmark-artistic.jpg',
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
    image: '/images/products/bookmark-nooks.jpg',
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
    image: '/images/products/notebook-classic.jpg',
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
    image: '/images/products/notebook-journal.jpg',
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
