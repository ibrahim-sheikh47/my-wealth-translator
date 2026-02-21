import { useSelector, useDispatch } from 'react-redux';
import { useRouter }                from 'next/navigation';
import {
  loginUser,
  signupUser,
  logoutUser,
  forgotPassword,
  clearError,
} from '@/app/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const router   = useRouter();

  const { user, isAuthenticated, isLoading, isInitialized, error } =
    useSelector((state) => state.auth);

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      router.replace('/');
      return { success: true };
    }
    return { success: false, error: result.payload };
  };

  // app/hooks/useAuth.js
const signup = async (formData) => {
  const result = await dispatch(signupUser(formData));
  if (signupUser.fulfilled.match(result)) {
    // Change '/' to '/payment'
    router.replace('/payment');
    return { success: true };
  }
  return { success: false, error: result.payload };
};

  const logout = async () => {
    await dispatch(logoutUser());
    router.replace('/splash');
  };

  const sendResetEmail = async (email) => {
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      return { success: true };
    }
    return { success: false, error: result.payload };
  };

  const dismissError = () => dispatch(clearError());

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    signup,
    logout,
    sendResetEmail,
    dismissError,
  };
}