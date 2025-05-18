import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { loginWithGoogle } from '../redux/actions/authActions';
import { toast } from 'react-hot-toast';

const TestGoogleLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await dispatch(loginWithGoogle());
      toast.success('Successfully signed in with Google!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-3 md:px-6 md:py-3 font-medium hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base shadow-sm"
      style={{ minHeight: 48 }}
    >
      <FaGoogle className="text-lg md:text-xl text-red-600" />
      {isLoading ? 'Signing in...' : 'Sign in with Google (Test)'}
    </button>
  );
};

export default TestGoogleLogin; 