import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, ShoppingCart, Plus, Minus, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

const SweetModal = ({ sweet, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, addToWishlist, wishlist, isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (!sweet) return null;

  const isInWishlist = wishlist.some(item => item.id === sweet.id);
  const discount = Math.round(((sweet.originalPrice - sweet.price) / sweet.originalPrice) * 100);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addToCart(sweet, quantity);
    toast({
      title: "Added to Cart!",
      description: `${quantity} ${sweet.name} added to your cart`,
      variant: "default"
    });
    setIsLoading(false);
    onClose();
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to wishlist",
        variant: "destructive"
      });
      return;
    }

    addToWishlist(sweet);
    toast({
      title: "Added to Wishlist!",
      description: `${sweet.name} added to your wishlist`,
      variant: "default"
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative">
              <div className="h-64 overflow-hidden rounded-t-2xl">
                <img
                  src={sweet.image}
                  alt={sweet.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800"
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {sweet.featured && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white">
                      ⭐ Featured
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {discount}% OFF
                    </Badge>
                  )}
                </div>

                {/* Stock Status */}
                {sweet.stock <= 5 && sweet.stock > 0 && (
                  <div className="absolute bottom-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                    Only {sweet.stock} left!
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title and Category */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {sweet.category}
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {sweet.name}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={isInWishlist ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(sweet.rating) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                    {sweet.rating} ({sweet.reviews} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {sweet.weight}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-pink-500">
                  ₹{sweet.price}
                </span>
                {sweet.originalPrice > sweet.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{sweet.originalPrice}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-green-600 font-semibold">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {sweet.description}
                </p>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sweet.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-lg font-medium bg-gray-50 dark:bg-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading || sweet.stock === 0}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white py-3 text-lg font-semibold"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isLoading ? 'Adding...' : sweet.stock === 0 ? 'Out of Stock' : `Add to Cart - ₹${sweet.price * quantity}`}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Product Information
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{sweet.weight}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Stock:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{sweet.stock} units</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{sweet.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{sweet.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SweetModal;