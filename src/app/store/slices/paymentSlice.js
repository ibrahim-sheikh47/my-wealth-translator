// store/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Called after Stripe checkout completes — saves result to Firestore
export const confirmPayment = createAsyncThunk(
  'payment/confirm',
  async ({ uid, plan, billingCycle, subscriptionId, sessionId }, { rejectWithValue }) => {
    try {
      const updates = {
        plan,
        billingCycle,
        subscriptionId,
        paymentStatus: 'active',
        planExpiresAt: billingCycle === 'annual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() +  30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, 'users', uid), updates);
      return { plan, billingCycle, subscriptionId, ...updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'payment/cancel',
  async ({ uid }, { rejectWithValue }) => {
    try {
      // In production: call your API route that cancels on Stripe, then updates Firestore
      await updateDoc(doc(db, 'users', uid), {
        plan:          'free',
        paymentStatus: 'canceled',
        subscriptionId: null,
        updatedAt:     new Date().toISOString(),
      });
      return { plan: 'free', paymentStatus: 'canceled' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    currentPlan:    'free',       // 'free' | 'pro' | 'enterprise'
    billingCycle:   null,         // 'monthly' | 'annual'
    subscriptionId: null,
    paymentStatus:  null,         // 'active' | 'past_due' | 'canceled'
    isProcessing:   false,
    error:          null,
    successMessage: null,
  },
  reducers: {
    setPaymentProcessing(state, action) {
      state.isProcessing = action.payload;
    },
    clearPaymentState(state) {
      state.error          = null;
      state.successMessage = null;
      state.isProcessing   = false;
    },
    // Called when Firestore subscription data is loaded into store
    hydratePayment(state, action) {
      state.currentPlan    = action.payload.plan          ?? 'free';
      state.billingCycle   = action.payload.billingCycle  ?? null;
      state.subscriptionId = action.payload.subscriptionId ?? null;
      state.paymentStatus  = action.payload.paymentStatus  ?? null;
    },
  },
  extraReducers: (builder) => {
    // ── Confirm payment ──
    builder
      .addCase(confirmPayment.pending, (state) => {
        state.isProcessing   = true;
        state.error          = null;
        state.successMessage = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isProcessing   = false;
        state.currentPlan    = action.payload.plan;
        state.billingCycle   = action.payload.billingCycle;
        state.subscriptionId = action.payload.subscriptionId;
        state.paymentStatus  = 'active';
        state.successMessage = 'Subscription activated successfully!';
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error        = action.payload;
      });

    // ── Cancel subscription ──
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.isProcessing = true;
        state.error        = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.isProcessing   = false;
        state.currentPlan    = 'free';
        state.paymentStatus  = 'canceled';
        state.subscriptionId = null;
        state.successMessage = 'Subscription canceled.';
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isProcessing = false;
        state.error        = action.payload;
      });
  },
});

export const { setPaymentProcessing, clearPaymentState, hydratePayment } = paymentSlice.actions;
export default paymentSlice.reducer;