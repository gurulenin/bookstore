import { useState, useEffect } from 'react';
import { X, CheckCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BookWithFormats } from '../lib/supabase';

interface CheckoutFlowProps {
  book: BookWithFormats;
  onClose: () => void;
}

interface SiteSettings {
  whatsapp_number: string | null;
  payment_qr_code_url: string | null;
  payment_instructions: string | null;
}

export default function CheckoutFlow({ book, onClose }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_whatsapp: '',
    shipping_address: '',
    shipping_pincode: '',
    shipping_state: '',
    is_tamil_nadu: false
  });

  const physicalFormat = book.formats.find(f => f.format_type === 'physical');
  const bookPrice = physicalFormat?.price || 0;
  const shippingCost = formData.is_tamil_nadu ? 50 : 100;
  const totalAmount = bookPrice + shippingCost;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('whatsapp_number, payment_qr_code_url, payment_instructions')
      .single();

    if (data) setSettings(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderData = {
      order_number: '',
      book_id: book.id,
      book_title: book.title,
      book_author: book.author,
      book_price: bookPrice,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || null,
      customer_phone: formData.customer_phone,
      customer_whatsapp: formData.customer_whatsapp,
      shipping_address: formData.shipping_address,
      shipping_pincode: formData.shipping_pincode,
      shipping_state: formData.shipping_state,
      is_tamil_nadu: formData.is_tamil_nadu,
      user_id: null,
      is_guest: true,
      order_status: 'pending',
      payment_status: 'pending'
    };

    const { data } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (data) {
      setStep(3);
    }
  };

  const generateWhatsAppMessage = () => {
    const message = `Hi, I have placed an order for "${book.title}" by ${book.author}. Order Total: Rs.${totalAmount.toFixed(2)}`;
    return encodeURIComponent(message);
  };

  const sendToWhatsApp = () => {
    if (settings?.whatsapp_number) {
      const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
      const message = generateWhatsAppMessage();
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    }
  };

  if (!physicalFormat) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <p className="text-center text-slate-700">This book is not available for purchase.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-slate-800 text-white py-3 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full my-4 sm:my-8">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {step === 1 && 'Shipping Details'}
            {step === 2 && 'Review Order'}
            {step === 3 && 'Payment'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-3 sm:space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">WhatsApp Number *</label>
                  <input
                    type="tel"
                    value={formData.customer_whatsapp}
                    onChange={(e) => setFormData({ ...formData, customer_whatsapp: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Shipping Address *</label>
                <textarea
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Pincode *</label>
                  <input
                    type="text"
                    value={formData.shipping_pincode}
                    onChange={(e) => setFormData({ ...formData, shipping_pincode: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.shipping_state}
                    onChange={(e) => {
                      const state = e.target.value;
                      setFormData({
                        ...formData,
                        shipping_state: state,
                        is_tamil_nadu: state.toLowerCase().includes('tamil nadu')
                      });
                    }}
                    required
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-slate-700 transition text-sm sm:text-base"
              >
                Continue to Review
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-50 rounded-lg p-4 sm:p-6 space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-sm sm:text-base">Order Summary</h3>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Book:</span>
                  <span className="font-medium text-right ml-2">{book.title}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Author:</span>
                  <span className="text-right ml-2">{book.author}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Price:</span>
                  <span>Rs.{bookPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Shipping ({formData.is_tamil_nadu ? 'TN' : 'Other'}):</span>
                  <span>Rs.{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2 sm:pt-3">
                  <span>Total:</span>
                  <span>Rs.{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base">Shipping Address</h3>
                <p className="text-slate-700 text-xs sm:text-sm">{formData.customer_name}</p>
                <p className="text-slate-700 text-xs sm:text-sm">{formData.customer_phone}</p>
                <p className="text-slate-700 mt-1.5 sm:mt-2 text-xs sm:text-sm">{formData.shipping_address}</p>
                <p className="text-slate-700 text-xs sm:text-sm">{formData.shipping_state} - {formData.shipping_pincode}</p>
              </div>

              <div className="flex space-x-3 sm:space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 sm:py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition text-sm sm:text-base"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-slate-800 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-slate-700 transition text-sm sm:text-base"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 sm:space-y-6 text-center">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Order Placed Successfully!</h3>

              <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-sm sm:text-base">Complete Your Payment</h4>
                {settings?.payment_instructions && (
                  <p className="text-slate-700 mb-3 sm:mb-4 text-xs sm:text-sm">{settings.payment_instructions}</p>
                )}

                {settings?.payment_qr_code_url && (
                  <div className="my-4 sm:my-6">
                    <img
                      src={settings.payment_qr_code_url}
                      alt="Payment QR Code"
                      className="w-48 h-48 sm:w-64 sm:h-64 mx-auto border rounded-lg"
                    />
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                  Total Amount: <span className="font-bold text-base sm:text-lg">Rs.{totalAmount.toFixed(2)}</span>
                </p>
              </div>

              <button
                onClick={sendToWhatsApp}
                className="w-full bg-green-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Send Order Details via WhatsApp</span>
              </button>

              <p className="text-xs sm:text-sm text-slate-600">
                After making the payment, please share the payment proof via WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
