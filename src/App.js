import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signOut } from "firebase/auth";
import { Routes, Route, Link } from "react-router-dom";
import { Layout, Menu } from 'antd';
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import { CarOutlined, SafetyOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import './components/Home.css';
import Signup from "./components/Signup";
import VerifySignin from "./components/VerifySignin";
import Login from "./components/login";
import Cars from "./components/CarList";
import CarDetails from "./components/CarDetails";
import AddCar from "./components/AddCar";
import Profile from "./components/Profile";
import Booking from "./components/Booking";
import Payment from "./components/Payment";
import "./App.css";

const { Header, Content, Footer } = Layout;

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

const Home = () => (
  <div className="home-container">
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Welcome to Shakara Rentals</h1>
        <p className="hero-subtitle">Your premium car rental experience</p>
        <div className="cta-buttons">
          <Link to="/cars" className="cta-button primary">Explore Cars</Link>
          <Link to="/signup" className="cta-button">Sign Up</Link>
        </div>
      </div>
    </section>

    <section className="features-section">
      <div className="feature-grid">
        <div className="feature-card">
          <CarOutlined className="feature-icon" />
          <h3 className="feature-title">Wide Selection</h3>
          <p className="feature-description">
            Choose from our extensive collection of luxury vehicles
          </p>
        </div>
        <div className="feature-card">
          <SafetyOutlined className="feature-icon" />
          <h3 className="feature-title">Safe & Reliable</h3>
          <p className="feature-description">
            Our vehicles are meticulously maintained for your safety
          </p>
        </div>
        <div className="feature-card">
          <CustomerServiceOutlined className="feature-icon" />
          <h3 className="feature-title">24/7 Support</h3>
          <p className="feature-description">
            Our dedicated team is always ready to assist you
          </p>
        </div>
      </div>
    </section>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const menuItems = [
    { key: '1', label: <Link to="/">Home</Link> },
    { key: '2', label: <Link to="/cars">Cars</Link> },
    { key: '3', label: <Link to="/add-car">Add Car</Link> },
    { key: '4', label: <Link to="/profile">Profile</Link> },
    ...(!isAuthenticated ? [
      { key: '5', label: <Link to="/signup">Sign Up</Link> },
      { key: '6', label: <Link to="/login">Login</Link> }
    ] : [
      { key: '7', label: <Link to="/" onClick={async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = '/';
      }}>Logout</Link> }
    ])
  ];

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Layout className="layout">
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div className="logo" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Shakara Rentals
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ flex: 1, minWidth: 0 }}
            items={menuItems}
          />
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 24 }}>
          <div style={{ background: '#fff', padding: 24, minHeight: '80vh' }}>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-signin" element={<VerifySignin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/add-car" element={<AddCar />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/booking/:carId" element={<Booking />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/cars/:id" element={<CarDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Shakara Rentals ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </ErrorBoundary>
  );
}

const NotFound = () => (
  <div style={{ padding: '24px' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <Link to="/">Go to Home</Link>
  </div>
);

export default App;
