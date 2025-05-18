import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout as logoutAction,
} from '../slices/authSlice';
import { toast } from 'react-hot-toast';

// Mock login action
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    const mockUser = {
      uid: '123',
      email: credentials.email,
      displayName: 'Test User',
      photoURL: 'https://via.placeholder.com/150'
    };
    
    dispatch(loginSuccess(mockUser));
    toast.success('Login successful');
  } catch (error) {
    dispatch(loginFailure(error.message));
    toast.error(error.message || 'Login failed');
    throw error;
  }
};

// Mock Google login action
export const loginWithGoogle = () => async (dispatch) => {
  try {
    dispatch(loginStart());
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful Google login
    const mockUser = {
      uid: '456',
      email: 'test@gmail.com',
      displayName: 'Google Test User',
      photoURL: 'https://via.placeholder.com/150'
    };
    
    dispatch(loginSuccess(mockUser));
    toast.success('Google login successful');
  } catch (error) {
    dispatch(loginFailure(error.message));
    toast.error(error.message || 'Google login failed');
    throw error;
  }
};

// Mock register action
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(registerStart());
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock successful registration
    const mockUser = {
      uid: '789',
      email: userData.email,
      displayName: userData.name,
      photoURL: 'https://via.placeholder.com/150'
    };
    dispatch(registerSuccess(mockUser));
    toast.success('Registration successful');
  } catch (error) {
    dispatch(registerFailure(error.message));
    toast.error(error.message || 'Registration failed');
    throw error;
  }
};

export const logout = () => async (dispatch) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch(logoutAction());
    toast.success('Logged out successfully');
  } catch (error) {
    toast.error('Logout failed');
    throw error;
  }
}; 