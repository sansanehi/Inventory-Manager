import React, { useState, useEffect, useCallback } from "react";
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaPlus,
  FaUserPlus,
  FaChartBar,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { productsStore, transactionsStore } from "../../store/localStore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    stockIn: 0,
    stockOut: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(() => {
    setLoading(true);
    try {
      // Fetch products
      const products = productsStore.getAll();

      // Calculate statistics
      const totalProducts = products.length;
      const lowStock = products.filter((p) => p.quantity < 10).length;

      // Fetch transactions
      const transactions = transactionsStore.getAll();

      // Calculate stock in/out
      const stockIn = transactions.filter((t) => t.type === "in").length;
      const stockOut = transactions.filter((t) => t.type === "out").length;

      // Update stats
      setStats({
        totalProducts,
        lowStock,
        stockIn,
        stockOut,
      });

      // Process chart data
      const chartData = processChartData(transactions);
      setChartData(chartData);

      // Process recent activity
      const activity = processRecentActivity(transactions);
      setRecentActivity(activity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, timeRange]);

  const processChartData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Group transactions by date and type
    const groupedData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, stockIn: 0, stockOut: 0 };
      }
      if (transaction.type === "in") {
        acc[date].stockIn += transaction.quantity;
      } else {
        acc[date].stockOut += transaction.quantity;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(groupedData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Get last 7 days
  };

  const processRecentActivity = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    return transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        description: `${
          transaction.type === "in" ? "Stock in" : "Stock out"
        } of ${transaction.quantity} units for ${transaction.productName}`,
        time: new Date(transaction.timestamp).toLocaleString(),
      }));
  };

  const handleAddProduct = () => {
    navigate("/products");
  };

  const handleCreateOrder = () => {
    navigate("/orders/new");
  };

  const handleAddCustomer = () => {
    navigate("/customers");
  };

  const handleGenerateReport = () => {
    navigate("/reports");
  };

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
      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-2">
          {["day", "week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalProducts}</h3>
            </div>
            <FaBox className="text-3xl text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <h3 className="text-2xl font-bold mt-1">{stats.lowStock}</h3>
            </div>
            <FaArrowDown className="text-3xl text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock In</p>
              <h3 className="text-2xl font-bold mt-1">{stats.stockIn}</h3>
            </div>
            <FaArrowUp className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock Out</p>
              <h3 className="text-2xl font-bold mt-1">{stats.stockOut}</h3>
            </div>
            <FaArrowDown className="text-3xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Stock Movement Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Stock Movement</h2>
          <FaChartLine className="text-primary" />
        </div>
        <div className="h-80">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No stock movement data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="stockIn"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Stock In"
                />
                <Line
                  type="monotone"
                  dataKey="stockOut"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Stock Out"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-2">
                Start by adding products or creating transactions
              </p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b pb-4 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "in" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <p className="text-gray-700">{activity.description}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Product</h2>
              <FaPlus className="text-primary text-xl" />
            </div>
            <p className="text-gray-600 mb-4">
              Add new products to your inventory with details like brand, model,
              and pricing.
            </p>
            <button
              onClick={handleAddProduct}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Add Product
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Order</h2>
              <FaShoppingCart className="text-primary text-xl" />
            </div>
            <p className="text-gray-600 mb-4">
              Create new orders for your customers and manage your sales
              process.
            </p>
            <button
              onClick={handleCreateOrder}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Create Order
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Customer</h2>
              <FaUserPlus className="text-primary text-xl" />
            </div>
            <p className="text-gray-600 mb-4">
              Add new customers to your database and manage their information.
            </p>
            <button
              onClick={handleAddCustomer}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Add Customer
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generate Report</h2>
              <FaChartBar className="text-primary text-xl" />
            </div>
            <p className="text-gray-600 mb-4">
              Generate detailed reports about your inventory, sales, and
              customer data.
            </p>
            <button
              onClick={handleGenerateReport}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
