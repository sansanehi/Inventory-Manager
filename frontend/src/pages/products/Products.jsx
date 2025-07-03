import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { productsStore } from '../../store/localStore';
import { categoriesStore } from '../../store/localStore';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    brand: '',
    category: '',
    model: '',
    quantity: '',
    costPrice: '',
    sellingPrice: '',
    rackLocation: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = () => {
    try {
      const productsList = productsStore.getAll();
      setProducts(productsList);
      setSelectedProducts([]); // Reset selections when products are fetched
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = () => {
    try {
      const categoriesList = categoriesStore.getAll();
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        selectedProducts.forEach(productId => {
          productsStore.delete(productId);
        });
        toast.success(`${selectedProducts.length} products deleted successfully`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting products:', error);
        toast.error('Failed to delete some products');
      }
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    
    try {
      // Convert numeric fields
      const processedProduct = {
        ...newProduct,
        quantity: Number(newProduct.quantity) || 0,
        costPrice: Number(newProduct.costPrice) || 0,
        sellingPrice: Number(newProduct.sellingPrice) || 0
      };

      productsStore.add(processedProduct);
      toast.success('Product added successfully');
      setNewProduct({
        brand: '',
        category: '',
        model: '',
        quantity: '',
        costPrice: '',
        sellingPrice: '',
        rackLocation: '',
        description: ''
      });
      setShowAddModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    
    try {
      // Convert numeric fields
      const processedProduct = {
        ...editingProduct,
        quantity: Number(editingProduct.quantity) || 0,
        costPrice: Number(editingProduct.costPrice) || 0,
        sellingPrice: Number(editingProduct.sellingPrice) || 0
      };

      productsStore.update(editingProduct.id, processedProduct);
      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        productsStore.delete(productId);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    (product.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (product.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (product.model?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex space-x-4">
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete Selected ({selectedProducts.length})
              </button>
            )}
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No products found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Select All Checkbox */}
              <div className="p-4 bg-gray-50 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Select All ({filteredProducts.length} products)
                </span>
              </div>

              {filteredProducts.map((product) => (
                <div key={product.id} className="p-6">
                  {editingProduct?.id === product.id ? (
                    <form onSubmit={handleUpdateProduct} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand
                          </label>
                          <input
                            type="text"
                            value={editingProduct.brand || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={editingProduct.category || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model
                          </label>
                          <input
                            type="text"
                            value={editingProduct.model || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={editingProduct.quantity || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cost Price
                          </label>
                          <input
                            type="number"
                            value={editingProduct.costPrice || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Selling Price
                          </label>
                          <input
                            type="number"
                            value={editingProduct.sellingPrice || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rack Location
                          </label>
                          <input
                            type="text"
                            value={editingProduct.rackLocation || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, rackLocation: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        {/* Display any additional fields from import */}
                        {Object.entries(editingProduct)
                          .filter(([key]) => !['id', 'brand', 'category', 'model', 'quantity', 'costPrice', 'sellingPrice', 'rackLocation', 'description'].includes(key))
                          .map(([key, value]) => (
                            <div key={key}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {key}
                              </label>
                              <input
                                type="text"
                                value={value || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, [key]: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          ))}
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
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
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                        />
                        <div>
                          <h3 className="text-lg font-medium">{product.brand || 'No Brand'} - {product.model || 'No Model'}</h3>
                          <p className="text-gray-600">Category: {product.category || 'Uncategorized'}</p>
                          <p className="text-gray-600">Quantity: {product.quantity || 0}</p>
                          <p className="text-gray-600">Cost Price: ${product.costPrice || 0}</p>
                          <p className="text-gray-600">Selling Price: ${product.sellingPrice || 0}</p>
                          <p className="text-gray-600">Rack Location: {product.rackLocation || 'Not specified'}</p>
                          {/* Display any additional fields from import */}
                          {Object.entries(product)
                            .filter(([key]) => !['id', 'brand', 'category', 'model', 'quantity', 'costPrice', 'sellingPrice', 'rackLocation', 'description'].includes(key))
                            .map(([key, value]) => (
                              <p key={key} className="text-gray-600">
                                {key}: {value || 'Not specified'}
                              </p>
                            ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-primary hover:text-primary-dark"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={newProduct.model}
                  onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price
                </label>
                <input
                  type="number"
                  value={newProduct.costPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price
                </label>
                <input
                  type="number"
                  value={newProduct.sellingPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rack Location
                </label>
                <input
                  type="text"
                  value={newProduct.rackLocation}
                  onChange={(e) => setNewProduct({ ...newProduct, rackLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products; 