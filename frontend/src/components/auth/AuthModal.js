import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register, googleLogin, facebookLogin, isLoading } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }
      
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Account created successfully!",
          variant: "default"
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    } else {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Welcome back!",
          variant: "default"
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  };

  const handleGoogleLogin = async () => {
    // Mock Google login response
    const mockGoogleResponse = {
      name: "Google User",
      email: "googleuser@gmail.com",
      picture: "https://images.unsplash.com/photo-1494790108755-2616b67494c0?w=150&h=150&fit=crop&crop=face"
    };
    
    const result = await googleLogin(mockGoogleResponse);
    if (result.success) {
      toast({
        title: "Success",
        description: "Logged in with Google!",
        variant: "default"
      });
      onClose();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleFacebookLogin = async () => {
    // Mock Facebook login response
    const mockFacebookResponse = {
      name: "Facebook User",
      email: "fbuser@facebook.com",
      picture: {
        data: {
          url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        }
      }
    };
    
    const result = await facebookLogin(mockFacebookResponse);
    if (result.success) {
      toast({
        title: "Success",
        description: "Logged in with Facebook!",
        variant: "default"
      });
      onClose();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <FaGoogle className="h-4 w-4 text-red-500" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <FaFacebook className="h-4 w-4 text-blue-500" />
                Facebook
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-1 text-pink-500 hover:text-pink-600 font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;