import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaBox,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  productsStore,
  customersStore,
  ordersStore,
  transactionsStore,
} from "../../store/localStore";
import { toast } from "react-hot-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("sales");
  const [timeRange, setTimeRange] = useState("month");
  const [reportData, setReportData] = useState({
    sales: [],
    inventory: [],
    customers: [],
    products: [],
  });

  useEffect(() => {
    generateReports();
  }, [reportType, timeRange]);

  const generateReports = () => {
    setLoading(true);
    try {
      // Initialize stores if they don't exist
      const orders = ordersStore.getAll() || [];
      const products = productsStore.getAll() || [];
      const customers = customersStore.getAll() || [];
      const transactions = transactionsStore.getAll() || [];

      // Validate data
      if (
        !Array.isArray(orders) ||
        !Array.isArray(products) ||
        !Array.isArray(customers) ||
        !Array.isArray(transactions)
      ) {
        throw new Error("Invalid data format");
      }

      // Process data based on time range
      const filteredData = filterDataByTimeRange(orders, timeRange);

      // Generate different types of reports
      const salesData = generateSalesReport(filteredData);
      const inventoryData = generateInventoryReport(products);
      const customerData = generateCustomerReport(customers, filteredData);
      const productData = generateProductReport(products, filteredData);

      setReportData({
        sales: salesData,
        inventory: inventoryData,
        customers: customerData,
        products: productData,
      });
    } catch (error) {
      console.error("Error generating reports:", error);
      toast.error("Failed to generate reports. Please try again later.");
      // Set default empty data
      setReportData({
        sales: [],
        inventory: [],
        customers: [],
        products: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDataByTimeRange = (data, range) => {
    if (!Array.isArray(data)) return [];

    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return data.filter((item) => {
      if (!item || !item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return !isNaN(itemDate) && itemDate >= startDate;
    });
  };

  const generateSalesReport = (orders) => {
    if (!Array.isArray(orders)) return [];

    // Group orders by date and calculate daily totals
    const dailySales = orders.reduce((acc, order) => {
      if (!order || !order.createdAt || !order.totalAmount) return acc;

      const date = new Date(order.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Number(order.totalAmount) || 0;
      return acc;
    }, {});

    return Object.entries(dailySales).map(([date, amount]) => ({
      date,
      amount: Number(amount.toFixed(2)),
    }));
  };

  const generateInventoryReport = (products) => {
    if (!Array.isArray(products)) return [];

    // Group products by category and calculate stock levels
    const categoryStock = products.reduce((acc, product) => {
      if (!product || !product.category) return acc;

      if (!acc[product.category]) {
        acc[product.category] = 0;
      }
      acc[product.category] += Number(product.quantity) || 0;
      return acc;
    }, {});

    return Object.entries(categoryStock).map(([category, quantity]) => ({
      category,
      quantity: Number(quantity),
    }));
  };

  const generateCustomerReport = (customers, orders) => {
    if (!Array.isArray(customers) || !Array.isArray(orders)) return [];

    // Calculate customer purchase statistics
    return customers
      .map((customer) => {
        if (!customer || !customer.id) return null;

        const customerOrders = orders.filter(
          (order) => order && order.customerId === customer.id
        );
        const totalSpent = customerOrders.reduce(
          (sum, order) => sum + (Number(order.totalAmount) || 0),
          0
        );
        const orderCount = customerOrders.length;

        return {
          name: customer.name || "Unknown Customer",
          totalSpent: Number(totalSpent.toFixed(2)),
          orderCount,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  };

  const generateProductReport = (products, orders) => {
    if (!Array.isArray(products) || !Array.isArray(orders)) return [];

    // Calculate product sales statistics
    return products
      .map((product) => {
        if (!product || !product.id) return null;

        const productOrders = orders.filter(
          (order) =>
            order &&
            order.items &&
            Array.isArray(order.items) &&
            order.items.some((item) => item && item.productId === product.id)
        );
        const totalSold = productOrders.reduce((sum, order) => {
          const item = order.items.find(
            (item) => item && item.productId === product.id
          );
          return sum + (Number(item?.quantity) || 0);
        }, 0);

        return {
          name:
            product.name ||
            `${product.brand || ""} - ${product.model || "Unknown Product"}`,
          totalSold: Number(totalSold),
          currentStock: Number(product.quantity) || 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.totalSold - a.totalSold);
  };

  const handleDownloadReport = () => {
    // Create a CSV string based on the current report type
    let csvContent = "";
    const data = reportData[reportType];

    switch (reportType) {
      case "sales":
        csvContent = "Date,Amount\n";
        data.forEach((item) => {
          csvContent += `${item.date},${item.amount}\n`;
        });
        break;
      case "inventory":
        csvContent = "Category,Quantity\n";
        data.forEach((item) => {
          csvContent += `${item.category},${item.quantity}\n`;
        });
        break;
      case "customers":
        csvContent = "Customer,Total Spent,Order Count\n";
        data.forEach((item) => {
          csvContent += `${item.name},${item.totalSpent},${item.orderCount}\n`;
        });
        break;
      case "products":
        csvContent = "Product,Total Sold,Current Stock\n";
        data.forEach((item) => {
          csvContent += `${item.name},${item.totalSold},${item.currentStock}\n`;
        });
        break;
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}_report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="customers">Customer Report</option>
              <option value="products">Product Report</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
            >
              <FaDownload className="mr-2" />
              Download Report
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {reportType === "sales" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sales Report</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.sales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      name="Sales Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === "inventory" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Inventory Report</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.inventory}
                      dataKey="quantity"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label
                    >
                      {reportData.inventory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === "customers" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Customer Report</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.customers.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="totalSpent"
                      fill="#8884d8"
                      name="Total Spent"
                    />
                    <Bar
                      dataKey="orderCount"
                      fill="#82ca9d"
                      name="Order Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === "products" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Product Report</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.products.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSold" fill="#8884d8" name="Total Sold" />
                    <Bar
                      dataKey="currentStock"
                      fill="#82ca9d"
                      name="Current Stock"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <h3 className="text-2xl font-bold mt-1">
                    $
                    {reportData.sales
                      .reduce((sum, item) => sum + item.amount, 0)
                      .toFixed(2)}
                  </h3>
                </div>
                <FaDollarSign className="text-3xl text-primary" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {reportData.products.length}
                  </h3>
                </div>
                <FaBox className="text-3xl text-primary" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {reportData.customers.length}
                  </h3>
                </div>
                <FaUsers className="text-3xl text-primary" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {reportData.sales.length}
                  </h3>
                </div>
                <FaChartBar className="text-3xl text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
