import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

import { db } from '../firebase';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { initGoogleMaps } from '../firebase';
import { format } from 'date-fns';
import { Button, Rate, Input } from 'antd';

import './CarList.css';


const CarList = () => {

  const [cars, setCars] = useState([]);

  const [location, setLocation] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [mapZoom, setMapZoom] = useState(10);
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState(null);


  useEffect(() => {
    const fetchCars = async () => {
      try {
        let carQuery = collection(db, 'cars');
        
        if (location) {
          carQuery = query(carQuery, where('location', '>=', location));
        }

        const carSnapshot = await getDocs(carQuery);
        const carList = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCars(carList);

        if (carList.length > 0) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: carList[0].location }, (results, status) => {
            if (status === 'OK') {
              setMapCenter({
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              });
              setMapZoom(12);
              setShowMap(true);
            }
          });
        }
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



      {showMap && (
        <div className="map-container">
          <LoadScript googleMapsApiKey={initGoogleMaps().mapConfig.apiKey}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '400px' }}
              center={mapCenter}
              zoom={mapZoom}
            >
              {cars.map((car) => (
                <React.Fragment key={car.id}>
                  <Marker
                    position={{
                      lat: car.location.coordinates.lat,
                      lng: car.location.coordinates.lng
                    }}
                    onClick={() => setSelectedCar(car)}
                  />
                  {selectedCar?.id === car.id && (
                    <InfoWindow
                      position={{
                        lat: car.location.coordinates.lat,
                        lng: car.location.coordinates.lng
                      }}
                      onCloseClick={() => setSelectedCar(null)}
                    >
                      <div>
                        <h4>{car.make} {car.model}</h4>
                        <p>Year: {car.year}</p>
                        <p>Location: {car.location.address}</p>
                        <p>Daily: ${car.pricing?.daily}</p>
                        <p>Weekly: ${car.pricing?.weekly}</p>
                        <p>Monthly: ${car.pricing?.monthly}</p>
                      </div>
                    </InfoWindow>
                  )}
                </React.Fragment>
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      )}

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
                  onClick={() => navigate(`/cars/${car.id}`)}
                  aria-label={`View details for ${car.make} ${car.model}`}
                >
                  View Details
                </Button>


              </div>
            </article>
          ))}
        </div>
      </section>



    </div>
  );
};


export default CarList;
