import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  subscribeToProducts,
} from "../../services/index/products";
import { supabase } from "../../config/supabase";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]); // TODO: migrate categories to Supabase
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [productsSub, setProductsSub] = useState(null);

  // Fetch user and products on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const dbProducts = await fetchProducts(user.id);
          setProducts(dbProducts || []);
        }
      } catch (error) {
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    if (productsSub) productsSub.unsubscribe();
    const sub = subscribeToProducts(userId, async () => {
      const dbProducts = await fetchProducts(userId);
      setProducts(dbProducts || []);
    });
    setProductsSub(sub);
    return () => sub.unsubscribe();
  }, [userId]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to delete");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedProducts.length} products?`
      )
    ) {
      try {
        await Promise.all(
          selectedProducts.map((productId) => deleteProduct(productId))
        );
        toast.success(
          `${selectedProducts.length} products deleted successfully`
        );
        setSelectedProducts([]);
      } catch (error) {
        toast.error("Failed to delete some products");
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (product.category?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (product.model?.toLowerCase() || "").includes(searchTerm.toLowerCase())
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
              onClick={() => navigate("/products/add")}
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

              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Select</th>
                    <th className="px-4 py-2">Brand</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Model</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Cost Price</th>
                    <th className="px-4 py-2">Selling Price</th>
                    <th className="px-4 py-2">Rack Location</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {product.brand || "No Brand"}
                      </td>
                      <td className="px-4 py-2">
                        {product.category || "Uncategorized"}
                      </td>
                      <td className="px-4 py-2">
                        {product.model || "No Model"}
                      </td>
                      <td className="px-4 py-2">{product.quantity || 0}</td>
                      <td className="px-4 py-2">${product.costPrice || 0}</td>
                      <td className="px-4 py-2">
                        ${product.sellingPrice || 0}
                      </td>
                      <td className="px-4 py-2">
                        {product.rackLocation || "Not specified"}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            navigate(`/products/edit/${product.id}`)
                          }
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
