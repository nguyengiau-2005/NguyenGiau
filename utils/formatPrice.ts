/**
 * Format giá tiền với đầy đủ đơn vị hàng chục, hàng trăm, hàng nghìn
 * @param price - Giá tiền (dạng number hoặc string)
 * @returns Chuỗi giá được format (VD: "50.000đ", "150.000đ", "1.500.000đ")
 */
export const formatPrice = (price: number | string): string => {
  let numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice) || numPrice < 0) {
    return '0đ';
  }
  
  // Nếu giá nhỏ hơn 1000, thêm ".000" để hiển thị đầy đủ
  if (numPrice < 1000) {
    return `${numPrice}.000đ`;
  }
  
  // Nếu giá >= 1000, dùng toLocaleString để thêm dấu chấm
  return `${numPrice.toLocaleString('vi-VN')}đ`;
};

/**
 * Format giá cho hiển thị (thường là giá từ API)
 * Baserow thường trả về giá dạng "50", "150", "1500" (tính theo đơn vị nghìn)
 * Hàm này sẽ convert thành "50.000đ", "150.000đ", "1.500.000đ"
 */
export const formatPriceFromAPI = (price: number | string): string => {
  let numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice) || numPrice < 0) {
    return '0đ';
  }
  
  // API trả về số hàng trăm ngàn (VD: 50 = 50.000đ)
  // Nhân với 1000 nếu cần, hoặc trực tiếp format
  const fullPrice = numPrice * 1000;
  
  return `${fullPrice.toLocaleString('vi-VN')}đ`;
};

/**
 * Format giá trị tiền (cho tính toán tổng cộng)
 * Dùng toLocaleString để thêm dấu phân cách hàng nghìn
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};
