import React, { useState, useEffect, useCallback } from "react";
import {
  FaSave,
  FaUser,
  FaStore,
  FaBell,
  FaLock,
  FaPalette,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { supabase } from "../../config/supabase";
import {
  fetchSettings,
  upsertSettings,
  subscribeToSettings,
} from "../../services/index/settings";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    profile: {
      name: "",
      email: "",
      phone: "",
      role: "",
    },
    store: {
      storeName: "",
      address: "",
      phone: "",
      email: "",
      taxId: "",
      currency: "USD",
    },
    notifications: {
      emailNotifications: true,
      lowStockAlerts: true,
      orderUpdates: true,
      salesReports: true,
      alertThreshold: 10,
    },
    security: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactorAuth: false,
    },
    appearance: {
      theme: "light",
      primaryColor: "#3B82F6",
      fontSize: "medium",
      compactMode: false,
    },
  });
  const [userId, setUserId] = useState(null);
  const [settingsSub, setSettingsSub] = useState(null);

  // Fetch user and settings on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setSettings((prev) => ({
            ...prev,
            profile: {
              name: user.user_metadata?.name || "",
              email: user.email || "",
              phone: user.user_metadata?.phone || "",
              role: user.user_metadata?.role || "",
            },
          }));
          const dbSettings = await fetchSettings(user.id);
          if (dbSettings) {
            setSettings((prev) => ({ ...prev, ...dbSettings.settings }));
          }
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    if (settingsSub) settingsSub.unsubscribe();
    const sub = subscribeToSettings(userId, (newSettings) => {
      if (newSettings && newSettings.settings) {
        setSettings((prev) => ({ ...prev, ...newSettings.settings }));
      }
    });
    setSettingsSub(sub);
    return () => sub.unsubscribe();
  }, [userId]);

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSaveSettings = useCallback(async () => {
    setLoading(true);
    try {
      if (!userId) throw new Error("User not found");
      // Save all settings except profile to Supabase
      await upsertSettings(userId, {
        settings: { ...settings, profile: undefined },
      });
      // Update profile info in Supabase Auth
      await supabase.auth.updateUser({
        data: {
          name: settings.profile.name,
          phone: settings.profile.phone,
          role: settings.profile.role,
        },
        email: settings.profile.email,
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  }, [settings, userId]);

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
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
            disabled={loading}
          >
            <FaSave className="mr-2" />
            Save Changes
          </button>
        </div>

        {/* Settings Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === "profile"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              <FaUser />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === "store"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              <FaStore />
              <span>Store</span>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === "notifications"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              <FaBell />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === "security"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              <FaLock />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === "appearance"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              <FaPalette />
              <span>Appearance</span>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) =>
                      handleInputChange("profile", "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      handleInputChange("profile", "email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) =>
                      handleInputChange("profile", "phone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={settings.profile.role}
                    onChange={(e) =>
                      handleInputChange("profile", "role", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "store" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Store Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.store.storeName}
                    onChange={(e) =>
                      handleInputChange("store", "storeName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.store.address}
                    onChange={(e) =>
                      handleInputChange("store", "address", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.store.phone}
                    onChange={(e) =>
                      handleInputChange("store", "phone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.store.email}
                    onChange={(e) =>
                      handleInputChange("store", "email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    value={settings.store.taxId}
                    onChange={(e) =>
                      handleInputChange("store", "taxId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={settings.store.currency}
                    onChange={(e) =>
                      handleInputChange("store", "currency", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                Notification Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) =>
                        handleInputChange(
                          "notifications",
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Low Stock Alerts</h3>
                    <p className="text-sm text-gray-500">
                      Get notified when inventory is low
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.lowStockAlerts}
                      onChange={(e) =>
                        handleInputChange(
                          "notifications",
                          "lowStockAlerts",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Order Updates</h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications for order status changes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderUpdates}
                      onChange={(e) =>
                        handleInputChange(
                          "notifications",
                          "orderUpdates",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sales Reports</h3>
                    <p className="text-sm text-gray-500">
                      Receive daily/weekly sales reports
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.salesReports}
                      onChange={(e) =>
                        handleInputChange(
                          "notifications",
                          "salesReports",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    value={settings.notifications.alertThreshold}
                    onChange={(e) =>
                      handleInputChange(
                        "notifications",
                        "alertThreshold",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={settings.security.currentPassword}
                    onChange={(e) =>
                      handleInputChange(
                        "security",
                        "currentPassword",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={settings.security.newPassword}
                    onChange={(e) =>
                      handleInputChange(
                        "security",
                        "newPassword",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={settings.security.confirmPassword}
                    onChange={(e) =>
                      handleInputChange(
                        "security",
                        "confirmPassword",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) =>
                        handleInputChange(
                          "security",
                          "twoFactorAuth",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                Appearance Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) =>
                      handleInputChange("appearance", "theme", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) =>
                        handleInputChange(
                          "appearance",
                          "primaryColor",
                          e.target.value
                        )
                      }
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.appearance.primaryColor}
                      onChange={(e) =>
                        handleInputChange(
                          "appearance",
                          "primaryColor",
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size
                  </label>
                  <select
                    value={settings.appearance.fontSize}
                    onChange={(e) =>
                      handleInputChange(
                        "appearance",
                        "fontSize",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Compact Mode</h3>
                    <p className="text-sm text-gray-500">
                      Reduce spacing and padding for a more compact layout
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.appearance.compactMode}
                      onChange={(e) =>
                        handleInputChange(
                          "appearance",
                          "compactMode",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
