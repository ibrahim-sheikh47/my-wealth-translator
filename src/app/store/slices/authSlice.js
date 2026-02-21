// store/slices/authSlice.js
import { auth, db, storage } from '@/app/lib/firebase';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc    = await getDoc(doc(db, 'users', credential.user.uid));
      const profile    = userDoc.exists() ? userDoc.data() : {};
      return {
        uid:         credential.user.uid,
        email:       credential.user.email,
        displayName: credential.user.displayName ?? profile.firstName ?? '',
        photoURL:    credential.user.photoURL    ?? profile.photoURL  ?? null,
        ...profile,
      };
    } catch (error) {
      return rejectWithValue(firebaseErrorMessage(error.code));
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (formData, { rejectWithValue }) => {
    try {
      const firstName  = formData.get('firstName');
      const lastName   = formData.get('lastName');
      const email      = formData.get('email');
      const password   = formData.get('password');
      const location   = formData.get('location');
      const phone      = formData.get('phoneNumber');
      const photoFile  = formData.get('profilePhoto');

      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid        = credential.user.uid;

      // 2. Upload profile photo if provided
      let photoURL = null;
      if (photoFile && photoFile.size > 0) {
        const storageRef = ref(storage, `profilePhotos/${uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      // 3. Update Firebase Auth profile
      await updateProfile(credential.user, {
        displayName: `${firstName} ${lastName}`,
        photoURL:    photoURL ?? '',
      });

      // 4. Save to Firestore
      const userProfile = {
        uid,
        firstName,
        lastName,
        email,
        location,
        phone,
        photoURL,
        plan:      'free',          // default plan
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid), userProfile);

      return {
        uid,
        email,
        displayName: `${firstName} ${lastName}`,
        photoURL,
        ...userProfile,
      };
    } catch (error) {
      return rejectWithValue(firebaseErrorMessage(error.code));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { email };
    } catch (error) {
      return rejectWithValue(firebaseErrorMessage(error.code));
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (uid, { rejectWithValue }) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) return userDoc.data();
      return rejectWithValue('User profile not found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Firebase error → readable message ───────────────────────────────────────
function firebaseErrorMessage(code) {
  const map = {
    'auth/user-not-found':        'No account found with this email.',
    'auth/wrong-password':        'Incorrect password. Please try again.',
    'auth/email-already-in-use':  'This email is already registered.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/too-many-requests':     'Too many attempts. Please try again later.',
    'auth/network-request-failed':'Network error. Check your connection.',
    'auth/invalid-credential':    'Invalid email or password.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,   // serializable user object
    isAuthenticated: false,
    isLoading:       false,
    isInitialized:   false,  // true after onAuthStateChanged fires once
    needsPayment:    false,
    error:           null,
  },
  reducers: {
    // Called by FirebaseAuthListener on mount
    setUser(state, action) {
      state.user            = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading       = false;
      state.error           = null;
    },
    setInitialized(state) {
      state.isInitialized = true;
      state.isLoading     = false;
    },
    clearError(state) {
      state.error = null;
    },
    clearNeedsPayment(state) {
      state.needsPayment = false;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading       = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
        state.error           = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // ── Signup ──
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading       = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
        state.error           = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // ── Logout ──
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user            = null;
        state.isAuthenticated = false;
        state.isLoading       = false;
        state.error           = null;
      });

    // ── Forgot password ──
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // ── Fetch profile ──
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { setUser, setInitialized, clearError , clearNeedsPayment } = authSlice.actions;
export default authSlice.reducer;