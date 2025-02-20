import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';


const Payment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    currency: 'usd',
    insuranceOption: 'none',
    rentalDuration: 'daily'
  });

  const calculateTotal = (amount, insuranceOption, rentalDuration) => {
    let total = amount;
    
    // Apply insurance cost
    switch (insuranceOption) {
      case 'basic':
        total += amount * 0.1;
        break;
      case 'premium':
        total += amount * 0.2;
        break;
      default:
        break;
    }

    // Apply rental duration discount
    switch (rentalDuration) {
      case 'weekly':
        total *= 0.9;
        break;
      case 'monthly':
        total *= 0.8;
        break;
      default:
        break;
    }

    return total;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    const totalAmount = calculateTotal(
      paymentDetails.amount,
      paymentDetails.insuranceOption,
      paymentDetails.rentalDuration
    ) * 100;

    try {
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: paymentDetails.currency
        }),
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Payment successful!');
        navigate('/confirmation');
      }
    } catch (error) {
      console.error("Payment error: ", error);
      toast.error('Payment failed');
    }
  };

  return (
    <div className="payment-container">
      <h2>Payment Information</h2>
      <form onSubmit={handlePayment}>
        <div>
          <label>Insurance Option:</label>
          <select
            value={paymentDetails.insuranceOption}
            onChange={(e) => setPaymentDetails({
              ...paymentDetails,
              insuranceOption: e.target.value
            })}
          >
            <option value="none">No Insurance</option>
            <option value="basic">Basic Insurance</option>
            <option value="premium">Premium Insurance</option>
          </select>
        </div>

        <div>
          <label>Rental Duration:</label>
          <select
            value={paymentDetails.rentalDuration}
            onChange={(e) => setPaymentDetails({
              ...paymentDetails,
              rentalDuration: e.target.value
            })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label>Card Details:</label>
          <CardElement />
        </div>

        <div className="payment-summary">
          <h4>Payment Details:</h4>
          <p>Base Amount: ${paymentDetails.amount}</p>
          <p>Insurance: {paymentDetails.insuranceOption !== 'none' ? paymentDetails.insuranceOption : 'None'}</p>
          <p>Rental Duration: {paymentDetails.rentalDuration}</p>
          <h4>Total Amount: ${calculateTotal(
            paymentDetails.amount,
            paymentDetails.insuranceOption,
            paymentDetails.rentalDuration
          ).toFixed(2)}</h4>
        </div>

        <button type="submit" disabled={!stripe}>
          Pay Now
        </button>
      </form>
    </div>
  );
};

export default Payment;
