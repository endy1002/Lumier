// ===== Mock Audiobook & Author Data =====

export const AUDIOBOOKS = [
  {
    id: 'ab-001',
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    narrator: 'Minh Tú',
    duration: '4h 32m',
    coverImage: '/images/audiobooks/nha-gia-kim.jpg',
    summary: 'Câu chuyện về chàng chăn cừu Santiago trong hành trình theo đuổi giấc mơ, vượt sa mạc Sahara để tìm kho báu tại Kim Tự Tháp Ai Cập.',
    locked: true,
  },
  {
    id: 'ab-002',
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    narrator: 'Hoàng Anh',
    duration: '6h 15m',
    coverImage: '/images/audiobooks/dac-nhan-tam.jpg',
    summary: 'Những nguyên tắc cơ bản trong giao tiếp và cách đối nhân xử thế để chinh phục lòng người.',
    locked: true,
  },
  {
    id: 'ab-003',
    title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
    author: 'Nguyễn Nhật Ánh',
    narrator: 'Thanh Hà',
    duration: '5h 48m',
    coverImage: '/images/audiobooks/hoa-vang-co-xanh.jpg',
    summary: 'Câu chuyện tuổi thơ trong sáng về tình bạn, tình anh em và cuộc sống làng quê miền Trung.',
    locked: true,
  },
  {
    id: 'ab-004',
    title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
    author: 'Nguyễn Nhật Ánh',
    narrator: 'Minh Châu',
    duration: '3h 20m',
    coverImage: '/images/audiobooks/ve-di-tuoi-tho.jpg',
    summary: 'Hành trình ngược dòng thời gian trở về tuổi thơ với những kỷ niệm đẹp đẽ và hồn nhiên.',
    locked: true,
  },
];

export const AUTHORS = [
  {
    id: 'auth-001',
    name: 'Nguyễn Nhật Ánh',
    avatar: '/images/authors/nguyen-nhat-anh.jpg',
    bio: 'Nhà văn Việt Nam nổi tiếng với các tác phẩm văn học thiếu nhi và tuổi mới lớn. Ông được mệnh danh là "nhà văn của tuổi thơ".',
    works: ['Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', 'Mắt Biếc'],
  },
  {
    id: 'auth-002',
    name: 'Nam Cao',
    avatar: '/images/authors/nam-cao.jpg',
    bio: 'Một trong những nhà văn tiêu biểu nhất của văn học hiện thực phê phán Việt Nam, với những tác phẩm sâu sắc về con người và xã hội.',
    works: ['Chí Phèo', 'Lão Hạc', 'Đời Thừa'],
  },
  {
    id: 'auth-003',
    name: 'Nguyễn Du',
    avatar: '/images/authors/nguyen-du.jpg',
    bio: 'Đại thi hào dân tộc Việt Nam, tác giả của Truyện Kiều - kiệt tác văn học cổ điển Việt Nam.',
    works: ['Truyện Kiều', 'Văn Chiêu Hồn'],
  },
];

// Valid audiobook access codes (mock)
export const VALID_CODES = [
  'LUMIER2024',
  'BOOKCHARM001',
  'GOLDEN-READ',
  'STORYTELLER',
];

export const validateAudiobookCode = (code) =>
  VALID_CODES.includes(code.trim().toUpperCase());
