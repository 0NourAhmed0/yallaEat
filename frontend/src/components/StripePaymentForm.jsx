import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/StripePayment.css';

const StripePaymentForm = ({ clientSecret, onSuccess, onError, onCancel, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        onError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f1f1f',
        fontFamily: 'inherit',
        '::placeholder': {
          color: '#999',
        },
      },
      invalid: {
        color: '#e74c3c',
      },
    },
  };

  return (
    <div className="stripe-payment-container">
      <div className="payment-header">
        <h3>Enter Card Details</h3>
        <p className="payment-amount">Amount: ${amount?.toFixed(2)}</p>
      </div>

      <div className="test-card-info">
        <p><strong>Test Card Numbers:</strong></p>
        <ul>
          <li>Success: 4242 4242 4242 4242</li>
          <li>Decline: 4000 0000 0000 0002</li>
          <li>Any future expiry date, any 3-digit CVC</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="stripe-form">
        <div className="card-element-wrapper">
          <label>Card Information</label>
          <CardElement options={cardElementOptions} />
        </div>

        {error && <div className="stripe-error">{error}</div>}

        <div className="stripe-buttons">
          <button 
            type="submit" 
            className="pay-btn" 
            disabled={!stripe || loading}
          >
            {loading ? 'Processing...' : `Pay $${amount?.toFixed(2)}`}
          </button>
          <button 
            type="button" 
            className="cancel-payment-btn" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripePaymentForm;
