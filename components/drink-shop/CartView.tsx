import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { CartItem, Screen } from '../../App';

interface CartViewProps {
  cart: CartItem[];
  onUpdateItem: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onNavigate: (screen: Screen) => void;
}

export function CartView({ cart, onUpdateItem, onRemoveItem, onNavigate }: CartViewProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 15000;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
        <h3 className="text-gray-800 mb-2">Giỏ hàng trống</h3>
        <p className="text-gray-500 text-center mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl"
        >
          Xem sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h2 className="text-gray-800">Giỏ hàng của bạn</h2>
        <p className="text-gray-500">{cart.length} sản phẩm</p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {cart.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-3 mb-3">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-gray-800 mb-1">{item.name}</h4>
                  <p className="text-gray-500 mb-2">
                    Size {item.size} • Đá {item.ice}% • Đường {item.sugar}%
                  </p>
                  <p className="text-orange-600">{item.price.toLocaleString('vi-VN')}đ</p>
                </div>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onUpdateItem(index, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-gray-800 min-w-[30px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateItem(index, item.quantity + 1)}
                    className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <span className="text-gray-800">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Voucher */}
        <div className="mt-4 bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Mã giảm giá</span>
            <button className="text-orange-600">Chọn voucher</button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 bg-white rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Phí giao hàng</span>
            <span>{deliveryFee.toLocaleString('vi-VN')}đ</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá</span>
              <span>-{discount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="text-gray-800">Tổng cộng</span>
            <span className="text-orange-600">{total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-6">
        <button
          onClick={() => onNavigate('checkout')}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl active:scale-95 transition-transform"
        >
          Thanh toán • {total.toLocaleString('vi-VN')}đ
        </button>
      </div>
    </div>
  );
}
