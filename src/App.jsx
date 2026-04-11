import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <div className="app-root">
      {/* Global Header - always visible */}
      <Header />

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
      </Routes>

      {/* Global Cookie Consent — appears on every page */}
      <CookieConsent />

      {/* Right-side floating contact buttons */}
      <FloatingContact />
    </div>
  );
}

export default App;
