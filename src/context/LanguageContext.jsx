import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LANGUAGE_KEY = 'lumier-language';

const DIRECT_TRANSLATIONS = {
  'Trang chủ': 'Home',
  'Sản phẩm': 'Products',
  'Khám phá': 'Explore',
  'Bài viết': 'Articles',
  'Tìm kiếm': 'Search',
  'Giỏ hàng': 'Cart',
  'Tài khoản': 'Account',
  'Đóng': 'Close',
  'Chi tiết': 'Details',
  'Xác nhận thêm vào giỏ': 'Confirm add to cart',
  'Không tìm thấy sản phẩm.': 'No matching product found.',
  'Cùng customize nhé!': "Let's customize it!",
  'Đang tải sản phẩm...': 'Loading products...',
  'Bảng Giá': 'Pricing Table',
  'Phân loại': 'Category',
  'Giá': 'Price',
  'Chú thích': 'Notes',
  'Sách có sẵn': 'Ready-made Bookcharm',
  'Sách tự tay lựa': 'Custom Cover Bookcharm',
  'Customize khác': 'Other customization',
  'Khắc tên, chọn màu gáy...': 'Name engraving, spine color, and more...',
  'Đã customize': 'Customized',
  'Chưa customize': 'Not customized yet',
  'Về trang chủ': 'Back to home',
  'Xem đơn hàng': 'View orders',
  'Xem sản phẩm': 'Browse products',
  'Vui lòng đăng nhập': 'Please sign in',
  'Đăng nhập ngay': 'Sign in now',
  'Quay lại': 'Back',
  'Thanh toán': 'Checkout',
  'Thông tin liên hệ': 'Contact information',
  'Email đăng nhập': 'Signed-in email',
  'Số điện thoại': 'Phone number',
  'Họ và tên': 'Full name',
  'Địa chỉ giao hàng': 'Shipping address',
  'Ghi chú': 'Notes',
  'Phương thức thanh toán': 'Payment method',
  'Đơn hàng của bạn': 'Your order',
  'Mã khuyến mãi': 'Promo code',
  'Áp dụng': 'Apply',
  'Xóa': 'Remove',
  'Tạm tính': 'Subtotal',
  'Giảm giá': 'Discount',
  'Vận chuyển': 'Shipping',
  'Miễn phí': 'Free',
  'Tổng cộng': 'Total',
  'Đặt hàng': 'Place order',
  'Dang xu ly...': 'Processing...',
  'Đặt hàng thành công!': 'Order placed successfully!',
  'Giỏ hàng trống': 'Your cart is empty',
  'Tiếp tục mua sắm': 'Continue shopping',
  'Liên kết': 'Quick links',
  'Pháp lý': 'Legal',
  'Chính sách bảo mật': 'Privacy Policy',
  'Điều khoản dịch vụ': 'Terms of Service',
  'Đổi trả': 'Returns',
  'Đăng ký bản tin': 'Newsletter',
  'Nhận thông báo về các bản sách gốc hẹn xem nhất': 'Get updates on new premium editions.',
  'Email của bạn': 'Your email',
  'Gửi': 'Send',
  'Cảm ơn bạn đã đăng ký!': 'Thanks for subscribing!',
  'Trang bạn tìm không tồn tại': 'The page you are looking for does not exist.',
  'Có vẻ cuốn sách này đã bị lạc mất trên kệ. Hãy quay về trang chủ nhé!': 'Looks like this book got lost on the shelf. Return to the homepage.',
  'Chạm tri thức, rực bản nguyên': 'Touch knowledge, ignite your essence.',
  'Con người dù ít, dù nhiều chắc chắn vẫn có những cuốn sách yêu thích, những cuốn sách “gối đầu giường” cho riêng mình. Nó có thể định hình được cách cư xử, nhân sinh quan, hay đến cả mindset, skillset của bản thân.': 'Everyone has favorite books, the ones they keep close at heart. They can shape behavior, worldview, mindset, and skillset.',
  'Khám phá ngay': 'Explore now',
  'Thông số sản phẩm': 'Product specifications',
  'Kích thước:': 'Dimensions:',
  'Trọng lượng:': 'Weight:',
  'Chất liệu:': 'Material:',
  'Vẻ đẹp không cần đánh đổi bởi sự thuận tiện': 'Beauty without compromising convenience',
  'Những niềm tự hào của Lumier': 'Lumier highlights',
  'Sự hài lòng của khách hàng': 'Customer satisfaction',
  'Quá trình tạo ra sản phẩm': 'How the product is made',
  'bìa sách có sẵn': 'ready-made covers',
  'NXB cùng hợp tác': 'partner publishers',
  'Ta là ai và sẽ trở thành ai qua những gì ta đọc?': 'Who are we, and who do we become through what we read?',
  'Tùy chỉnh tác phẩm': 'Customize your piece',
  'Upload hình ảnh bìa của riêng bạn': 'Upload your own cover image',
  'Yêu cầu ảnh tỷ lệ 4:5': 'Image ratio requirement: 4:5',
  'Chọn loại charm kim loại': 'Choose charm material',
  'Chọn màu gáy sách': 'Choose spine color',
  'Khắc chữ lên gáy sách': 'Engrave text on spine',
  '(tối đa 10 từ)': '(up to 10 words)',
  'Miễn phí nếu để trống': 'Free if left blank',
  'Tổng ước tính:': 'Estimated total:',
  'Hủy': 'Cancel',
  'Hoàn tất tùy chỉnh': 'Complete customization',
  'Bìa sách bán chạy': 'Top selling covers',
  'Chưa có dữ liệu sản phẩm.': 'No product data yet.',
  'Không tìm thấy sản phẩm phù hợp. Thử từ khóa khác nhé.': 'No matching products found. Try another keyword.',
  'Tác giả': 'Authors',
  'Những ngòi bút một thời của văn học Việt.': 'Notable voices of Vietnamese literature.',
  'Xem chi tiết': 'View details',
  'Chưa có dữ liệu tác giả.': 'No author data yet.',
  'Sách Nói': 'Audiobooks',
  'Đăng nhập để nhập code và mở khóa audiobook.': 'Sign in to enter your code and unlock audiobooks.',
  'Code audiobook được phát hành theo từng giao dịch và chỉ dùng được với tài khoản đã mua.': 'Audiobook codes are issued per transaction and can only be used by the purchasing account.',
  'Nhập code từ bookcharm để truy cập vào kho thư viện sách nói đặc quyền': 'Enter the code from your bookcharm to access the exclusive audiobook library.',
  'Nhập code độc quyền...': 'Enter exclusive code...',
  'Đang xác nhận...': 'Verifying...',
  'Xác nhận': 'Confirm',
  'Bạn đã mở khóa': 'You have unlocked',
  'Đọc:': 'Narrated by:',
  'Chưa có audiobook nào trong thư viện.': 'No audiobooks in the library yet.',
  'Đang tải danh sách audiobook...': 'Loading audiobook list...',
  'Không thể tải dữ liệu audiobook.': 'Unable to load audiobook data.',
  'Vui lòng đăng nhập để kích hoạt audiobook.': 'Please sign in to activate audiobook.',
  'Kích hoạt thành công. Bạn có thể nghe ngay sách đã mở khóa.': 'Activation successful. You can now listen to unlocked books.',
  'Mã code không hợp lệ. Vui lòng kiểm tra lại.': 'Invalid code. Please check again.',
  'Đăng nhập': 'Sign in',
  'Đăng nhập bằng Google': 'Sign in with Google',
  'Đăng xuất': 'Sign out',
  'Vào Admin Dashboard': 'Open Admin Dashboard',
  'Lịch sử mua hàng': 'Order history',
  'Gu sách gần đây': 'Recent reading taste',
  'Bạn chưa có đơn hàng nào': 'You have no orders yet.',
  'Đang giao': 'Shipping',
  'Hoàn tất': 'Completed',
  'Màu:': 'Color:',
  'Màu gáy:': 'Spine color:',
  'Khắc:': 'Engraving:',
  'Thêm dây xích': 'Extra chain',
  'Có ảnh cover tải lên': 'Uploaded cover image',
  'Gu sách của bạn chọn gần đây': 'Your recently selected reading style',
  'Tính năng này sẽ cập nhật sau khi bạn mua sản phẩm đầu tiên': 'This section will update after your first purchase.',
  'Không thể hiển thị preview 3D trên trình duyệt này. Bạn vẫn có thể tùy chỉnh và thêm vào giỏ hàng.': '3D preview is not supported on this browser. You can still customize and add to cart.',
  'Không tìm thấy sản phẩm': 'Product not found',
  'Quay lại tủ sách': 'Back to shelf',
  'Không thể tải dashboard admin.': 'Unable to load admin dashboard.',
  'Đăng nhập thất bại.': 'Sign-in failed.',
  'Đang tải dữ liệu...': 'Loading data...',
  'Không có quyền truy cập': 'Access denied',
  'Tài khoản của bạn không có role ADMIN.': 'Your account does not have ADMIN role.',
  'Vui lòng đăng nhập tài khoản admin để truy cập.': 'Please sign in with an admin account to continue.',
  'Nơi tâm hồn vui hơn qua những con chữ': 'Where words make the soul lighter',
  'Tóm tắt nội dung sách': 'Book Summary',
  'Cho phép người dùng xem trước về nội dung sách trong trường hợp mua tặng hoặc mua vì bìa, mua theo gu.': 'Let users preview book content when buying as a gift, buying for cover design, or buying by personal taste.',
  'Xem tóm tắt nội dung sách': 'Browse book summaries',
  'Đọc thêm →': 'Read more ->',
  'Chưa có dữ liệu tóm tắt sách.': 'No book summaries available yet.',
  'Nhà văn Việt Nam nổi tiếng với các tác phẩm văn học thiếu nhi và tuổi mới lớn. Ông được mệnh danh là "nhà văn của tuổi thơ".': 'A famous Vietnamese writer known for works for children and teenagers. He is often called "the writer of childhood."',
  'Một trong những nhà văn tiêu biểu nhất của văn học hiện thực phê phán Việt Nam, với những tác phẩm sâu sắc về con người và xã hội.': 'One of the most representative authors of Vietnamese critical realism, with profound works about people and society.',
  'Đại thi hào dân tộc Việt Nam, tác giả của Truyện Kiều - kiệt tác văn học cổ điển Việt Nam.': 'The great national poet of Vietnam, author of The Tale of Kieu - a masterpiece of Vietnamese classical literature.',
  'Câu chuyện về chàng chăn cừu Santiago trong hành trình theo đuổi giấc mơ, vượt sa mạc Sahara để tìm kho báu tại Kim Tự Tháp Ai Cập.': 'The story of a shepherd boy, Santiago, pursuing his dream across the Sahara Desert to find treasure near the Egyptian pyramids.',
  'Những nguyên tắc cơ bản trong giao tiếp và cách đối nhân xử thế để chinh phục lòng người.': 'Fundamental principles of communication and human relations for winning trust and connection.',
  'Câu chuyện tuổi thơ trong sáng về tình bạn, tình anh em và cuộc sống làng quê miền Trung.': 'An innocent childhood story about friendship, sibling love, and village life in Central Vietnam.',
  'Hành trình ngược dòng thời gian trở về tuổi thơ với những kỷ niệm đẹp đẽ và hồn nhiên.': 'A journey back to childhood filled with beautiful and pure memories.',
};

const REGEX_TRANSLATIONS = [
  {
    pattern: /^Đã thêm (\d+) sản phẩm vào giỏ hàng!$/,
    replacement: 'Added $1 items to cart!',
  },
  {
    pattern: /^(\d+) sản phẩm$/,
    replacement: '$1 items',
  },
  {
    pattern: /^Charm đã customize: (\d+)\/(\d+)$/,
    replacement: 'Customized charms: $1/$2',
  },
  {
    pattern: /^Mã đơn hàng:$/,
    replacement: 'Order code:',
  },
];

const LanguageContext = createContext(null);

function applyInterpolation(text, variables) {
  if (!variables) return text;
  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    text
  );
}

function translateByMap(original) {
  const core = (original || '').trim();
  if (!core) return original || '';

  if (DIRECT_TRANSLATIONS[core]) {
    return DIRECT_TRANSLATIONS[core];
  }

  for (const rule of REGEX_TRANSLATIONS) {
    if (rule.pattern.test(core)) {
      return core.replace(rule.pattern, rule.replacement);
    }
  }

  return original || '';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = window.localStorage.getItem(LANGUAGE_KEY);
    return stored === 'en' ? 'en' : 'vi';
  });

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    const t = (viText, enText, variables = null) => {
      const text = language === 'en' ? enText : viText;
      return applyInterpolation(text, variables);
    };

    const formatCurrency = (valueNumber) => {
      const locale = language === 'en' ? 'en-US' : 'vi-VN';
      const formatted = Number(valueNumber || 0).toLocaleString(locale);
      return language === 'en' ? `${formatted} VND` : `${formatted}đ`;
    };

    return {
      language,
      setLanguage,
      t,
      translateText: (text) => (language === 'en' ? translateByMap(text) : text),
      formatCurrency,
      locale: language === 'en' ? 'en-US' : 'vi-VN',
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return ctx;
}
