// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Signup from './components/Signup';
import Login from './components/login';
import CarList from './components/CarList';
import AddCar from './components/AddCar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cars" element={<CarList />} />
        <Route path="/add-car" element={<AddCar />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
