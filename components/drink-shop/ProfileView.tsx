import { User, MapPin, Heart, Receipt, Bell, HelpCircle, Settings, LogOut, ChevronRight } from 'lucide-react';
import type { Screen } from '../../App';

interface ProfileViewProps {
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
}

export function ProfileView({ onLogout, onNavigate }: ProfileViewProps) {
  const menuItems = [
    { icon: Receipt, label: 'Đơn hàng của tôi', description: 'Xem lịch sử đơn hàng', action: () => onNavigate('orders') },
    { icon: MapPin, label: 'Địa chỉ giao hàng', description: 'Quản lý địa chỉ nhận hàng' },
    { icon: Heart, label: 'Sản phẩm yêu thích', description: 'Danh sách yêu thích của bạn' },
    { icon: Bell, label: 'Thông báo', description: 'Cài đặt thông báo' },
    { icon: HelpCircle, label: 'Trợ giúp', description: 'Hỗ trợ & câu hỏi' },
    { icon: Settings, label: 'Cài đặt', description: 'Cài đặt tài khoản' },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-white mb-1">Nguyễn Văn A</h2>
            <p className="text-orange-100">nguyenvana@email.com</p>
            <p className="text-orange-100">0901234567</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
            <div className="text-white mb-1">12</div>
            <div className="text-orange-100">Đơn hàng</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
            <div className="text-white mb-1">850</div>
            <div className="text-orange-100">Điểm</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
            <div className="text-white mb-1">5</div>
            <div className="text-orange-100">Voucher</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-6 space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className="w-full p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-4 active:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-800 mb-1">{item.label}</div>
                <div className="text-gray-500">{item.description}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-6 pb-6">
        <button
          onClick={onLogout}
          className="w-full p-4 bg-white rounded-2xl border-2 border-red-200 text-red-500 flex items-center justify-center gap-2 active:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
