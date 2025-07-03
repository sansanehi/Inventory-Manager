// Local storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'inventory_products',
  TRANSACTIONS: 'inventory_transactions',
  USERS: 'inventory_users',
  CURRENT_USER: 'inventory_current_user',
  CATEGORIES: 'inventory_categories',
  CUSTOMERS: 'inventory_customers',
  ORDERS: 'inventory_orders'
};

// Helper functions
const getItem = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : [];
};

const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize empty storage if not exists
const initializeStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    if (!localStorage.getItem(key)) {
      setItem(key, []);
    }
  });
};

// Call initialization
initializeStorage();

// Products
const productsStore = {
  getAll: () => getItem(STORAGE_KEYS.PRODUCTS),
  add: (product) => {
    const products = productsStore.getAll();
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setItem(STORAGE_KEYS.PRODUCTS, [...products, newProduct]);
    return newProduct;
  },
  update: (id, updates) => {
    const products = productsStore.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updatedProduct = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    products[index] = updatedProduct;
    setItem(STORAGE_KEYS.PRODUCTS, products);
    return updatedProduct;
  },
  delete: (id) => {
    const products = productsStore.getAll();
    const filteredProducts = products.filter(p => p.id !== id);
    setItem(STORAGE_KEYS.PRODUCTS, filteredProducts);
  },
  clearAll: () => {
    setItem(STORAGE_KEYS.PRODUCTS, []);
  }
};

// Categories
const categoriesStore = {
  getAll: () => getItem(STORAGE_KEYS.CATEGORIES),
  add: (category) => {
    const categories = categoriesStore.getAll();
    const newCategory = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setItem(STORAGE_KEYS.CATEGORIES, [...categories, newCategory]);
    return newCategory;
  },
  update: (id, updates) => {
    const categories = categoriesStore.getAll();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const updatedCategory = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    categories[index] = updatedCategory;
    setItem(STORAGE_KEYS.CATEGORIES, categories);
    return updatedCategory;
  },
  delete: (id) => {
    const categories = categoriesStore.getAll();
    const filteredCategories = categories.filter(c => c.id !== id);
    setItem(STORAGE_KEYS.CATEGORIES, filteredCategories);
  },
  clearAll: () => {
    setItem(STORAGE_KEYS.CATEGORIES, []);
  }
};

// Customers
const customersStore = {
  getAll: () => getItem(STORAGE_KEYS.CUSTOMERS),
  add: (customer) => {
    const customers = customersStore.getAll();
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setItem(STORAGE_KEYS.CUSTOMERS, [...customers, newCustomer]);
    return newCustomer;
  },
  update: (id, updates) => {
    const customers = customersStore.getAll();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const updatedCustomer = {
      ...customers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    customers[index] = updatedCustomer;
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return updatedCustomer;
  },
  delete: (id) => {
    const customers = customersStore.getAll();
    const filteredCustomers = customers.filter(c => c.id !== id);
    setItem(STORAGE_KEYS.CUSTOMERS, filteredCustomers);
  },
  clearAll: () => {
    setItem(STORAGE_KEYS.CUSTOMERS, []);
  }
};

// Transactions
const transactionsStore = {
  getAll: () => getItem(STORAGE_KEYS.TRANSACTIONS),
  add: (transaction) => {
    const transactions = transactionsStore.getAll();
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setItem(STORAGE_KEYS.TRANSACTIONS, [...transactions, newTransaction]);
    return newTransaction;
  },
  clearAll: () => {
    setItem(STORAGE_KEYS.TRANSACTIONS, []);
  }
};

// Users
const usersStore = {
  getAll: () => getItem(STORAGE_KEYS.USERS),
  add: (user) => {
    const users = usersStore.getAll();
    const newUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setItem(STORAGE_KEYS.USERS, [...users, newUser]);
    return newUser;
  },
  findByEmail: (email) => {
    const users = usersStore.getAll();
    return users.find(u => u.email === email);
  },
  clearAll: () => {
    setItem(STORAGE_KEYS.USERS, []);
  }
};

// Auth
const authStore = {
  getCurrentUser: () => getItem(STORAGE_KEYS.CURRENT_USER),
  setCurrentUser: (user) => setItem(STORAGE_KEYS.CURRENT_USER, user),
  clearCurrentUser: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER),
  login: (email, password) => {
    const user = usersStore.findByEmail(email);
    if (user && user.password === password) {
      authStore.setCurrentUser(user);
      return user;
    }
    throw new Error('Invalid email or password');
  },
  register: (userData) => {
    const existingUser = usersStore.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }
    const newUser = usersStore.add(userData);
    authStore.setCurrentUser(newUser);
    return newUser;
  },
  logout: () => {
    authStore.clearCurrentUser();
  }
};

// Orders Store
const ordersStore = {
  getAll: () => getItem(STORAGE_KEYS.ORDERS),
  add: (order) => {
    const orders = ordersStore.getAll();
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setItem(STORAGE_KEYS.ORDERS, [...orders, newOrder]);
    return newOrder;
  },
  update: (id, updatedOrder) => {
    const orders = ordersStore.getAll();
    const index = orders.findIndex(order => order.id === id);
    if (index !== -1) {
      orders[index] = { 
        ...orders[index], 
        ...updatedOrder,
        updatedAt: new Date().toISOString()
      };
      setItem(STORAGE_KEYS.ORDERS, orders);
      return orders[index];
    }
    return null;
  },
  delete: (id) => {
    const orders = ordersStore.getAll();
    const filteredOrders = orders.filter(order => order.id !== id);
    setItem(STORAGE_KEYS.ORDERS, filteredOrders);
  },
  clearAll: () => {
    setItem(STORAGE_KEYS.ORDERS, []);
  }
};

// Export all stores
export {
  productsStore,
  categoriesStore,
  customersStore,
  transactionsStore,
  ordersStore,
  usersStore,
  authStore
}; 