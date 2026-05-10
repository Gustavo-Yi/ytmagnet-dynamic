import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import CookieConsent from './components/CookieConsent';
import FloatingContact from './components/FloatingContact';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import NewsPage from './pages/NewsPage';
import InvestorPage from './pages/InvestorPage';
import JoinPage from './pages/JoinPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-root">
      {/* Global Header - hidden on admin pages */}
      {!isAdminPage && <Header />}

      {/* Page Routes */}
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/products"   element={<ProductsPage />} />
        <Route path="/products/:category" element={<ProductsPage />} />
        <Route path="/news"       element={<NewsPage />} />
        <Route path="/investor"   element={<InvestorPage />} />
        <Route path="/join"       element={<JoinPage />} />
        <Route path="/contact"    element={<ContactPage />} />
        <Route path="/admin"      element={<AdminPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
      </Routes>

      {/* Global Cookie Consent — hidden on admin pages */}
      {!isAdminPage && <CookieConsent />}

      {/* Right-side floating contact buttons — hidden on admin pages */}
      {!isAdminPage && <FloatingContact />}
    </div>
  );
}

export default App;
