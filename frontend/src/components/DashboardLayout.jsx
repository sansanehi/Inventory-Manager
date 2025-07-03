import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaHome,
  FaBox,
  FaList,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaBars,
  FaTimes,
  FaFileUpload,
} from "react-icons/fa";
import { logout } from "../redux/actions/authActions";

const sectionTitles = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/categories": "Categories",
  "/orders": "Orders",
  "/customers": "Customers",
  "/reports": "Reports",
  "/daily-data": "Epsi Sheet",
  "/data-import": "Data Import",
  "/settings": "Settings",
};

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const navigation = [
    { path: "/dashboard", icon: <FaHome />, label: "Dashboard" },
    { path: "/products", icon: <FaBox />, label: "Products" },
    { path: "/categories", icon: <FaList />, label: "Categories" },
    { path: "/orders", icon: <FaShoppingCart />, label: "Orders" },
    { path: "/customers", icon: <FaUsers />, label: "Customers" },
    { path: "/reports", icon: <FaChartBar />, label: "Reports" },
    { path: "/daily-data", icon: <FaFileUpload />, label: "Epsi Sheet" },
    { path: "/data-import", icon: <FaFileUpload />, label: "Data Import" },
    { path: "/settings", icon: <FaCog />, label: "Settings" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Mock notifications data
  const notifications = [
    { id: 1, message: "New order received", time: "5 minutes ago" },
    { id: 2, message: "Low stock alert for Laptop", time: "1 hour ago" },
    { id: 3, message: "New customer registered", time: "2 hours ago" },
  ];

  // Determine section title
  let sectionTitle = "";
  const path = "/" + location.pathname.split("/")[1];
  if (sectionTitles[path]) {
    sectionTitle = sectionTitles[path];
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 justify-between w-full">
            {/* Left side - Menu button (only when sidebar closed) */}
            <div className="flex items-center min-w-[60px]">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FaBars size={20} />
                </button>
              )}
            </div>
            {/* Section Title - aligned with end of sidebar */}
            <div
              className={`flex-1 flex items-center ${
                isSidebarOpen ? "ml-64" : "ml-20"
              } transition-all duration-300`}
            >
              {sectionTitle && (
                <span className="text-xl font-bold text-blue-700">
                  {sectionTitle}
                </span>
              )}
            </div>
            {/* Center - Search Bar */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-2 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none relative"
                >
                  <FaBell size={20} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="px-4 py-3 hover:bg-gray-50"
                      >
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))}
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button className="text-sm text-primary hover:text-primary-dark">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <img
                    src={userInfo?.photo || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {userInfo?.name}
                  </span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white shadow-lg transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        } z-30`}
      >
        <div className="h-full flex flex-col relative">
          {/* Sidebar close button in top-right corner, above header */}
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="fixed left-64 top-14 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-50 bg-white rounded-full shadow p-2"
              style={{ marginLeft: "-20px" }}
            >
              <FaTimes size={20} />
            </button>
          )}
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
            >
              <FaSignOutAlt className="text-xl" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        } pt-16 min-h-screen`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
