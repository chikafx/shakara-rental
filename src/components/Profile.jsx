import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from 'react-toastify';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    address: '',
    userType: 'renter'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, userData);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({...userData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <label>Phone:</label>
          <input
            type="tel"
            value={userData.phone}
            onChange={(e) => setUserData({...userData, phone: e.target.value})}
            required
          />
        </div>
        <div>
          <label>Address:</label>
          <input
            type="text"
            value={userData.address}
            onChange={(e) => setUserData({...userData, address: e.target.value})}
            required
          />
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
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
