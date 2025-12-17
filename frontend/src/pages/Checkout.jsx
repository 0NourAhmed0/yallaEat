import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getCart, clearCart } from '../utils/cart';
import StripePaymentForm from '../components/StripePaymentForm';
import '../styles/CreateOrder.css';

// Read Stripe publishable key from Vite env (must start with pk_test_ or pk_live_)
// Set VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env and restart dev server
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!STRIPE_PK) {
  // Do not throw; allow app to render and show guidance in payment step
  // eslint-disable-next-line no-console
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe payment form will be disabled.');
}
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const CreateOrder = () => {
  const navigate = useNavigate();
  const cartItems = getCart();

  const [formData, setFormData] = useState({
    items: cartItems.map(item => ({ menuItem: item.id, quantity: item.qty })),
    paymentMethod: 'Cash',
    isDelivery: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' or 'payment'
  const [stripePaymentId, setStripePaymentId] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      console.log('Form data updated:', updated); // Debug log
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Submitting order with paymentMethod:', formData.paymentMethod); // Debug log

    try {
      // If payment method is Stripe, create payment intent first
      if (formData.paymentMethod === 'Stripe') {
        // First create order in pending payment status
        const orderResponse = await axios.post(
          'http://localhost:3000/api/orders',
          formData,
          { withCredentials: true }
        );

        if (orderResponse.data.success) {
          const orderId = orderResponse.data.order._id;
          setStripePaymentId(orderId);
          
          // Create payment intent
          const paymentResponse = await axios.post(
            'http://localhost:3000/api/payments/create-payment-intent',
            { orderId },
            { withCredentials: true }
          );
          
          if (paymentResponse.data.clientSecret) {
            setClientSecret(paymentResponse.data.clientSecret);
            if (paymentResponse.data.paymentIntentId) {
              setPaymentIntentId(paymentResponse.data.paymentIntentId);
              console.info('Stripe PaymentIntent ID:', paymentResponse.data.paymentIntentId);
            }
            setPaymentStep('payment');
          }
          setLoading(false);
          return;
        }
      } else {
        // For Cash, Credit Card, Debit Card - create order directly
        const response = await axios.post(
          'http://localhost:3000/api/orders',
          formData,
          { withCredentials: true }
        );

        if (response.data.success) {
          clearCart();
          alert(`Order placed successfully! Order Number: ${response.data.order.orderNumber}`);
          navigate('/orders');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      console.error('Order creation error:', err);
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create payment intent with the order ID
      const paymentResponse = await axios.post(
        'http://localhost:3000/api/payments/create-payment-intent',
        { orderId: stripePaymentId },
        { withCredentials: true }
      );

      if (paymentResponse.data.clientSecret) {
        setClientSecret(paymentResponse.data.clientSecret);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment. Please try again or use a different payment method.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    clearCart();
    alert('Payment successful! Your order has been confirmed.');
    navigate('/orders');
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  const handlePaymentCancel = () => {
    setPaymentStep('form');
    setClientSecret('');
    setStripePaymentId(null);
  };

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="order-container">
          <div className="order-card">
            <h2>Your Cart is Empty</h2>
            <p className="order-subtitle">Add items from the menu to proceed with checkout.</p>
            <button 
              className="order-btn" 
              onClick={() => navigate('/menu')}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Payment step for Stripe
  if (paymentStep === 'payment' && clientSecret) {
    return (
      <div className="page">
        <div className="order-container">
          <div className="order-card">
            <h2>Complete Your Payment</h2>
            <p className="order-subtitle">Order ID: {stripePaymentId}</p>

            {error && <div className="error-message">{error}</div>}

            {!stripePromise ? (
              <div className="error-message">
                Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env
                and restart the dev server.
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <div className="payment-info" style={{ marginBottom: 12 }}>
                  <p><strong>Publishable Key:</strong> {STRIPE_PK ? (STRIPE_PK.slice(0, 12) + '…') : 'not set'}</p>
                </div>
                {paymentIntentId && (
                  <div className="payment-info" style={{ marginBottom: 12 }}>
                    <p><strong>PaymentIntent:</strong> {paymentIntentId}</p>
                  </div>
                )}
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                  amount={total}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Form step
  return (
    <div className="page">
      <div className="order-container">
        <div className="order-card">
          <h2>Review Your Order</h2>
          <p className="order-subtitle">Please review your items and select payment method</p>

          {/* Order Items Summary */}
          <div className="order-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="order-item-row">
                <div className="order-item-info">
                  <h4>{item.name}</h4>
                  <p className="order-item-category">{item.category}</p>
                </div>
                <div className="order-item-price-qty">
                  <span className="qty-badge">{item.qty}x</span>
                  <span className="item-price">${item.price?.toFixed(2)}</span>
                  <span className="item-total">${(item.price * item.qty)?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="Cash">Cash on Delivery</option>
                <option value="Stripe">Stripe (Secure Online Payment)</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDelivery"
                  checked={formData.isDelivery}
                  onChange={handleChange}
                />
                <span>Request Delivery</span>
              </label>
            </div>

            <div className="order-total">
              <span>Total:</span>
              <span className="total-price">${total.toFixed(2)}</span>
            </div>

            <button 
              type="submit" 
              className="order-btn" 
              disabled={loading}
            >
              {loading ? 'Processing...' : formData.paymentMethod === 'Stripe' ? 'Proceed to Payment' : 'Place Order'}
            </button>
          </form>

          <div className="back-link">
            <a onClick={() => navigate('/cart')}>← Back to Cart</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;