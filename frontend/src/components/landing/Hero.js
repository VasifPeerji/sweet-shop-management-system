import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Award, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

const Hero = ({ onExploreClick }) => {
  const { isAuthenticated } = useAuth();

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const sparkleAnimation = {
    scale: [1, 1.2, 1],
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // ✅ Image rotation setup
  const sweetImages = [
    {
      url: "https://images.unsplash.com/photo-1635952346904-95f2ccfcd029?auto=format&fit=crop&w=900&q=80",
      label: "Boondi Laddu 🍯"
    },
    {
      url: "https://images.unsplash.com/photo-1699708263762-00ca477760bd?auto=format&fit=crop&w=900&q=80",
      label: "Kaju Katli 💎"
    },
    {
      url: "https://wallpaperaccess.com/full/8980239.jpg",
      label: "Rasgulla 🍥"
    },
    {
      url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
      label: "Chocolate Truffle Cake 🍫"
    },
    
  ];

  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % sweetImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 2 + 1}rem`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {['🍮', '🧁', '🍫', '🍭', '🍬'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <Award className="h-4 w-4" />
              Premium Quality Sweets
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Sweet
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"> Dreams</span>
              <br />
              Made Real
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl"
            >
              Discover the finest collection of traditional Indian sweets and modern delicacies. 
              Each piece crafted with love, tradition, and the finest ingredients.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                onClick={onExploreClick}
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Explore Sweets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                <Heart className="mr-2 h-5 w-5" />
                Our Story
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sweet Varieties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">4.9★</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              animate={floatingAnimation}
              className="relative z-10"
            >
              <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <motion.img
                  key={sweetImages[imageIndex].url}
                  src={sweetImages[imageIndex].url}
                  alt="Delicious Indian Sweet"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Floating Elements */}
                <motion.div
                  animate={sparkleAnimation}
                  className="absolute top-4 right-4 bg-yellow-400 rounded-full p-2"
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </motion.div>
                
                <motion.div
                  key={sweetImages[imageIndex].label}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-4 left-4 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
                >
                  {sweetImages[imageIndex].label}
                </motion.div>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full opacity-20"
            />
            
            <motion.div
              animate={{
                rotate: [360, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full opacity-20"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
