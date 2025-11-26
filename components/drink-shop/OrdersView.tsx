import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

interface OrdersViewProps {
  onBack: () => void;
}

export function OrdersView({ onBack }: OrdersViewProps) {
  const orders = [
    {
      id: 'DH001234',
      date: '26/11/2025 14:30',
      status: 'delivered',
      statusText: 'Đã giao',
      items: 3,
      total: 125000,
      products: ['Cà phê đen đá x2', 'Trà sữa trân châu x1']
    },
    {
      id: 'DH001233',
      date: '25/11/2025 10:15',
      status: 'delivering',
      statusText: 'Đang giao',
      items: 2,
      total: 67000,
      products: ['Sinh tố dâu x1', 'Nước ép cam x1']
    },
    {
      id: 'DH001232',
      date: '24/11/2025 16:45',
      status: 'preparing',
      statusText: 'Đang chuẩn bị',
      items: 1,
      total: 42000,
      products: ['Milkshake socola x1']
    },
    {
      id: 'DH001231',
      date: '23/11/2025 09:20',
      status: 'cancelled',
      statusText: 'Đã hủy',
      items: 2,
      total: 64000,
      products: ['Trà đào cam sả x2']
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'delivering':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'preparing':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'delivering':
        return 'text-blue-600 bg-blue-50';
      case 'preparing':
        return 'text-orange-600 bg-orange-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-gray-800 flex-1">Đơn hàng của tôi</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-6 py-3 border-b border-gray-200 flex gap-2 overflow-x-auto">
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg flex-shrink-0">
          Tất cả
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex-shrink-0">
          Đang giao
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex-shrink-0">
          Hoàn thành
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex-shrink-0">
          Đã hủy
        </button>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.statusText}
                  </span>
                </div>
                <span className="text-gray-500">{order.date}</span>
              </div>

              <div className="mb-3">
                <div className="text-gray-800 mb-1">Mã đơn: {order.id}</div>
                <div className="text-gray-600">
                  {order.products.join(', ')}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <span className="text-gray-600">{order.items} sản phẩm • </span>
                  <span className="text-orange-600">{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex gap-2">
                  {order.status === 'delivered' && (
                    <button className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg">
                      Mua lại
                    </button>
                  )}
                  {order.status === 'delivering' && (
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
                      Theo dõi
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
