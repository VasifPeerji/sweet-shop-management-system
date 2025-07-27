import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SortAsc, Grid, List } from 'lucide-react';
import SweetCard from './SweetCard';
import SweetModal from './SweetModal';
import { sweetsAPI, categoriesAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';

const SweetGrid = ({ searchQuery = '' }) => {
  const [sweets, setSweets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load sweets and categories
  useEffect(() => {
    loadSweets();
    loadCategories();
  }, []);

  // Reload sweets when filters change
  useEffect(() => {
    if (!isLoading) {
      loadSweets();
    }
  }, [selectedCategory, sortBy, searchQuery]);

  const loadSweets = async () => {
    try {
      setIsLoading(true);
      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortBy === 'price-high' ? 'desc' : 'asc',
        min_price: priceRange[0],
        max_price: priceRange[1],
      };
      
      const response = await sweetsAPI.getSweets(params);
      setSweets(response.data);
    } catch (error) {
      console.error('Error loading sweets:', error);
      toast({
        title: "Error",
        description: "Failed to load sweets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handlePriceRangeChange = () => {
    loadSweets();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Our Sweet Collection
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Discover {sweets.length} delicious sweets
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.icon} {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                    <SelectItem value="price-high">Price (High to Low)</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="created_at">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    onMouseUp={handlePriceRangeChange}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    onMouseUp={handlePriceRangeChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className="rounded-full"
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.name)}
            className="rounded-full"
          >
            {category.icon} {category.name}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      )}

      {/* Sweet Grid */}
      {!isLoading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}
        >
          <AnimatePresence>
            {sweets.map((sweet) => (
              <motion.div
                key={sweet.id}
                variants={itemVariants}
                layout
                className={viewMode === 'list' ? 'max-w-2xl mx-auto' : ''}
              >
                <SweetCard
                  sweet={sweet}
                  onDetailsClick={setSelectedSweet}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* No Results */}
      {!isLoading && sweets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🍮</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No sweets found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button
            onClick={() => {
              setSelectedCategory('all');
              setSortBy('name');
              setPriceRange([0, 100]);
            }}
            className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
          >
            Reset Filters
          </Button>
        </motion.div>
      )}

      {/* Sweet Details Modal */}
      <SweetModal
        sweet={selectedSweet}
        isOpen={!!selectedSweet}
        onClose={() => setSelectedSweet(null)}
      />
    </div>
  );
};

export default SweetGrid;