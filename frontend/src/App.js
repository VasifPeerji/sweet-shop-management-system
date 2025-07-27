import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/sonner';
import Header from './components/layout/Header';
import Hero from './components/landing/Hero';
import SweetGrid from './components/sweets/SweetGrid';
import AdminPanel from './components/admin/AdminPanel';
import './App.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const sweetGridRef = useRef(null);

  const scrollToSweets = () => {
    sweetGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      <Hero onExploreClick={scrollToSweets} />
      <div ref={sweetGridRef}>
        <SweetGrid searchQuery={searchQuery} />
      </div>
    </div>
  );
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </BrowserRouter>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;