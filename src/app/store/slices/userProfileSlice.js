// store/slices/userProfileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

// Update user profile in Firestore
export const updateUserProfile = createAsyncThunk(
  'userProfile/update',
  async ({ uid, updates }, { rejectWithValue }) => {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
      return updates;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user's subscription/payment info from Firestore
export const fetchSubscriptionStatus = createAsyncThunk(
  'userProfile/fetchSubscription',
  async (uid, { rejectWithValue }) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          plan:           data.plan ?? 'free',
          subscriptionId: data.subscriptionId ?? null,
          billingCycle:   data.billingCycle ?? null,
          planExpiresAt:  data.planExpiresAt ?? null,
          paymentStatus:  data.paymentStatus ?? null,
        };
      }
      return rejectWithValue('User not found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState: {
    plan:           'free',   // 'free' | 'pro' | 'enterprise'
    subscriptionId: null,
    billingCycle:   null,     // 'monthly' | 'annual'
    planExpiresAt:  null,
    paymentStatus:  null,     // 'active' | 'past_due' | 'canceled'
    isLoading:      false,
    error:          null,
  },
  reducers: {
    // Directly set/update the plan in Redux
    setPlan(state, action) {
      state.plan           = action.payload.plan ?? state.plan;
      state.billingCycle   = action.payload.billingCycle ?? state.billingCycle;
      state.planExpiresAt  = action.payload.planExpiresAt ?? state.planExpiresAt;
      state.paymentStatus  = action.payload.paymentStatus ?? state.paymentStatus;
    },
    // Reset profile to default
    resetProfile(state) {
      state.plan           = 'free';
      state.subscriptionId = null;
      state.billingCycle   = null;
      state.planExpiresAt  = null;
      state.paymentStatus  = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.isLoading      = false;
        state.plan           = action.payload.plan;
        state.subscriptionId = action.payload.subscriptionId;
        state.billingCycle   = action.payload.billingCycle;
        state.planExpiresAt  = action.payload.planExpiresAt;
        state.paymentStatus  = action.payload.paymentStatus;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export const { setPlan, resetProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
