type Session = {
  phone: string;
  otp: string;
  createdAt: number;
  used?: boolean;
  password?: string;
};

const sessions = new Map<string, Session>();

function generateSessionId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function sendOtp(phone: string): Promise<{ sessionId: string; otp: string }> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 600));
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionId = generateSessionId();
  sessions.set(sessionId, { phone, otp, createdAt: Date.now() });
  // Log OTP server-side (for developer testing) instead of exposing it to client
  // In production, you would call an SMS provider here.
  // eslint-disable-next-line no-console
  console.log(`[mock-auth] sendOtp -> phone=${phone} otp=${otp} session=${sessionId}`);
  return { sessionId, otp };
}

export async function verifyOtp(sessionId: string, code: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 400));
  const s = sessions.get(sessionId);
  if (!s) throw new Error('Session not found');
  if (s.used) throw new Error('OTP already used');
  const expired = Date.now() - s.createdAt > 15 * 60 * 1000; // 15 minutes
  if (expired) throw new Error('OTP expired');
  return s.otp === code;
}

export async function resetPassword(sessionId: string, newPassword: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  const s = sessions.get(sessionId);
  if (!s) throw new Error('Session not found');
  s.password = newPassword;
  s.used = true;
  sessions.set(sessionId, s);
  // eslint-disable-next-line no-console
  console.log(`[mock-auth] resetPassword -> phone=${s.phone} session=${sessionId} newPassword=${newPassword}`);
}

// Utility for debugging in dev
export function _getSession(sessionId: string) {
  return sessions.get(sessionId);
}
