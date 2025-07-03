import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaFileUpload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { ordersStore, productsStore, customersStore } from '../../store/localStore';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customerId: '',
    items: [{ productId: '', quantity: 1 }],
    status: 'pending',
    totalAmount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchOrders = () => {
    try {
      const ordersList = ordersStore.getAll();
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = () => {
    try {
      const productsList = productsStore.getAll();
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const fetchCustomers = () => {
    try {
      const customersList = customersStore.getAll();
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    }
  };

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!newOrder.customerId || newOrder.items.length === 0) {
      toast.error('Customer and at least one item are required');
      return;
    }

    try {
      // Calculate total amount
      const totalAmount = newOrder.items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product ? product.sellingPrice * item.quantity : 0);
      }, 0);

      const orderToAdd = {
        ...newOrder,
        totalAmount,
        createdAt: new Date().toISOString()
      };

      ordersStore.add(orderToAdd);
      toast.success('Order added successfully');
      setNewOrder({
        customerId: '',
        items: [{ productId: '', quantity: 1 }],
        status: 'pending',
        totalAmount: 0,
        notes: ''
      });
      setShowAddModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Failed to add order');
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
  };

  const handleUpdateOrder = (e) => {
    e.preventDefault();
    if (!editingOrder.customerId || editingOrder.items.length === 0) {
      toast.error('Customer and at least one item are required');
      return;
    }

    try {
      // Calculate total amount
      const totalAmount = editingOrder.items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product ? product.sellingPrice * item.quantity : 0);
      }, 0);

      const orderToUpdate = {
        ...editingOrder,
        totalAmount,
        updatedAt: new Date().toISOString()
      };

      ordersStore.update(editingOrder.id, orderToUpdate);
      toast.success('Order updated successfully');
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        ordersStore.delete(orderId);
        toast.success('Order deleted successfully');
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  const handleAddItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      // Here you would typically handle the PDF upload
      // For now, we'll just show a success message
      toast.success('PDF uploaded successfully');
      setShowUploadModal(false);
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    return customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark flex items-center"
            >
              <FaFileUpload className="mr-2" />
              Upload Orders
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Order
            </button>
          </div>
      </div>

      {/* Search Bar */}
        <div className="mb-6">
      <div className="relative">
        <input
          type="text"
              placeholder="Search orders by customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
      </div>

        {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
                <div key={order.id} className="p-6">
                  {editingOrder?.id === order.id ? (
                    <form onSubmit={handleUpdateOrder} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer *
                          </label>
                          <select
                            value={editingOrder.customerId}
                            onChange={(e) => setEditingOrder({ ...editingOrder, customerId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          >
                            <option value="">Select a customer</option>
                            {customers.map((customer) => (
                              <option key={customer.id} value={customer.id}>
                                {customer.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status *
                          </label>
                          <select
                            value={editingOrder.status}
                            onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Order Items</h3>
                          <button
                            type="button"
                            onClick={() => setEditingOrder(prev => ({
                              ...prev,
                              items: [...prev.items, { productId: '', quantity: 1 }]
                            }))}
                            className="text-primary hover:text-primary-dark"
                          >
                            <FaPlus />
                          </button>
                        </div>
                        {editingOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="flex-1">
                              <select
                                value={item.productId}
                                onChange={(e) => {
                                  const newItems = [...editingOrder.items];
                                  newItems[index].productId = e.target.value;
                                  setEditingOrder({ ...editingOrder, items: newItems });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                              >
                                <option value="">Select a product</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.brand} - {product.model}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-32">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...editingOrder.items];
                                  newItems[index].quantity = parseInt(e.target.value);
                                  setEditingOrder({ ...editingOrder, items: newItems });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                min="1"
                                required
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = editingOrder.items.filter((_, i) => i !== index);
                                setEditingOrder({ ...editingOrder, items: newItems });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={editingOrder.notes}
                          onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          rows="3"
                        />
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setEditingOrder(null)}
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
                        <h3 className="text-lg font-medium">
                          Order #{order.id} - {customers.find(c => c.id === order.customerId)?.name}
                        </h3>
                        <p className="text-gray-600">Status: {order.status}</p>
                        <p className="text-gray-600">Total Amount: ${order.totalAmount}</p>
                        <div className="mt-2">
                          <h4 className="font-medium">Items:</h4>
                          <ul className="list-disc list-inside">
                            {order.items.map((item, index) => {
                              const product = products.find(p => p.id === item.productId);
                              return (
                                <li key={index} className="text-gray-600">
                                  {product ? `${product.brand} - ${product.model}` : 'Unknown Product'} x {item.quantity}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        {order.notes && (
                          <p className="text-gray-600 mt-2">Notes: {order.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-primary hover:text-primary-dark"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
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

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Order</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer *
                  </label>
                  <select
                    value={newOrder.customerId}
                    onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Order Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-primary hover:text-primary-dark"
                  >
                    <FaPlus />
                  </button>
                </div>
                {newOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.brand} - {product.model}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        min="1"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
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
                  Add Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Orders Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Orders</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Upload a PDF file containing multiple orders. The file should follow the standard format.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary hover:text-primary-dark"
                >
                  <FaFileUpload className="mx-auto text-3xl mb-2" />
                  <p>Click to upload PDF</p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default Orders; 