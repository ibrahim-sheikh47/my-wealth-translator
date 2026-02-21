// components/FirebaseAuthListener.jsx
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import {
  setUser,
  setInitialized,
  fetchUserProfile,
} from "@/app/store/slices/authSlice";
import {
  fetchSubscriptionStatus,
  setPlan,
} from "@/app/store/slices/userProfileSlice"; // <-- use setPlan
import { auth } from "../lib/firebase";

// Mounted once in layout — keeps Redux auth state in sync with Firebase
export default function FirebaseAuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName ?? "",
          photoURL: firebaseUser.photoURL ?? null,
        };
        dispatch(setUser(user));

        // Fetch profile and subscription BEFORE marking as initialized
        await dispatch(fetchUserProfile(firebaseUser.uid));
        const result = await dispatch(
          fetchSubscriptionStatus(firebaseUser.uid),
        );
        if (result.payload) {
          dispatch(setPlan(result.payload));
        }
      } else {
        dispatch(setUser(null));
        dispatch(setPlan({ plan: "free" }));
      }

      // ✅ Only mark initialized AFTER all async data is loaded
      dispatch(setInitialized());
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}
