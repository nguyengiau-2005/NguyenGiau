// utils/format.ts

/**
 * 1. Định dạng số tiêu chuẩn (Dùng cho số lượng, điểm thưởng)
 * Ví dụ: 1.000, 50.000, 1.200.000
 */
export const formatCurrency = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(value)) return '0';

  // Định dạng số có dấu chấm phân cách hàng nghìn theo chuẩn Việt Nam
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * 2. Định dạng đầy đủ chuẩn LUXE (Dùng cho giá sản phẩm chính)
 * Cơ chế: Lấy số gốc, thêm phân cách hàng nghìn và nối đuôi .000đ
 * Ví dụ: Input 500 -> Output "500.000đ"
 * Input 1.500 -> Output "1.500.000đ"
 */
export const formatCurrencyFull = (amount: number | string): string => {
  // Chuyển đổi về kiểu số để đảm bảo an toàn dữ liệu
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Xử lý khi giá trị bằng 0 hoặc không phải là số
  if (isNaN(value) || value === 0) return '0.000đ';

  // Định dạng phần số nguyên có dấu chấm phân cách (VD: 1.500)
  const formatted = new Intl.NumberFormat('vi-VN').format(value);

  // Trả về chuỗi kết hợp đuôi .000đ để tạo cảm giác sang trọng
  return `${formatted}.000đ`;
};