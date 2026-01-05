import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Categories from "./pages/categories/Categories";
import Orders from "./pages/orders/Orders";
import Customers from "./pages/customers/Customers";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import DataImport from "./pages/data-import/DataImport";
import DailyData from "./pages/daily-data/DailyData";

import AddProduct from "./pages/products/AddProduct";

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!userInfo ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!userInfo ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={userInfo ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="data-import" element={<DataImport />} />
          <Route path="daily-data" element={<DailyData />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
