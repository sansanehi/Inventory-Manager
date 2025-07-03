import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { customersStore } from '../../store/localStore';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    try {
      const customersList = customersStore.getAll();
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      customersStore.add(newCustomer);
      toast.success('Customer added successfully');
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
      setShowAddModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
  };

  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    if (!editingCustomer.name.trim() || !editingCustomer.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      customersStore.update(editingCustomer.id, editingCustomer);
      toast.success('Customer updated successfully');
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        customersStore.delete(customerId);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold">Customers</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Customer
        </button>
      </div>

      {/* Search Bar */}
        <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
      </div>

        {/* Customers List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No customers found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-6">
                  {editingCustomer?.id === customer.id ? (
                    <form onSubmit={handleUpdateCustomer} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={editingCustomer.name}
                            onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={editingCustomer.email}
                            onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={editingCustomer.phone}
                            onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            value={editingCustomer.address}
                            onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={editingCustomer.notes}
                          onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          rows="3"
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setEditingCustomer(null)}
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
                        <h3 className="text-lg font-medium">{customer.name}</h3>
                        <p className="text-gray-600">{customer.email}</p>
                        {customer.phone && (
                          <p className="text-gray-600">{customer.phone}</p>
                        )}
                        {customer.address && (
                          <p className="text-gray-600">{customer.address}</p>
                        )}
                        {customer.notes && (
                          <p className="text-gray-600 mt-2">{customer.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-primary hover:text-primary-dark"
                        >
                    <FaEdit />
                  </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
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
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers; 