import { useState, CSSProperties } from 'react';
import { Eye, EyeOff, Coffee } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((isLogin && email && password) || (!isLogin && email && password && name)) {
      onLogin();
    }
  };

  // ==== STYLE OBJECTS ====
  const screenStyle: CSSProperties = {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    background: 'linear-gradient(to bottom right, #fbc2eb, #fda085)',
    fontFamily: 'sans-serif',
  };

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: '450px', // tăng max width
  };

  const logoStyle: CSSProperties = { textAlign: 'center', marginBottom: '3rem' };
  const logoCircleStyle: CSSProperties = {
    width: 120,  // tăng size logo
    height: 120,
    background: 'white',
    borderRadius: '50%',
    margin: '0 auto 2rem', // tăng margin bottom
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
  };
  const logoIconStyle: CSSProperties = { width: 64, height: 64, color: '#f687b3' }; // tăng icon

  const logoTitleStyle: CSSProperties = { color: '#d53f8c', fontSize: 36, fontWeight: 'bold', marginBottom: 12 };
  const logoSubtitleStyle: CSSProperties = { color: '#fbb6ce', fontSize: 16 };

  const formContainerStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '2.5rem',
    padding: '2.5rem', // tăng padding
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
  };

  const tabsStyle: CSSProperties = {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    background: '#fff0f6',
    borderRadius: '1rem',
    padding: 4,
  };

  const tabButtonStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    padding: 12,
    borderRadius: '1rem',
    fontWeight: 500,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    background: active ? '#f687b3' : 'transparent',
    color: active ? 'white' : '#f687b3',
    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : undefined,
    transition: 'all 0.2s',
  });

  const formGroupStyle: CSSProperties = { marginBottom: 16 };
  const labelStyle: CSSProperties = { display: 'block', fontWeight: 500, color: '#d53f8c', marginBottom: 4 };
  const inputStyle: CSSProperties = {
    width: '100%',
    padding: 16, // tăng padding
    borderRadius: '1.25rem',
    border: 'none',
    background: '#fff0f6',
    color: '#2d2d2d',
    fontSize: 16, // tăng font size
    outline: 'none',
  };
  const passwordWrapperStyle: CSSProperties = { position: 'relative' };
  const showPasswordBtnStyle: CSSProperties = {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#f687b3',
    cursor: 'pointer',
  };

  const forgotPasswordStyle: CSSProperties = { textAlign: 'right', marginBottom: 16 };
  const submitBtnStyle: CSSProperties = {
    width: '100%',
    padding: 18, // tăng padding
    borderRadius: '1.25rem',
    background: 'linear-gradient(to right, #f687b3, #ed64a6, #f6ad55)',
    color: 'white',
    fontWeight: 600,
    fontSize: 18, // tăng font size
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };

  const socialLoginStyle: CSSProperties = { marginTop: 24 };
  const dividerStyle: CSSProperties = { position: 'relative', textAlign: 'center', marginBottom: 24 };
  const dividerSpanStyle: CSSProperties = { position: 'relative', background: 'white', padding: '0 1rem', color: '#fbb6ce', fontSize: 14 };
  const dividerLineStyle: CSSProperties = { position: 'absolute', top: '50%', left: 0, width: '100%', borderTop: '1px solid #fbb6ce', transform: 'translateY(-50%)', zIndex: 0 };
  const socialButtonsStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 };
  const socialBtnStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12, // tăng khoảng cách icon/text
    padding: 14, // tăng padding
    borderRadius: '1.25rem',
    fontWeight: 500,
    border: '1px solid #fbb6ce',
    color: '#f687b3',
    fontSize: 16,
    cursor: 'pointer',
    transition: 'background 0.2s',
  };
  return (
    <div style={screenStyle}>
      <div style={containerStyle}>
        <div style={logoStyle}>
          <div style={logoCircleStyle}>
            <Coffee style={logoIconStyle} />
          </div>
          <h1 style={logoTitleStyle}>DrinkHub</h1>
          <p style={logoSubtitleStyle}>Đặt đồ uống yêu thích của bạn</p>
        </div>

        <div style={formContainerStyle}>
          <div style={tabsStyle}>
            <button style={tabButtonStyle(isLogin)} onClick={() => setIsLogin(true)}>Đăng nhập</button>
            <button style={tabButtonStyle(!isLogin)} onClick={() => setIsLogin(false)}>Đăng ký</button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={formGroupStyle}>
                <label style={labelStyle}>Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  style={inputStyle}
                />
              </div>
            )}

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email hoặc số điện thoại</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Mật khẩu</label>
              <div style={passwordWrapperStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  style={inputStyle}
                />
                <button type="button" style={showPasswordBtnStyle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div style={forgotPasswordStyle}>
                <button type="button" style={{ background: 'none', border: 'none', color: '#f687b3', cursor: 'pointer', fontSize: 14 }}>Quên mật khẩu?</button>
              </div>
            )}

            <button type="submit" style={submitBtnStyle}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
          </form>

          <div style={socialLoginStyle}>
            <div style={dividerStyle}>
              <div style={dividerLineStyle}></div>
              <span style={dividerSpanStyle}>hoặc tiếp tục với</span>
            </div>
            <div style={socialButtonsStyle}>
              <button style={socialBtnStyle} onClick={onLogin}>🔵 Facebook</button>
              <button style={socialBtnStyle} onClick={onLogin}>🔴 Google</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
