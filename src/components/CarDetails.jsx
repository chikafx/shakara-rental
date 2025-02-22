import React, { useEffect, useState } from 'react';
import './CarDetails.css';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { auth } from '../firebase';
import { message } from 'antd';
import { db } from '../firebase';
import { Button, Carousel, Rate, Descriptions, Tag } from 'antd';
import { format } from 'date-fns';

const CarDetails = () => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦'
  };

  const { id } = useParams();
  console.log('Received car ID from URL params:', id);
  const [userRole, setUserRole] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [car, setCar] = useState({
    location: { address: '', coordinates: { lat: null, lng: null }},
    pricing: { daily: '', weekly: '', monthly: '' },
    insuranceOptions: { basic: 0, premium: 0 },
    features: [],
    images: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const authUnsub = auth.onAuthStateChanged(user => {
      if (user) {
        const ratingsRef = collection(db, 'cars', id, 'ratings');
        
        const userRatingQuery = query(ratingsRef, where('userId', '==', user.uid));
        const userRatingUnsub = onSnapshot(userRatingQuery, (querySnapshot) => {
          if (!querySnapshot.empty) {
            setUserRating(querySnapshot.docs[0].data().rating);
          } else {
            setUserRating(0);
          }
        });

        const avgRatingUnsub = onSnapshot(ratingsRef, (querySnapshot) => {
          let total = 0;
          let count = 0;
          querySnapshot.forEach((doc) => {
            total += doc.data().rating;
            count++;
          });
          setAverageRating(count > 0 ? (total / count) : 0);
        });

        return () => {
          userRatingUnsub();
          avgRatingUnsub();
        };
      }
    });

    return () => authUnsub();
  }, [id]);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        getDoc(userRef).then(doc => {
          if (doc.exists()) {
            setUserRole(doc.data().role);
          }
        });
      } else {
        setUserRole(null);
      }
    });

    const fetchCarDetails = async () => {
      try {
        console.log('Fetching car details for ID:', id);
        const carRef = doc(db, 'cars', id);
        const carDoc = await getDoc(carRef);
        console.log('Car document:', carDoc.exists() ? carDoc.data() : 'Not found');

        if (!carDoc.exists()) {
          console.error('Car not found in database for ID:', id);
          throw new Error(`Car with ID ${id} not found in database`);
        }

        const carData = { id: carDoc.id, ...carDoc.data() };
        console.log('Car data loaded:', carData);
        setCar(carData);
        setError(null);
        setDataLoaded(true);

      } catch (error) {
        console.error("Error fetching car details: ", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
    
    return () => {
      authUnsubscribe();
    };
  }, [id]);

  const handleRatingChange = async (value) => {
    const user = auth.currentUser;
    if (!user) {
      message.warning('Please login to rate this car');
      return;
    }
    
    try {
      const ratingsRef = collection(db, 'cars', id, 'ratings');
      const q = query(ratingsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await addDoc(ratingsRef, {
          userId: user.uid,
          rating: value,
          timestamp: new Date()
        });
        message.success('Rating submitted successfully');
      } else {
        await updateDoc(querySnapshot.docs[0].ref, {
          rating: value,
          timestamp: new Date()
        });
        message.success('Rating updated successfully');
      }
      
      setUserRating(value);

    } catch (error) {
      console.error('Error submitting rating:', error);
      message.error('Failed to submit rating');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading car details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading car details</h2>
        <p>{error}</p>
        <Button 
          type="primary" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!car || !dataLoaded) {
    return (
      <div className="error-container">
        <h2>Car Not Found</h2>
        <p>The requested car could not be found. Please check the URL or try again later.</p>
        <Button 
          type="primary" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="car-details-container">
      <div className="car-images-section">
        <Carousel autoplay className="car-carousel">
          {car.images.map((img, index) => (
            <div key={index} className="carousel-item">
              <img 
                src={img} 
                alt={`${car.make} ${car.model}`} 
                className="car-image"
              />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="car-info-section">
        <div className="car-header">
          <h1 className="car-title">{car.make} {car.model} ({car.year})</h1>
          <div className="car-rating-section">
            <Rate 
              value={averageRating} 
              allowHalf 
              onChange={handleRatingChange}
              disabled={!auth.currentUser}
              className="rating-stars"
            />
            <span className="rating-text">
              ({averageRating.toFixed(1)}) {userRating > 0 && `(Your rating: ${userRating})`}
            </span>
          </div>
        </div>

        <Descriptions bordered column={1} className="car-specs">
          <Descriptions.Item label="Location">
            {car.location?.address || 'Location not specified'}
          </Descriptions.Item>
          <Descriptions.Item label="Pricing">
            <div className="pricing-details">
              <Tag color="blue">Daily: {currencySymbols[car.currency] || '$'}{car.pricing?.daily || 'N/A'}</Tag>
              <Tag color="green">Weekly: {currencySymbols[car.currency] || '$'}{car.pricing?.weekly || 'N/A'}</Tag>
              <Tag color="orange">Monthly: {currencySymbols[car.currency] || '$'}{car.pricing?.monthly || 'N/A'}</Tag>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Insurance Options">
            <div className="insurance-details">
              <Tag color="blue">Basic: {currencySymbols[car.currency] || '$'}{car.insuranceOptions?.basic || 0}</Tag>
              <Tag color="green">Premium: {currencySymbols[car.currency] || '$'}{car.insuranceOptions?.premium || 0}</Tag>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Availability">
            {car.availability?.startDate && car.availability?.endDate ? (
              `${format(new Date(car.availability.startDate), 'MMM d')} - 
              ${format(new Date(car.availability.endDate), 'MMM d')}`
            ) : 'Availability not specified'}
          </Descriptions.Item>
          <Descriptions.Item label="Features">
            <div className="features-list">
              {car.features?.length > 0 ? (
                car.features.map((feature, index) => (
                  <Tag key={index} color="geekblue">
                    {feature}
                  </Tag>
                ))
              ) : (
                <span>No features listed</span>
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Rating">
            <Rate 
              value={averageRating} 
              allowHalf 
              onChange={handleRatingChange}
              disabled={!auth.currentUser}
            />
            <span className="rating-text">
              ({averageRating.toFixed(1)}) {userRating > 0 && `(Your rating: ${userRating})`}
            </span>
          </Descriptions.Item>
        </Descriptions>

        <div className="action-buttons">
          <div className="button-group">
            {userRole === 'renter' && (
              <Button type="primary" size="large" className="action-button">
                Book Now
              </Button>
            )}
            {userRole === 'rentee' && (
              <Button 
                type="primary" 
                size="large"
                className="action-button"
                onClick={() => window.location.href = `/edit-car/${id}`}
              >
                Edit Listing
              </Button>
            )}
            <Button 
              type="default" 
              size="large"
              className="action-button"
              disabled={!car.ownerId}
            >
              {car.ownerId ? 'Contact Owner' : 'Owner Info Unavailable'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
