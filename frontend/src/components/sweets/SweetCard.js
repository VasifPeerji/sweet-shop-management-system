import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

const SweetCard = ({ sweet, onDetailsClick }) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, addToWishlist, wishlist, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const isInWishlist = wishlist.some(item => item.sweet_id === sweet.id);
  const discount = sweet.original_price ? Math.round(((sweet.original_price - sweet.price) / sweet.original_price) * 100) : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const result = await addToCart(sweet, quantity);
    if (result.success) {
      toast({
        title: "Added to Cart!",
        description: `${quantity} ${sweet.name} added to your cart`,
        variant: "default"
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to wishlist",
        variant: "destructive"
      });
      return;
    }

    const result = await addToWishlist(sweet);
    if (result.success) {
      toast({
        title: "Added to Wishlist!",
        description: `${sweet.name} added to your wishlist`,
        variant: "default"
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={() => onDetailsClick(sweet)}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={sweet.image}
          alt={sweet.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
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

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isInWishlist 
              ? 'bg-pink-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-pink-500 hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Quick Add Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isLoading || sweet.stock === 0}
            className="w-full bg-white/90 text-gray-800 hover:bg-white backdrop-blur-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isLoading ? 'Adding...' : 'Quick Add'}
          </Button>
        </motion.div>

        {/* Stock indicator */}
        {sweet.stock <= 5 && sweet.stock > 0 && (
          <div className="absolute bottom-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Only {sweet.stock} left!
          </div>
        )}
        
        {sweet.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {sweet.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {sweet.rating} ({sweet.reviews})
            </span>
          </div>
        </div>

        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-pink-500 transition-colors">
          {sweet.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {sweet.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-pink-500">
              ₹{sweet.price}
            </span>
            {sweet.original_price && sweet.original_price > sweet.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{sweet.original_price}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sweet.weight}
          </span>
        </div>

        {/* Quantity Selector and Add to Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-sm font-medium">
              {quantity}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(quantity + 1);
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || sweet.stock === 0}
            className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
          >
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SweetCard;