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
 * Returns { success, user, token, error }.
 */
export const signUpWithEmail = async (email, password, fullName) => {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    // Attach the display name so Firebase Console shows the user's name
    if (fullName) {
      await updateProfile(credential.user, { displayName: fullName.trim() });
    }

    // Fire-and-forget email verification (optional, doesn't block signup)
    try {
      await sendEmailVerification(credential.user);
    } catch (verifyErr) {
      // Non-fatal — the account is created
      console.warn("[auth] verification email failed:", verifyErr?.message);
    }

    // Get fresh ID token to log
    const token = await credential.user.getIdToken();

    return { success: true, user: credential.user, token, error: null };
  } catch (error) {
    return { success: false, user: null, token: null, error };
  }
};

/**
 * Sign in an existing user.
 * Returns { success, user, token, error }.
 */
export const signInWithEmail = async (email, password) => {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    const token = await credential.user.getIdToken();
    return { success: true, user: credential.user, token, error: null };
  } catch (error) {
    return { success: false, user: null, token: null, error };
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
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};
