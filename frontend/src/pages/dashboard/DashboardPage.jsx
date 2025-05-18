import React from 'react';
import { useSelector } from 'react-redux';
import MainLayout from '../../components/MainLayout';
import { FaBox, FaShoppingCart, FaUsers, FaChartLine } from 'react-icons/fa';

const DashboardPage = () => {
  const { userInfo } = useSelector((state) => state.user);

  // Mock data for dashboard
  const dashboardData = {
    totalProducts: 156,
    lowStock: 12,
    totalOrders: 45,
    revenue: '$12,450'
  };

  const recentActivity = [
    { id: 1, type: 'order', message: 'New order #1234 received', time: '2 hours ago' },
    { id: 2, type: 'stock', message: 'Product "Laptop" is low in stock', time: '4 hours ago' },
    { id: 3, type: 'user', message: 'New user registered', time: '5 hours ago' },
    { id: 4, type: 'product', message: 'New product "Monitor" added', time: '1 day ago' }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {userInfo?.name}!</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBox className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Total Products</h2>
                <p className="text-2xl font-semibold">{dashboardData.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaShoppingCart className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Low Stock Items</h2>
                <p className="text-2xl font-semibold">{dashboardData.lowStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaUsers className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Total Orders</h2>
                <p className="text-2xl font-semibold">{dashboardData.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaChartLine className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Revenue</h2>
                <p className="text-2xl font-semibold">{dashboardData.revenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'stock' ? 'bg-red-100 text-red-600' :
                    activity.type === 'user' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'order' && <FaShoppingCart className="w-4 h-4" />}
                    {activity.type === 'stock' && <FaBox className="w-4 h-4" />}
                    {activity.type === 'user' && <FaUsers className="w-4 h-4" />}
                    {activity.type === 'product' && <FaBox className="w-4 h-4" />}
                  </div>
                  <p className="ml-4">{activity.message}</p>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage; 