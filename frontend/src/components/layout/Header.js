import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Heart, User, Moon, Sun, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ NEW
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import AuthModal from '../auth/AuthModal';

const Header = ({ onSearch, searchQuery }) => {
  const navigate = useNavigate(); // ✅ NEW
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, getCartItemCount, wishlist } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🍮</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                SweetByte
              </h1>
            </motion.div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search sweets..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/wishlist')} // ✅
                    className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlist.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-pink-500">
                        {wishlist.length}
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/cart')} // ✅
                    className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {getCartItemCount() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500">
                        {getCartItemCount()}
                      </Badge>
                    )}
                  </Button>

                  <div className="flex items-center space-x-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/profile')} // ✅ optional
                      className="text-blue-500 hover:text-blue-700"
                    >
                      My Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleAuthClick('login')}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => handleAuthClick('register')}
                    className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search sweets..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col space-y-4">
                <Button variant="ghost" onClick={toggleTheme} className="justify-start">
                  {theme === 'dark' ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>

                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/wishlist')}>
                      <Heart className="h-5 w-5 mr-2" />
                      Wishlist ({wishlist.length})
                    </Button>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/cart')}>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Cart ({getCartItemCount()})
                    </Button>
                    <div className="flex items-center space-x-2 px-4">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className="justify-start text-red-500"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleAuthClick('login')}
                      className="justify-start"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Sign In
                    </Button>
                    <Button
                      onClick={() => handleAuthClick('register')}
                      className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;
