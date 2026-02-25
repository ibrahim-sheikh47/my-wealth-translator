// store/slices/userProfileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

// ✅ FIX 1: Force fresh reads from Firestore server (not cache)
const FRESH_READ_OPTIONS = { source: 'server' };

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
      // ✅ FIX 1: Use { source: 'server' } to bypass cache and get latest data
      const userDoc = await getDoc(doc(db, 'users', uid), FRESH_READ_OPTIONS);

      if (userDoc.exists()) {
        const data = userDoc.data();

        // ✅ FIX 2: Log the actual data being returned for debugging
        console.log('[fetchSubscriptionStatus] Raw Firestore data:', {
          plan: data.plan,
          subscriptionId: data.subscriptionId,
          billingCycle: data.billingCycle,
          paymentStatus: data.paymentStatus,
          planExpiresAt: data.planExpiresAt,
        });

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
      console.error('[fetchSubscriptionStatus] Error:', error.message);
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
      state.subscriptionId = action.payload.subscriptionId ?? state.subscriptionId;
      state.billingCycle   = action.payload.billingCycle ?? state.billingCycle;
      state.planExpiresAt  = action.payload.planExpiresAt ?? state.planExpiresAt;
      state.paymentStatus  = action.payload.paymentStatus ?? state.paymentStatus;
      console.log('[setPlan] Redux state updated:', {
        plan: state.plan,
        billingCycle: state.billingCycle,
        paymentStatus: state.paymentStatus,
      });
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
        state.error     = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.isLoading      = false;
        state.plan           = action.payload.plan;
        state.subscriptionId = action.payload.subscriptionId;
        state.billingCycle   = action.payload.billingCycle;
        state.planExpiresAt  = action.payload.planExpiresAt;
        state.paymentStatus  = action.payload.paymentStatus;
        console.log('[fetchSubscriptionStatus.fulfilled] Redux updated to:', {
          plan: state.plan,
          paymentStatus: state.paymentStatus,
        });
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
        console.error('[fetchSubscriptionStatus.rejected] Error:', action.payload);
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export const { setPlan, resetProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;