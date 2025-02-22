import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signOut } from "firebase/auth";
import { Routes, Route, Link } from "react-router-dom";
import { Layout, Menu, Button, Typography, Grid, Drawer } from 'antd';
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import {
  CarOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  MenuOutlined,
  HomeOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  CarFilled,
  PlusOutlined
} from '@ant-design/icons';
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
const { useBreakpoint } = Grid;

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

const Home = () => {
  const screens = useBreakpoint();

  // Define theme colors
  const colors = {
    primary: '#2EC4B6',    // Matching the hero section
    secondary: '#FF6B35',  // From CSS variables
    white: '#ffffff',
    background: '#F8F9FA',
    text: '#333333'
  };

  // Define responsive styles
  const getResponsiveStyles = () => ({
    heroSection: {
      minHeight: screens.xs ? '80vh' : '100vh',
      padding: screens.md ? '0 64px' : screens.sm ? '0 32px' : '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    heroContent: {
      maxWidth: screens.xl ? '1200px' : screens.lg ? '960px' : '100%',
      width: '100%',
      padding: screens.md ? '40px' : '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    },
    title: {
      color: colors.white,
      fontSize: screens.xl ? '4rem' :
        screens.lg ? '3.5rem' :
          screens.md ? '3rem' :
            screens.sm ? '2.5rem' : '2rem',
      marginBottom: screens.md ? '24px' : '16px',
      lineHeight: '1.2',
      textAlign: 'center'
    },
    subtitle: {
      color: colors.white,
      fontSize: screens.xl ? '1.75rem' :
        screens.lg ? '1.5rem' :
          screens.md ? '1.25rem' : '1rem',
      marginBottom: screens.md ? '48px' : '32px',
      opacity: 0.9,
      maxWidth: screens.md ? '80%' : '100%',
      lineHeight: '1.5'
    },
    buttonContainer: {
      display: 'flex',
      gap: screens.md ? '24px' : '16px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: '100%',
      flexDirection: screens.xs ? 'column' : 'row',
      alignItems: 'center',
      padding: screens.xs ? '0 20px' : '0'
    },
    primaryButton: {
      height: screens.md ? '52px' : '48px',
      padding: screens.md ? '0 40px' : '0 32px',
      fontSize: screens.md ? '18px' : '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: colors.secondary,
      borderColor: colors.secondary,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
      transition: 'all 0.3s ease',
      width: screens.xs ? '100%' : 'auto',
      justifyContent: 'center'
    },
    secondaryButton: {
      height: screens.md ? '52px' : '48px',
      padding: screens.md ? '0 40px' : '0 32px',
      fontSize: screens.md ? '18px' : '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'transparent',
      borderColor: colors.white,
      color: colors.white,
      borderRadius: '8px',
      borderWidth: '2px',
      transition: 'all 0.3s ease',
      width: screens.xs ? '100%' : 'auto',
      justifyContent: 'center'
    },
    featuresSection: {
      padding: screens.xl ? '100px 64px' :
        screens.lg ? '80px 48px' :
          screens.md ? '60px 32px' :
            screens.sm ? '40px 24px' : '32px 16px',
      background: colors.background,
      width: '100%'
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: screens.lg ? 'repeat(3, 1fr)' :
        screens.md ? 'repeat(2, 1fr)' :
          'repeat(1, 1fr)',
      gap: screens.md ? '32px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: screens.xs ? '0' : '0 16px'
    },
    featureCard: {
      background: colors.white,
      borderRadius: '16px',
      padding: screens.md ? '40px 32px' : '32px 24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    },
    featureIcon: {
      fontSize: screens.md ? '48px' : '40px',
      color: colors.primary,
      marginBottom: '24px',
      padding: '16px',
      background: `${colors.primary}10`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    featureTitle: {
      fontSize: screens.md ? '24px' : '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: colors.text
    },
    featureDescription: {
      fontSize: screens.md ? '16px' : '14px',
      lineHeight: '1.6',
      color: `${colors.text}CC`,
      margin: 0
    }
  });

  const styles = getResponsiveStyles();

  // Feature card hover effect
  const handleFeatureHover = (e, isEnter) => {
    e.currentTarget.style.transform = isEnter ? 'translateY(-8px)' : 'translateY(0)';
    e.currentTarget.style.boxShadow = isEnter
      ? '0 8px 30px rgba(0, 0, 0, 0.12)'
      : '0 4px 20px rgba(0, 0, 0, 0.08)';
  };

  return (
    <div className="home-container">
      <section className="hero-section" style={styles.heroSection}>
        <div className="hero-content" style={styles.heroContent}>
          <Typography.Title
            level={1}
            className="hero-title"
            style={styles.title}
          >
            Welcome to Shakara Rentals
          </Typography.Title>
          <Typography.Paragraph
            className="hero-subtitle"
            style={styles.subtitle}
          >
            Your premium car rental experience
          </Typography.Paragraph>
          <div className="cta-buttons" style={styles.buttonContainer}>
            <Link to="/cars" style={{ width: screens.xs ? '100%' : 'auto' }}>
              <Button
                type="primary"
                size={screens.md ? 'large' : 'middle'}
                icon={<CarFilled />}
                style={styles.primaryButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
                }}
              >
                Explore Cars
              </Button>
            </Link>
            <Link to="/signup" style={{ width: screens.xs ? '100%' : 'auto' }}>
              <Button
                size={screens.md ? 'large' : 'middle'}
                icon={<UserOutlined />}
                style={styles.secondaryButton}
                ghost
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section" style={styles.featuresSection}>
        <div className="feature-grid" style={styles.featureGrid}>
          <div
            className="feature-card"
            style={styles.featureCard}
            onMouseEnter={(e) => handleFeatureHover(e, true)}
            onMouseLeave={(e) => handleFeatureHover(e, false)}
          >
            <div style={styles.featureIcon}>
              <CarOutlined style={{ fontSize: 'inherit' }} />
            </div>
            <Typography.Title
              level={3}
              style={styles.featureTitle}
            >
              Wide Selection
            </Typography.Title>
            <Typography.Paragraph style={styles.featureDescription}>
              Choose from our extensive collection of luxury vehicles
            </Typography.Paragraph>
          </div>

          <div
            className="feature-card"
            style={styles.featureCard}
            onMouseEnter={(e) => handleFeatureHover(e, true)}
            onMouseLeave={(e) => handleFeatureHover(e, false)}
          >
            <div style={styles.featureIcon}>
              <SafetyOutlined style={{ fontSize: 'inherit' }} />
            </div>
            <Typography.Title
              level={3}
              style={styles.featureTitle}
            >
              Safe & Reliable
            </Typography.Title>
            <Typography.Paragraph style={styles.featureDescription}>
              Our vehicles are meticulously maintained for your safety
            </Typography.Paragraph>
          </div>

          <div
            className="feature-card"
            style={styles.featureCard}
            onMouseEnter={(e) => handleFeatureHover(e, true)}
            onMouseLeave={(e) => handleFeatureHover(e, false)}
          >
            <div style={styles.featureIcon}>
              <CustomerServiceOutlined style={{ fontSize: 'inherit' }} />
            </div>
            <Typography.Title
              level={3}
              style={styles.featureTitle}
            >
              24/7 Support
            </Typography.Title>
            <Typography.Paragraph style={styles.featureDescription}>
              Our dedicated team is always ready to assist you
            </Typography.Paragraph>
          </div>
        </div>
      </section>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const screens = useBreakpoint();

  // Define theme colors for consistency
  const colors = {
    primary: '#2EC4B6',
    secondary: '#FF6B35',
    white: '#ffffff',
    background: '#F8F9FA'
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Style configurations for the navbar
  const navStyles = {
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: screens.md ? '0 50px' : '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      background: '#001529',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    logo: {
      color: colors.white,
      fontSize: screens.md ? '1.5rem' : '1.2rem',
      fontWeight: 'bold',
      marginRight: '24px',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none'
    },
    menu: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'flex-end',
      borderBottom: 'none',
      backgroundColor: 'transparent'
    }
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
    },
    {
      key: 'cars',
      icon: <CarFilled />,
      label: <Link to="/cars" style={{ color: 'inherit', textDecoration: 'none' }}>Cars</Link>
    },
    {
      key: 'add-car',
      icon: <PlusOutlined />,
      label: <Link to="/add-car" style={{ color: 'inherit', textDecoration: 'none' }}>Add Car</Link>
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>Profile</Link>
    },
    ...(!isAuthenticated ? [
      {
        key: 'signup',
        icon: <UserOutlined />,
        label: <Link to="/signup" style={{ color: 'inherit', textDecoration: 'none' }}>Sign Up</Link>
      },
      {
        key: 'login',
        icon: <LoginOutlined />,
        label: <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>
      }
    ] : [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: <Link to="/"
          onClick={async (e) => {
            e.preventDefault();
            await signOut(auth);
            window.location.href = '/';
          }}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          Logout
        </Link>
      }
    ])
  ];

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={navStyles.header}>
          <Link to="/" style={navStyles.logo}>
            <CarFilled style={{ color: colors.primary }} />
            <span style={{ color: colors.white }}>Shakara Rentals</span>
          </Link>

          {screens.md ? (
            <Menu
              theme="dark"
              mode="horizontal"
              style={navStyles.menu}
              items={menuItems}
              overflowedIndicator={<MenuOutlined />}
            />
          ) : (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              style={{
                color: colors.white,
                marginLeft: 'auto'
              }}
            />
          )}
        </Header>

        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CarFilled style={{ color: colors.primary }} />
              <span>Shakara Rentals</span>
            </div>
          }
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          bodyStyle={{ padding: 0 }}
          style={{ zIndex: 1001 }}
        >
          <Menu
            theme="light"
            mode="vertical"
            style={{ borderRight: 'none' }}
            items={menuItems}
            onClick={() => setMobileMenuOpen(false)}
          />
        </Drawer>

        <Content style={{
          padding: screens.md ? '0 50px' : '0 20px',
          marginTop: 24,
          position: 'relative',
          zIndex: 1
        }}>
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

        <Footer style={{ textAlign: 'center', background: colors.background }}>
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
