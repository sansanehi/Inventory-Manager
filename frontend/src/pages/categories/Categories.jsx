import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { categoriesStore } from '../../store/localStore';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    try {
      const categoriesList = categoriesStore.getAll();
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      categoriesStore.add(newCategory);
      toast.success('Category added successfully');
      setNewCategory({ name: '', description: '' });
      setShowAddModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      categoriesStore.update(editingCategory.id, editingCategory);
      toast.success('Category updated successfully');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        categoriesStore.delete(categoryId);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Category
        </button>
      </div>

      {/* Search Bar */}
        <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
      </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No categories found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
        {filteredCategories.map((category) => (
                <div key={category.id} className="p-6">
                  {editingCategory?.id === category.id ? (
                    <form onSubmit={handleUpdateCategory} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          rows="3"
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
            <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-primary hover:text-primary-dark"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Category</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
      </div>
      )}
    </div>
  );
};

export default Categories; 