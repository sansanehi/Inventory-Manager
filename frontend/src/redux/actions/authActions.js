import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout as logoutAction,
} from "../slices/authSlice";
import { toast } from "react-hot-toast";
import { supabase } from "../../config/supabase";

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const { email, password } = credentials;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const user = data.user;
    dispatch(loginSuccess(user));
    toast.success("Login successful");
  } catch (error) {
    dispatch(loginFailure(error.message));
    toast.error(error.message || "Login failed");
    throw error;
  }
};

export const loginWithGoogle = () => async (dispatch) => {
  try {
    dispatch(loginStart());
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) throw error;
    // The user will be redirected to Google, so no need to dispatch success here
    toast.success("Redirecting to Google login...");
  } catch (error) {
    dispatch(loginFailure(error.message));
    toast.error(error.message || "Google login failed");
    throw error;
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(registerStart());
    const { email, password, name } = userData;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    // Handle Supabase duplicate email logic
    if (
      data &&
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      dispatch(registerFailure("Email is already registered. Please log in."));
      toast.error("Email is already registered. Please log in.");
      return;
    }
    if (error) {
      // Supabase duplicate email error message
      if (
        error.message &&
        (error.message.toLowerCase().includes("user already registered") ||
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("email"))
      ) {
        dispatch(registerFailure("Email is already registered"));
        toast.error("Email is already registered");
        return;
      }
      dispatch(registerFailure(error.message));
      toast.error(error.message || "Registration failed");
      return;
    }
    const user = data.user;
    dispatch(registerSuccess(user));
    toast.success(
      "Registration successful. Please check your email to verify your account."
    );
  } catch (error) {
    dispatch(registerFailure(error.message));
    toast.error(error.message || "Registration failed");
    throw error;
  }
};

export const logout = () => async (dispatch) => {
  try {
    await supabase.auth.signOut();
    dispatch(logoutAction());
    toast.success("Logged out successfully");
  } catch (error) {
    toast.error("Logout failed");
    throw error;
  }
};
