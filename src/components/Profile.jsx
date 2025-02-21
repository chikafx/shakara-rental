import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import './Profile.css';




const Profile = () => {
  const navigate = useNavigate();

  // Handle authentication state
  useEffect(() => {
    console.log('Profile component mounted');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed in Profile, user:', user);
      if (!user) {
        toast.error('Please login to access your profile');
        navigate('/login');
      }
    });
    return () => {
      console.log('Profile component unmounted');
      unsubscribe();
    };
  }, [navigate]);



  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    address: '',
    userType: 'renter',
    photoURL: ''
  });
  const [userEmail, setUserEmail] = useState('');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    console.log('Fetching user data...');
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          console.log('Current user:', auth.currentUser);
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            console.log('User data found:', userSnap.data());
            setUserData(userSnap.data());
          } else {
            console.log('No user data found');
          }
          if (auth.currentUser?.email) {
            console.log('Setting user email:', auth.currentUser.email);
            setUserEmail(auth.currentUser.email);
          }

        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        toast.error('Failed to load profile data');
      } finally {
        console.log('Finished loading user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);



  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const fileRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      setUserData(prev => ({...prev, photoURL: downloadURL}));
      toast.success('Profile photo uploaded successfully!');
    } catch (error) {
      console.error("Error uploading photo: ", error);
      toast.error('Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = () => {

    const errors = {};
    if (!userData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!userData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(userData.phone)) {
      errors.phone = 'Invalid phone number';
    }
    if (!userData.address.trim()) {
      errors.address = 'Address is required';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, userData);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="email-display">
        <strong>Email:</strong> {userEmail}
      </div>

      <div className="profile-photo-section">
        {userData.photoURL && (
          <img 
            src={userData.photoURL} 
            alt="Profile" 
            className="profile-photo"
          />
        )}
        <label className="photo-upload-label">
          {uploadingPhoto ? 'Uploading...' : 'Upload Profile Photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <form onSubmit={handleUpdateProfile}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="tel"
              value={userData.phone}
              onChange={(e) => setUserData({...userData, phone: e.target.value})}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              value={userData.address}
              onChange={(e) => setUserData({...userData, address: e.target.value})}
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>
          <div>
            <label>User Type:</label>
            <select
              value={userData.userType}
              onChange={(e) => setUserData({...userData, userType: e.target.value})}
            >
              <option value="renter">Renter</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      )}
    </div>

  );
};

export default Profile;
