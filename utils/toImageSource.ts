/**
 * Chuyển đổi các định dạng dữ liệu hình ảnh từ API (Baserow) 
 * sang nguồn (source) phù hợp cho component Image của React Native.
 */
export default function toimageSource(input: any): { uri: string } | any | undefined {
  if (!input) return undefined;

  // 1. Nếu là require(path) cho ảnh local (kiểu number)
  if (typeof input === 'number') return input;

  // 2. Nếu là chuỗi URL trực tiếp
  if (typeof input === 'string') {
    if (input.startsWith('http')) {
      return { uri: input };
    }
    return undefined;
  }

  // 3. Nếu là mảng (Baserow luôn trả về mảng cho trường File/Image)
  if (Array.isArray(input)) {
    if (input.length === 0) return undefined;
    // Đệ quy để lấy phần tử đầu tiên
    return toimageSource(input[0]);
  }

  // 4. Nếu là Object (Chi tiết file từ Baserow)
  if (typeof input === 'object') {
    // Trường hợp: { url: "...", thumbnails: {...} }
    if (input.url) return { uri: input.url };

    // Trường hợp lấy từ Thumbnails để tối ưu tốc độ tải (Luxe style)
    if (input.thumbnails) {
      const { card_cover, small, tiny } = input.thumbnails;
      const bestThumb = card_cover || small || tiny;
      if (bestThumb?.url) return { uri: bestThumb.url };
    }

    // Trường hợp lồng nhau khác (nếu có)
    if (input.download_url) return { uri: input.download_url };
  }

  return undefined;
}