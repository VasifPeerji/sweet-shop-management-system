import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';

const AddSweetModal = ({ isOpen, onClose, onAdd, editingSweet = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    description: '',
    image: '',
    stock: '',
    weight: '',
    ingredients: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingSweet) {
      setFormData({
        name: editingSweet.name,
        category: editingSweet.category,
        price: editingSweet.price.toString(),
        originalPrice: editingSweet.originalPrice.toString(),
        description: editingSweet.description,
        image: editingSweet.image,
        stock: editingSweet.stock.toString(),
        weight: editingSweet.weight,
        ingredients: editingSweet.ingredients.join(', ')
      });
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        description: '',
        image: '',
        stock: '',
        weight: '',
        ingredients: ''
      });
    }
  }, [editingSweet, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const sweetData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        stock: parseInt(formData.stock),
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        image: formData.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop'
      };

      if (editingSweet) {
        sweetData.id = editingSweet.id;
        sweetData.rating = editingSweet.rating;
        sweetData.reviews = editingSweet.reviews;
        sweetData.featured = editingSweet.featured;
      }

      onAdd(sweetData);
      onClose();
      
      toast({
        title: editingSweet ? "Sweet Updated" : "Sweet Added",
        description: editingSweet ? "Sweet has been updated successfully" : "New sweet has been added to the catalog",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save sweet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Indian Sweets', 'Chocolates', 'Cupcakes', 'Gummies', 'Candies'];

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
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingSweet ? 'Edit Sweet' : 'Add New Sweet'}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sweet Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter sweet name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original Price (₹)
                  </label>
                  <Input
                    name="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock *
                  </label>
                  <Input
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight *
                </label>
                <Input
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 250g, 500g, 1kg"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the sweet..."
                  required
                  rows={3}
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ingredients (comma-separated)
                </label>
                <Input
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="e.g., Milk solids, Sugar, Ghee, Cardamom"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty to use default image
                </p>
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image Preview
                  </label>
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : editingSweet ? 'Update Sweet' : 'Add Sweet'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddSweetModal;