import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import toast from 'react-hot-toast';
import { userActions } from '../store/reducers/userReducers';

const GoogleSignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation({
    mutationFn: async () => {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
      
      // Send user data to backend
      const response = await fetch('/api/users/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          picture: user.photoURL,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign in with Google');
      }

      return response.json();
    },
    onSuccess: (data) => {
      dispatch(userActions.setUserInfo(data));
      localStorage.setItem('account', JSON.stringify(data));
      toast.success('Successfully signed in with Google!');
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    },
  });

  const handleGoogleSignIn = () => {
    mutate();
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full bg-white text-gray-700 border border-gray-300 rounded-lg px-6 py-3 font-medium hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <FaGoogle className="text-xl text-red-600" />
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </button>
  );
};

export default GoogleSignIn; 