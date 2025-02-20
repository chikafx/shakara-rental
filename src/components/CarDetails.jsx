import React, { useEffect, useState } from 'react';
import './CarDetails.css';

import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Button, Carousel, Rate, Descriptions, Tag } from 'antd';
import { format } from 'date-fns';


const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState({
    location: { address: '', coordinates: { lat: null, lng: null }},
    pricing: { daily: '', weekly: '', monthly: '' },
    insuranceOptions: { basic: 0, premium: 0 },
    features: [],
    images: []
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    console.log('Fetching car details for ID:', id);
    const fetchCarDetails = async () => {
      try {
        const carRef = doc(db, 'cars', id);
        console.log('Car reference:', carRef);
        const carDoc = await getDoc(carRef);
        console.log('Car document:', carDoc);
        
        if (carDoc.exists()) {
          const carData = { id: carDoc.id, ...carDoc.data() };
          console.log('Car data:', carData);
          setCar(carData);
        } else {
          console.log('Car document does not exist');
        }
      } catch (error) {
        console.error("Error fetching car details: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);


  if (loading) {
    console.log('Loading car details...');
    return <div>Loading...</div>;
  }
  if (!car) {
    console.log('Car not found');
    return <div>Car not found</div>;
  }


  return (
    <div className="car-details-container">
      <div className="car-images">
        <Carousel autoplay>
          {car.images.map((img, index) => (
            <div key={index}>
              <img 
                src={img} 
                alt={`${car.make} ${car.model}`} 
                className="car-image"
              />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="car-info">
        <h1>{car.make} {car.model} ({car.year})</h1>
        
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Location">
            {car.location?.address || 'Location not specified'}
          </Descriptions.Item>
          <Descriptions.Item label="Pricing">
            <div className="pricing-details">
              <Tag color="blue">Daily: ${car.pricing?.daily || 'N/A'}</Tag>
              <Tag color="green">Weekly: ${car.pricing?.weekly || 'N/A'}</Tag>
              <Tag color="orange">Monthly: ${car.pricing?.monthly || 'N/A'}</Tag>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Insurance Options">
            <div className="insurance-details">
              <Tag color="blue">Basic: ${car.insuranceOptions?.basic || 0}</Tag>
              <Tag color="green">Premium: ${car.insuranceOptions?.premium || 0}</Tag>
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
            <Rate disabled defaultValue={4.5} />
            <span className="rating-text">(4.5)</span>
          </Descriptions.Item>
        </Descriptions>

        <div className="action-buttons">
          <Button type="primary" size="large">
            Book Now
          </Button>
          <Button 
            type="default" 
            size="large"
            disabled={!car.ownerId}
          >
            {car.ownerId ? 'Contact Owner' : 'Owner Info Unavailable'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default CarDetails;
