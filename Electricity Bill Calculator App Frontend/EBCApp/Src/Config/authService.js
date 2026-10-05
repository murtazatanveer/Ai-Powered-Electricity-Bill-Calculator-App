// Thin wrapper around Firebase Auth so screens don't import firebase directly.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./FirebaseConfig";

/**
 * Create a new account and set the displayName.
 * Returns { success, user, error }.
 *
 * A verification email is dispatched automatically (non-blocking).
 * The caller does not need to pass or store the ID token — apiClient
 * fetches a fresh token from Firebase on every request.
 */
export const signUpWithEmail = async (email, password, fullName) => {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    if (fullName) {
      await updateProfile(credential.user, { displayName: fullName.trim() });
    }

    // Fire-and-forget — signup succeeds even if verification email fails
    try {
      await sendEmailVerification(credential.user);
    } catch {
      // Non-fatal — the account is already created
    }

    return { success: true, user: credential.user, error: null };
  } catch (error) {
    return { success: false, user: null, error };
  }
};

/**
 * Sign in an existing user.
 * Returns { success, user, error }.
 */
export const signInWithEmail = async (email, password) => {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    return { success: true, user: credential.user, error: null };
  } catch (error) {
    return { success: false, user: null, error };
  }
};

/**
 * Send a password reset email.
 * Returns { success, error }.
 */
export const sendResetEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Sign the current user out.
 * Returns { success, error }.
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};
