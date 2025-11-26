import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, CreditCard, Wallet } from 'lucide-react';
import type { CartItem } from '../../App';

interface CheckoutViewProps {
  cart: CartItem[];
  onBack: () => void;
  onComplete: () => void;
}

export function CheckoutView({ cart, onBack, onComplete }: CheckoutViewProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'momo'>('cash');
  const [note, setNote] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 15000;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    alert('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
    onComplete();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-gray-800 flex-1">Thanh toán</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-800 mb-1">Địa chỉ giao hàng</h3>
              <p className="text-gray-600 mb-1">Nguyễn Văn A</p>
              <p className="text-gray-500">123 Nguyễn Huệ, Quận 1, TP.HCM</p>
            </div>
            <button className="text-orange-600">Sửa</button>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">0901234567</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <h3 className="text-gray-800 mb-3">Đơn hàng ({cart.length} sản phẩm)</h3>
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div className="flex-1">
                  <p className="text-gray-800 mb-1">
                    {item.quantity}x {item.name}
                  </p>
                  <p className="text-gray-500">Size {item.size}</p>
                </div>
                <span className="text-gray-800">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <h3 className="text-gray-800 mb-3">Phương thức thanh toán</h3>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                paymentMethod === 'cash'
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Wallet className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-orange-600' : 'text-gray-400'}`} />
              <span className={paymentMethod === 'cash' ? 'text-orange-600' : 'text-gray-600'}>
                Tiền mặt
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                paymentMethod === 'card'
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-orange-600' : 'text-gray-400'}`} />
              <span className={paymentMethod === 'card' ? 'text-orange-600' : 'text-gray-600'}>
                Thẻ ATM/Visa
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod('momo')}
              className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                paymentMethod === 'momo'
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="w-5 h-5">💳</div>
              <span className={paymentMethod === 'momo' ? 'text-orange-600' : 'text-gray-600'}>
                Ví MoMo
              </span>
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <h3 className="text-gray-800 mb-3">Ghi chú</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú cho người bán..."
            className="w-full p-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={3}
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí giao hàng</span>
              <span>{deliveryFee.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between">
              <span className="text-gray-800">Tổng cộng</span>
              <span className="text-orange-600">{total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-6">
        <button
          onClick={handlePlaceOrder}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl active:scale-95 transition-transform"
        >
          Đặt hàng • {total.toLocaleString('vi-VN')}đ
        </button>
      </div>
    </div>
  );
}
