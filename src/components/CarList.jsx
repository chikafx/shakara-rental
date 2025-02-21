import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { format } from 'date-fns';
import { Button, Rate, Input, message } from 'antd';

import './CarList.css';
import LocationPermissionModal from './LocationPermissionModal';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(
    localStorage.getItem('locationPermission') !== 'accepted'
  );

  const [location, setLocation] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        console.log('Fetching cars from Firestore');
        let carQuery = collection(db, 'cars');
        
        if (location) {
          carQuery = query(
            carQuery,
            where('location.address', '>=', location),
            where('location.address', '<=', location + '\uf8ff')
          );
        }

        const carSnapshot = await getDocs(carQuery);
        const carList = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched cars:', carList);
        setCars(carList);

      } catch (error) {
        console.error("Error fetching cars: ", error);
      }
    };

    fetchCars();
  }, [location]);

  return (
    <div>
      <div className="header-section" role="region" aria-label="Car search section">
        <h1 className="section-title" aria-level="1">Available Cars</h1>
        <div className="search-container" role="search">
          <Input.Search
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            enterButton={
              <Button type="primary" aria-label="Search cars">
                Search
              </Button>
            }
            size="large"
            style={{ maxWidth: '600px', width: '100%' }}
          />
        </div>
      </div>

      <section className="car-grid-container" aria-label="List of available cars">
        <div className="car-grid" role="list">
          {cars.map((car) => (
            <article key={car.id} className="car-item" role="listitem">
              <div className="car-image-container">
                <img
                  alt={`${car.year} ${car.make} ${car.model}`}
                  src={car.images?.[0] || 'https://via.placeholder.com/300'}
                  className="car-image"
                  loading="lazy"
                />
                <div className="car-price-badge">
                  ${car.pricing?.daily}/day
                </div>
              </div>
              <div className="car-details">
                <h3 className="car-title">{`${car.make} ${car.model} (${car.year})`}</h3>
                <div className="car-info">
                  <div className="car-location">
                    <i className="fas fa-map-marker-alt"></i> {car.location.address}
                  </div>
                  <div className="car-rating">
                    <Rate disabled defaultValue={4.5} />
                    <span className="rating-text">(4.5)</span>
                  </div>
                  <div className="car-availability">
                    <i className="fas fa-calendar-alt"></i> Available: {format(new Date(car.availability.startDate), 'MMM d')} - {format(new Date(car.availability.endDate), 'MMM d')}
                  </div>
                </div>
                <Button
                  type="primary"
                  className="view-details-button"
                  onClick={() => {
                    console.log('Navigating to car details with ID:', car.id);
                    navigate(`/cars/${car.id}`);
                  }}
                  aria-label={`View details for ${car.make} ${car.model}`}
                >
                  View Details
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <LocationPermissionModal
        visible={showLocationModal}
        onAccept={() => {
          localStorage.setItem('locationPermission', 'accepted');
          setShowLocationModal(false);
        }}
        onCancel={() => {
          localStorage.setItem('locationPermission', 'denied');
          setShowLocationModal(false);
        }}
      />
    </div>
  );
};

export default CarList;
