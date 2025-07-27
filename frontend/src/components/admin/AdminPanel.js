import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Package, Eye, Search, Filter } from 'lucide-react';
import { mockSweets } from '../../data/mockData';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import AddSweetModal from './AddSweetModal';

const AdminPanel = () => {
  const [sweets, setSweets] = useState(mockSweets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const { toast } = useToast();

  const filteredSweets = sweets.filter(sweet => {
    const matchesSearch = sweet.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sweet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteSweet = (id) => {
    setSweets(prev => prev.filter(sweet => sweet.id !== id));
    toast({
      title: "Sweet Deleted",
      description: "Sweet has been removed from the catalog",
      variant: "default"
    });
  };

  const handleRestockSweet = (id, newStock) => {
    setSweets(prev => prev.map(sweet => 
      sweet.id === id ? { ...sweet, stock: newStock } : sweet
    ));
    toast({
      title: "Stock Updated",
      description: "Sweet stock has been updated successfully",
      variant: "default"
    });
  };

  const handleAddSweet = (newSweet) => {
    const sweet = {
      ...newSweet,
      id: Math.max(...sweets.map(s => s.id)) + 1,
      featured: false,
      rating: 4.5,
      reviews: 0
    };
    setSweets(prev => [...prev, sweet]);
    toast({
      title: "Sweet Added",
      description: "New sweet has been added to the catalog",
      variant: "default"
    });
  };

  const handleEditSweet = (updatedSweet) => {
    setSweets(prev => prev.map(sweet => 
      sweet.id === updatedSweet.id ? updatedSweet : sweet
    ));
    toast({
      title: "Sweet Updated",
      description: "Sweet information has been updated successfully",
      variant: "default"
    });
  };

  const categories = ['all', 'Indian Sweets', 'Chocolates', 'Cupcakes', 'Gummies', 'Candies'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your sweet shop inventory
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Sweet
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sweets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sweets.length}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">
                  {sweets.filter(s => s.stock <= 5 && s.stock > 0).length}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {sweets.filter(s => s.stock === 0).length}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                <Package className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Featured</p>
                <p className="text-2xl font-bold text-green-600">
                  {sweets.filter(s => s.featured).length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sweets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sweets Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sweet Inventory ({filteredSweets.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sweet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredSweets.map((sweet, index) => (
                    <motion.tr
                      key={sweet.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={sweet.image}
                            alt={sweet.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {sweet.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {sweet.weight}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {sweet.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ₹{sweet.price}
                          {sweet.originalPrice > sweet.price && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              ₹{sweet.originalPrice}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={sweet.stock}
                            onChange={(e) => handleRestockSweet(sweet.id, parseInt(e.target.value))}
                            className="w-20 text-center"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            sweet.stock === 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : sweet.stock <= 5
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }
                        >
                          {sweet.stock === 0 ? 'Out of Stock' : sweet.stock <= 5 ? 'Low Stock' : 'In Stock'}
                        </Badge>
                        {sweet.featured && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Featured
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSweet(sweet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSweet(sweet.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Sweet Modal */}
      <AddSweetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSweet}
      />

      {/* Edit Sweet Modal */}
      <AddSweetModal
        isOpen={!!editingSweet}
        onClose={() => setEditingSweet(null)}
        onAdd={handleEditSweet}
        editingSweet={editingSweet}
      />
    </div>
  );
};

export default AdminPanel;