import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { initStripe } from '../firebase';
import { CardElement, useElements } from '@stripe/react-stripe-js';




const Booking = () => {
  const elements = useElements();

  const { carId } = useParams();

  const [car, setCar] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    startDate: '',
    endDate: '',
    totalPrice: 0,
    insuranceOption: 'none',
    rentalDuration: 'daily'
  });


  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const carRef = doc(db, 'cars', carId);
        const carSnap = await getDoc(carRef);
        
        if (carSnap.exists()) {
          setCar(carSnap.data());
        }
      } catch (error) {
        console.error("Error fetching car details: ", error);
        toast.error('Failed to load car details');
      }
    };

    fetchCarDetails();
  }, [carId]);

  const calculateTotal = (start, end, car) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let basePrice = 0;
    switch (bookingDetails.rentalDuration) {
      case 'daily':
        basePrice = days * car.pricing.daily;
        break;
      case 'weekly':
        basePrice = Math.ceil(days / 7) * car.pricing.weekly;
        break;
      case 'monthly':
        basePrice = Math.ceil(days / 30) * car.pricing.monthly;
        break;
      default:
        basePrice = days * car.pricing.daily;
    }

    let insuranceCost = 0;
    switch (bookingDetails.insuranceOption) {
      case 'basic':
        insuranceCost = days * car.insuranceOptions.basic;
        break;
      case 'premium':
        insuranceCost = days * car.insuranceOptions.premium;
        break;
      default:
        insuranceCost = 0;
    }

    return basePrice + insuranceCost;
  };


  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingDetails.startDate || !bookingDetails.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      const stripeInstance = await initStripe();

      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bookingDetails.totalPrice * 100,
          currency: 'usd',
        }),
      });

      const { clientSecret } = await response.json();
        const result = await stripeInstance.confirmPayment({
          clientSecret,
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });


      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Payment successful! Booking confirmed.');
        // Save booking to database
      }
    } catch (error) {
      console.error("Error processing payment: ", error);
      toast.error('Payment failed');
    }
  };

  return (
    <div className="booking-container">
      <h2>Book Car</h2>
      {car && (
        <div className="car-details">
          <h3>{car.make} {car.model}</h3>
          <p>Year: {car.year}</p>
          <p>Price per day: ${car.price}</p>
        </div>
      )}
      
      <form onSubmit={handleBooking}>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={bookingDetails.startDate}
            onChange={(e) => setBookingDetails({
              ...bookingDetails,
              startDate: e.target.value,
              totalPrice: calculateTotal(e.target.value, bookingDetails.endDate, car)
            })}
            required
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={bookingDetails.endDate}
            onChange={(e) => setBookingDetails({
              ...bookingDetails,
              endDate: e.target.value,
              totalPrice: calculateTotal(bookingDetails.startDate, e.target.value, car)
            })}
            required
          />
        </div>
        <div>
          <label>Rental Duration:</label>
          <select
            value={bookingDetails.rentalDuration}
            onChange={(e) => setBookingDetails({
              ...bookingDetails,
              rentalDuration: e.target.value,
              totalPrice: calculateTotal(bookingDetails.startDate, bookingDetails.endDate, car)
            })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label>Insurance Option:</label>
          <select
            value={bookingDetails.insuranceOption}
            onChange={(e) => setBookingDetails({
              ...bookingDetails,
              insuranceOption: e.target.value,
              totalPrice: calculateTotal(bookingDetails.startDate, bookingDetails.endDate, car)
            })}
          >
            <option value="none">No Insurance</option>
            <option value="basic">Basic Insurance</option>
            <option value="premium">Premium Insurance</option>
          </select>
        </div>

        <div>
          <h4>Total Price: ${bookingDetails.totalPrice.toFixed(2)}</h4>
          <p>Includes: 
            {bookingDetails.insuranceOption !== 'none' && 
              ` ${bookingDetails.insuranceOption} insurance`}
          </p>

        </div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  );
};

export default Booking;
