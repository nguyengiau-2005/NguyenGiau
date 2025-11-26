import { useState, CSSProperties } from 'react';
import { ArrowLeft, Star, Heart, Minus, Plus } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Product, CartItem } from '../../app/(tabs)/index';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export function ProductDetail({ product, onBack, onAddToCart, isFavorite, onToggleFavorite }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [ice, setIce] = useState(100);
  const [sugar, setSugar] = useState(100);
  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  const sizes = [
    { value: 'S' as const, label: 'Nhỏ', price: 0 },
    { value: 'M' as const, label: 'Vừa', price: 5000 },
    { value: 'L' as const, label: 'Lớn', price: 10000 },
  ];

  const iceOptions = [0, 50, 70, 100];
  const sugarOptions = [0, 50, 70, 100];

  const totalPrice = product.price + sizes.find(s => s.value === size)!.price;

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity, size, ice, sugar });
    alert('Đã thêm vào giỏ hàng!');
  };

  // ==== STYLE OBJECTS ====
  const wrapper: CSSProperties = { height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f4f6' };
  const imageWrapper: CSSProperties = { position: 'relative' };
  const iconBtn: CSSProperties = { position: 'absolute', width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', background: 'white' };
  const leftBtn: CSSProperties = { ...iconBtn, top: 16, left: 16 };
  const rightBtn: CSSProperties = { ...iconBtn, top: 16, right: 16 };
  const content: CSSProperties = { flex: 1, background: 'white', borderTopLeftRadius: 48, borderTopRightRadius: 48, marginTop: -24, padding: 24, overflowY: 'auto' };
  const section: CSSProperties = { marginBottom: 24 };
  const heading: CSSProperties = { fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 12 };
  const paragraph: CSSProperties = { color: '#4b5563', marginBottom: 12 };
  const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 16 };
  const starRow: CSSProperties = { display: 'flex', alignItems: 'center', gap: 4 };
  const optionBtn = (active: boolean, color?: string): CSSProperties => ({
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: active ? (color || '#f97316') : '#e5e7eb',
    background: active ? (color ? `${color}20` : '#fef3c7') : 'white',
    color: active ? (color || '#f97316') : '#4b5563',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    fontSize: 14,
    userSelect: 'none',
  });
  const quantityWrapper: CSSProperties = { display: 'flex', alignItems: 'center', gap: 16 };
  const quantityBtn = (bg: string, iconColor: string): CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: bg,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  });
  const footer: CSSProperties = { background: 'white', borderTop: '1px solid #e5e7eb', padding: 24 };
  const footerRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 };
  const addCartBtn: CSSProperties = { flex: 1, padding: 16, background: 'linear-gradient(to right, #f97316, #ef4444)', color: 'white', fontWeight: 600, borderRadius: 24, cursor: 'pointer', textAlign: 'center', transition: 'transform 0.1s' };
  const totalPriceStyle: CSSProperties = { color: '#f97316', fontWeight: 600, fontSize: 16 };

  return (
    <div style={wrapper}>
      {/* Image */}
      <div style={imageWrapper}>
        <ImageWithFallback src={product.image} alt={product.name} style={{ width: '100%', height: 256, objectFit: 'cover' }} />
        <div style={leftBtn} onClick={onBack}><ArrowLeft style={{ width: 20, height: 20, color: '#1f2937' }} /></div>
        <div style={rightBtn} onClick={() => onToggleFavorite(product.id)}>
          <Heart style={{ width: 20, height: 20, color: isFavorite ? '#ef4444' : '#1f2937', fill: isFavorite ? '#ef4444' : 'none' }} />
        </div>
      </div>

      {/* Content */}
      <div style={content}>
        {/* Product Info */}
        <div style={section}>
          <h2 style={{ ...heading, marginBottom: 8 }}>{product.name}</h2>
          <p style={paragraph}>{product.description}</p>
          <div style={row}>
            <div style={starRow}><Star style={{ width: 20, height: 20, color: '#facc15', fill: '#facc15' }} /> <span>{product.rating}</span></div>
            <div style={{ color: '#6b7280' }}>Đã bán {product.sold}</div>
          </div>
        </div>

        {/* Size */}
        <div style={section}>
          <h3 style={heading}>Chọn size</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {sizes.map(s => (
              <div key={s.value} style={optionBtn(size === s.value)} onClick={() => setSize(s.value)}>{s.label} {s.price > 0 && `+${s.price.toLocaleString('vi-VN')}đ`}</div>
            ))}
          </div>
        </div>

        {/* Ice */}
        <div style={section}>
          <h3 style={heading}>Lượng đá</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {iceOptions.map(level => (
              <div key={level} style={optionBtn(ice === level, '#3b82f6')} onClick={() => setIce(level)}>{level}%</div>
            ))}
          </div>
        </div>

        {/* Sugar */}
        <div style={section}>
          <h3 style={heading}>Lượng đường</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {sugarOptions.map(level => (
              <div key={level} style={optionBtn(sugar === level, '#f97316')} onClick={() => setSugar(level)}>{level}%</div>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div style={section}>
          <h3 style={heading}>Số lượng</h3>
          <div style={quantityWrapper}>
            <div style={quantityBtn('#e5e7eb', '#4b5563')} onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus style={{ width: 20, height: 20, color: '#4b5563' }} /></div>
            <span style={{ minWidth: 40, textAlign: 'center', color: '#1f2937' }}>{quantity}</span>
            <div style={quantityBtn('#ef4444', '#ffffff')} onClick={() => setQuantity(quantity + 1)}><Plus style={{ width: 20, height: 20, color: 'white' }} /></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={footer}>
        <div style={footerRow}>
          <div>
            <p style={{ color: '#6b7280', marginBottom: 4 }}>Tổng tiền</p>
            <p style={totalPriceStyle}>{(totalPrice * quantity).toLocaleString('vi-VN')}đ</p>
          </div>
          <div
            style={{ ...addCartBtn, transform: activeBtn === 'add' ? 'scale(0.95)' : 'scale(1)' }}
            onMouseDown={() => setActiveBtn('add')}
            onMouseUp={() => setActiveBtn(null)}
            onMouseLeave={() => setActiveBtn(null)}
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </div>
        </div>
      </div>
    </div>
  );
}
