import { useState, useEffect } from 'react';
import { Package, Eye, X, CheckCircle, Truck, XCircle, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  book_title: string;
  book_author: string;
  book_price: number;
  shipping_cost: number;
  total_amount: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_whatsapp: string;
  shipping_address: string;
  shipping_pincode: string;
  shipping_state: string;
  is_tamil_nadu: boolean;
  order_status: string;
  payment_status: string;
  payment_screenshot_url: string | null;
  admin_notes: string | null;
  tracking_carrier: string | null;
  tracking_id: string | null;
  created_at: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const updateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    const updates: Record<string, string> = { order_status: orderStatus };
    if (paymentStatus) updates.payment_status = paymentStatus;

    await supabase.from('orders').update(updates).eq('id', orderId);
    loadOrders();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, ...updates });
    }
  };

  const handleMarkShipped = (orderId: string) => {
    setShippingOrderId(orderId);
    setTrackingCarrier('');
    setTrackingIdInput('');
    setShowShippingModal(true);
  };

  const confirmShipped = async () => {
    if (!shippingOrderId) return;
    const updates = {
      order_status: 'shipped',
      tracking_carrier: trackingCarrier.trim(),
      tracking_id: trackingIdInput.trim(),
    };
    await supabase.from('orders').update(updates).eq('id', shippingOrderId);
    loadOrders();
    if (selectedOrder?.id === shippingOrderId) {
      setSelectedOrder({ ...selectedOrder, ...updates });
    }
    setShowShippingModal(false);
    setShippingOrderId(null);
  };

  const updateAdminNotes = async (orderId: string, notes: string) => {
    await supabase.from('orders').update({ admin_notes: notes }).eq('id', orderId);
    loadOrders();
  };

  const buildShareText = (order: Order) => {
    const lines = [
      `Order Details - ${order.order_number}`,
      ``,
      `Book: ${order.book_title}`,
      `Author: ${order.book_author}`,
      `Price: ₹${order.book_price.toFixed(2)}`,
      `Shipping: ₹${order.shipping_cost.toFixed(2)}`,
      `Total: ₹${order.total_amount.toFixed(2)}`,
      ``,
      `Customer: ${order.customer_name}`,
      `Phone: ${order.customer_phone}`,
      `Address: ${order.shipping_address}, ${order.shipping_pincode}, ${order.shipping_state}`,
    ];
    if (order.tracking_carrier || order.tracking_id) {
      lines.push(``);
      lines.push(`Shipping Carrier: ${order.tracking_carrier || 'N/A'}`);
      lines.push(`Tracking ID: ${order.tracking_id || 'N/A'}`);
    }
    lines.push(``);
    lines.push(`Status: ${order.order_status}`);
    return lines.join('\n');
  };

  const handleShare = async (order: Order) => {
    const text = buildShareText(order);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Order ${order.order_number}`, text });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(text);
    alert('Order details copied to clipboard!');
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.order_status === statusFilter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      shipped: 'bg-sky-100 text-sky-800',
      delivered: 'bg-green-200 text-green-900',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Order Management</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Order #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Book</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{order.customer_name}</div>
                    <div className="text-xs text-slate-500">{order.customer_whatsapp}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{order.book_title}</div>
                    <div className="text-xs text-slate-500">{order.book_author}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    ₹{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-500 hover:text-blue-700 p-2"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Order Details</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShare(selectedOrder)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                >
                  <Share2 className="h-4 w-4" />
                  Share Details
                </button>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Order Number:</span> {selectedOrder.order_number}</div>
                    <div><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                    <div><span className="font-medium">Book:</span> {selectedOrder.book_title}</div>
                    <div><span className="font-medium">Author:</span> {selectedOrder.book_author}</div>
                    <div><span className="font-medium">Book Price:</span> ₹{selectedOrder.book_price.toFixed(2)}</div>
                    <div><span className="font-medium">Shipping:</span> ₹{selectedOrder.shipping_cost.toFixed(2)}</div>
                    <div><span className="font-medium text-lg">Total:</span> <span className="text-lg font-bold">₹{selectedOrder.total_amount.toFixed(2)}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedOrder.customer_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.customer_email || 'N/A'}</div>
                    <div><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</div>
                    <div>
                      <span className="font-medium">WhatsApp:</span>{' '}
                      <a
                        href={`https://wa.me/${selectedOrder.customer_whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        {selectedOrder.customer_whatsapp}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Shipping Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Address:</span> {selectedOrder.shipping_address}</div>
                    <div><span className="font-medium">Pincode:</span> {selectedOrder.shipping_pincode}</div>
                    <div><span className="font-medium">State:</span> {selectedOrder.shipping_state}</div>
                    <div><span className="font-medium">Location:</span> {selectedOrder.is_tamil_nadu ? 'Tamil Nadu' : 'Other State'}</div>
                  </div>
                </div>

                {(selectedOrder.tracking_carrier || selectedOrder.tracking_id) && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Tracking Information</h3>
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-2 text-sm">
                      <div><span className="font-medium">Carrier:</span> {selectedOrder.tracking_carrier || 'N/A'}</div>
                      <div><span className="font-medium">Tracking ID:</span> {selectedOrder.tracking_id || 'N/A'}</div>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Status Management</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed', 'completed')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirm Order</span>
                    </button>
                    <button
                      onClick={() => handleMarkShipped(selectedOrder.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Mark as Shipped</span>
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Package className="h-4 w-4" />
                      <span>Mark as Delivered</span>
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancel Order</span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Admin Notes</h3>
                  <textarea
                    value={selectedOrder.admin_notes || ''}
                    onChange={(e) => {
                      setSelectedOrder({ ...selectedOrder, admin_notes: e.target.value });
                      updateAdminNotes(selectedOrder.id, e.target.value);
                    }}
                    rows={3}
                    placeholder="Add notes about this order..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Enter Tracking Details</h3>
              <button
                onClick={() => setShowShippingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carrier Name</label>
                <input
                  type="text"
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  placeholder="e.g. India Post, Delhivery, DTDC"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tracking ID</label>
                <input
                  type="text"
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  placeholder="e.g. EE123456789IN"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowShippingModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmShipped}
                disabled={!trackingCarrier.trim() || !trackingIdInput.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Truck className="h-4 w-4" />
                Confirm Shipped
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
