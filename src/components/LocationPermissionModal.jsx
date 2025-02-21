import React, { useState } from 'react';
import { Modal, Button } from 'antd';

const LocationPermissionModal = ({ visible, onAccept, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (navigator.geolocation) {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve(position);
              setLoading(false);
              onAccept(position);
            },
            (error) => {
              setLoading(false);
              if (error.code === error.PERMISSION_DENIED) {
                setError("Location access was denied. Please enable location services in your browser settings.");
              } else {
                setError(error.message);
              }
            }
          );
        });
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Location Access"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="accept"
          type="primary"
          loading={loading}
          onClick={handleAccept}
        >
          Allow Location Access
        </Button>,
      ]}
    >
      <p>To provide you with the best experience, we need access to your location.</p>
      {error && <p style={{ color: '#ff4d4f', marginTop: '10px' }}>{error}</p>}
    </Modal>
  );
};

export default LocationPermissionModal;
