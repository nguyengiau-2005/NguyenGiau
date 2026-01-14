type Session = {
  phone: string;
  otp: string;
  createdAt: number;
  used?: boolean;
  password?: string;
};

// Biến này lưu trữ các phiên làm việc trong bộ nhớ tạm (RAM)
const sessions = new Map<string, Session>();

// scripts/mock-auth.ts
export const sendOtp = async (phone: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 1. Tạo mã OTP ngẫu nhiên 6 số
  const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 2. Tạo Session ID
  const sessionId = "session_" + Date.now();

  // 3. QUAN TRỌNG: Phải lưu vào Map 'sessions' thì các hàm sau mới tìm thấy
  sessions.set(sessionId, {
    phone: phone,
    otp: mockOtp,
    createdAt: Date.now(),
    used: false
  });

  console.log(`[mock-auth] OTP Created: ${mockOtp} for Session: ${sessionId}`);

  return {
    success: true,
    sessionId: sessionId,
    code: mockOtp 
  };
};

export async function verifyOtp(sessionId: string, code: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 400));
  
  const s = sessions.get(sessionId);
  
  if (!s) {
    console.error(`[mock-auth] Verify failed: Session ${sessionId} not found`);
    throw new Error('Session not found');
  }
  
  if (s.used) throw new Error('OTP already used');
  
  const expired = Date.now() - s.createdAt > 15 * 60 * 1000; // 15 phút
  if (expired) throw new Error('OTP expired');
  
  // Kiểm tra mã khớp hay không
  return s.otp === code;
}

export async function resetPassword(sessionId: string, newPassword: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  
  const s = sessions.get(sessionId);
  
  if (!s) {
    console.error(`[mock-auth] Reset failed: Session ${sessionId} not found`);
    throw new Error('Session not found');
  }

  // Cập nhật mật khẩu giả lập
  s.password = newPassword;
  s.used = true; // Đánh dấu đã dùng để không dùng lại OTP này được nữa
  
  sessions.set(sessionId, s);
  
  console.log(`[mock-auth] resetPassword THÀNH CÔNG -> phone=${s.phone} newPassword=${newPassword}`);
}

export function _getSession(sessionId: string) {
  return sessions.get(sessionId);
}