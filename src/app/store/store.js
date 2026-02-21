// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userProfileReducer from './slices/userProfileSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userProfile: userProfileReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Firebase Timestamp objects are non-serializable — ignore these paths
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/signup/fulfilled',
          'auth/fetchProfile/fulfilled',
        ],
        ignoredPaths: ['auth.user.createdAt'],
      },
    }),
});
