import React, { useState } from 'react';

import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from '../firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, Input, Button, DatePicker, Upload, Select } from 'antd';

import { UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import './AddCar.css';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AddCar = () => {
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦'
  };

  const [location, setLocation] = useState({
    address: '',
    coordinates: { lat: null, lng: null }
  });
  const [features, setFeatures] = useState('');
  const [availability, setAvailability] = useState({
    startDate: '',
    endDate: ''
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file) => {
    const storageRef = ref(storage, `cars/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
      if (permissionStatus.state === 'denied') {
        toast.error('Location access is denied. Please enable location permissions in your browser settings.');
        return;
      }

      setUploading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Retrieved location:', newCoords);
          setLocation(prev => ({
            ...prev,
            coordinates: newCoords
          }));
          setMapCenter([newCoords.lat, newCoords.lng]);
          setUploading(false);
          toast.success('Location retrieved successfully!');
        },
        (error) => {
          setUploading(false);
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get location timed out.';
              break;
            default:
              errorMessage = `An unknown error occurred: ${error.message}`;
          }
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }).catch(error => {
      console.error('Permission check error:', error);
      toast.error('Unable to check location permissions');
    });
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    
    // Add authentication check
    if (!auth.currentUser) {
      toast.error('You must be logged in to add a car. Please sign in or create an account.');
      return;
    }

    setUploading(true);
    
    try {
      const imageUrls = await Promise.all(
        images.map(async (file) => await handleImageUpload(file))
      );

      await addDoc(collection(db, 'cars'), {
        make,
        model,
        year,
        price,
        location: {
          address: location.address,
          coordinates: location.coordinates
        },
        ownerId: auth.currentUser.uid,
        ownerName: auth.currentUser.displayName,
        currency,
        pricing: {
          daily: price,
          weekly: price * 7 * 0.9,
          monthly: price * 30 * 0.8,
          currency
        },
        insuranceOptions: {
          basic: price * 0.1,
          premium: price * 0.2
        },
        features: features.split(',').map(f => f.trim()),
        availability,
        images: imageUrls,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setMake('');
      setModel('');
      setYear('');
      setPrice('');
      setLocation({ address: '', coordinates: { lat: null, lng: null }});
      setFeatures('');
      setAvailability({ startDate: '', endDate: '' });
      setImages([]);

      toast.success(
        <div>
          <h4>Car Added Successfully!</h4>
          <p>Your car listing is now live on the platform.</p>
        </div>,
        {
          autoClose: 5000,
          closeButton: true,
          position: 'top-center'
        }
      );

    } catch (error) {
      console.error("Error adding car: ", error);
      toast.error('Failed to add car. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLocation(prev => ({
          ...prev,
          coordinates: {
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }
        }));
        setMapCenter([e.latlng.lat, e.latlng.lng]);
      }
    });

    return location.coordinates.lat ? (
      <Marker
        position={[location.coordinates.lat, location.coordinates.lng]}
        icon={L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })}
      />
    ) : null;
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('You can only upload image files!');
    }
    return isImage;
  };

  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      onProgress({ percent: 0 });
      const url = await handleImageUpload(file);
      setImages(prev => [...prev, {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: url,
        originFileObj: file
      }]);
      onProgress({ percent: 100 });
      onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      onError(error);
      toast.error('Failed to upload image');
    }
  };

  return (
    <Card 
      title="Add New Car Listing" 
      className="add-car-card"
      style={{ maxWidth: 800, margin: '20px auto' }}
    >
      <form onSubmit={handleAddCar} className="add-car-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-item">
              <label>Make</label>
              <Input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g., Toyota"
                required
              />
            </div>
            <div className="form-item">
              <label>Model</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., Camry"
                required
              />
            </div>
            <div className="form-item">
              <label>Year</label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div className="form-item">
              <label>Currency</label>
              <Select
                defaultValue="USD"
                style={{ width: '100%' }}
                onChange={(value) => setCurrency(value)}
                options={[
                  { value: 'USD', label: 'US Dollar (USD)' },
                  { value: 'EUR', label: 'Euro (EUR)' },
                  { value: 'GBP', label: 'British Pound (GBP)' },
                  { value: 'NGN', label: 'Nigerian Naira (NGN)' }
                ]}
              />
            </div>
            <div className="form-item">
              <label>Price (per day)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                prefix={currencySymbols[currency]}
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="location-container">
            <div className="address-input">
              <Input
                value={location.address}
                onChange={(e) => setLocation({...location, address: e.target.value})}
                placeholder="Enter address"
                prefix={<EnvironmentOutlined />}
                required
              />
              <Button 
                type="primary" 
                onClick={handleGetLocation}
                style={{ marginLeft: '10px' }}
              >
                Use Current Location
              </Button>
            </div>
            <div className="map-container">
              <MapContainer center={mapCenter} zoom={13} style={{ height: 300 }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Features</h3>
          <TextArea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder="Enter features separated by commas (e.g., GPS, Bluetooth, Sunroof)"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </div>

        <div className="form-section">
          <h3>Availability</h3>
          <RangePicker
            onChange={(dates) => setAvailability({
              startDate: dates[0].format('YYYY-MM-DD'),
              endDate: dates[1].format('YYYY-MM-DD')
            })}
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-section">
          <h3>Images</h3>
          <Upload
            multiple
            beforeUpload={beforeUpload}
            customRequest={customRequest}
            listType="picture-card"
            fileList={images}
            onRemove={(file) => {
              setImages(prev => prev.filter(img => img.uid !== file.uid));
            }}
          >
            {images.length < 5 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </div>

        <Button 
          type="primary" 
          htmlType="submit" 
          disabled={uploading}
          style={{ width: '100%', marginTop: 24 }}
          size="large"
          loading={uploading}
          icon={uploading ? null : <UploadOutlined />}
        >
          {uploading ? 'Adding Your Car...' : 'Add Car'}
        </Button>
      </form>
    </Card>
  );
};

export default AddCar;
