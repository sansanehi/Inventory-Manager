import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  addProduct,
  updateProduct,
  fetchProducts,
  fetchCategories,
} from "../../services/index/products";
import { supabase } from "../../config/supabase";
import InventoryImage from "../../assets/HeroImage.svg"; // Use your inventory image asset

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [product, setProduct] = useState({
    brand: "",
    category: "",
    model: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    description: "",
  });
  const [categories, setCategories] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);
        if (!user)
          throw new Error("You must be logged in to add or edit products.");
        setUserId(user.id);
        if (id) {
          const products = await fetchProducts(user.id);
          const existingProduct = products.find((p) => p.id === id);
          if (existingProduct) {
            setProduct(existingProduct);
          } else {
            setNotFound(true);
            return;
          }
        }
        // Fetch categories from Supabase
        const cats = await fetchCategories();
        setCategories(cats || []);
      } catch (error) {
        toast.error(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      const requiredFields = [
        "brand",
        "category",
        "model",
        "quantity",
        "costPrice",
        "sellingPrice",
      ];
      const missingFields = requiredFields.filter((field) => !product[field]);
      if (missingFields.length > 0) {
        toast.error(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        setLoading(false);
        return;
      }
      // Convert numeric fields
      const numericFields = ["quantity", "costPrice", "sellingPrice"];
      const processedProduct = {
        ...product,
        ...numericFields.reduce(
          (acc, field) => ({
            ...acc,
            [field]: Number(product[field]),
          }),
          {}
        ),
      };
      if (id) {
        // Update existing product
        await updateProduct(id, processedProduct);
        toast.success("Product updated successfully");
      } else {
        // Add new product
        if (!userId) throw new Error("User not found");
        await addProduct(userId, processedProduct);
        toast.success("Product added successfully");
      }
      navigate("/products");
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-lg p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {id ? "Edit Product" : "Add New Product"}
          </h1>
          <button
            onClick={() => navigate("/products")}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>
        {notFound ? (
          <div className="text-center text-red-600 text-lg font-semibold py-8">
            Product not found or you do not have access.
            <br />
            <button
              onClick={() => navigate("/products")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Products
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={product.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.category}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={product.model}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={product.id ? product.id : "Will be generated"}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={product.costPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={product.sellingPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mt-8 text-lg font-semibold"
              disabled={loading}
            >
              {loading
                ? id
                  ? "Saving..."
                  : "Adding..."
                : id
                ? "Save Changes"
                : "Add Product"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
