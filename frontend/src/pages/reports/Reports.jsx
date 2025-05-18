import React, { useState } from 'react';
import { FaDownload, FaChartBar, FaChartLine, FaChartPie } from 'react-icons/fa';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('sales');

  // Mock data - replace with actual data from your backend
  const reports = {
    sales: {
      title: 'Sales Report',
      period: 'Last 30 Days',
      total: '$45,678',
      change: '+12.5%',
      data: [
        { date: '2024-03-15', amount: 1500 },
        { date: '2024-03-14', amount: 1800 },
        { date: '2024-03-13', amount: 1200 },
        { date: '2024-03-12', amount: 2000 },
        { date: '2024-03-11', amount: 1600 }
      ]
    },
    inventory: {
      title: 'Inventory Report',
      period: 'Current Status',
      total: '1,234 items',
      change: '-5.2%',
      data: [
        { category: 'Electronics', count: 450 },
        { category: 'Clothing', count: 300 },
        { category: 'Books', count: 200 },
        { category: 'Home & Kitchen', count: 284 }
      ]
    },
    customers: {
      title: 'Customer Report',
      period: 'Last 30 Days',
      total: '890 customers',
      change: '+8.3%',
      data: [
        { type: 'New', count: 120 },
        { type: 'Returning', count: 450 },
        { type: 'Inactive', count: 320 }
      ]
    }
  };

  const reportTypes = [
    { id: 'sales', icon: <FaChartLine />, label: 'Sales' },
    { id: 'inventory', icon: <FaChartBar />, label: 'Inventory' },
    { id: 'customers', icon: <FaChartPie />, label: 'Customers' }
  ];

  const currentReport = reports[selectedReport];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2">
          <FaDownload />
          <span>Export Report</span>
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedReport(type.id)}
            className={`p-4 rounded-lg flex items-center space-x-3 transition-colors ${
              selectedReport === type.id
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{type.icon}</span>
            <span className="font-medium">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{currentReport.title}</h2>
            <p className="text-sm text-gray-500">{currentReport.period}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">{currentReport.total}</p>
            <p className={`text-sm ${
              currentReport.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentReport.change}
            </p>
          </div>
        </div>

        {/* Report Data Visualization */}
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart visualization will be implemented here</p>
        </div>

        {/* Report Data Table */}
        <div className="mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(currentReport.data[0]).map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentReport.data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports; 