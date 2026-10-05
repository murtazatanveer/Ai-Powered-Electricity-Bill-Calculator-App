// Maps Firebase Auth error codes to friendly, user-facing messages.

const FIREBASE_ERROR_MAP = {
  // Email
  "auth/email-already-in-use":
    "This email is already registered. Please sign in instead.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-email": "Please enter your email address.",

  // Password
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/missing-password": "Please enter your password.",

  // Account
  "auth/user-not-found":
    "No account found with this email. Please sign up first.",
  "auth/user-disabled":
    "This account has been disabled. Contact support for help.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/operation-not-allowed":
    "This sign-in method is not enabled. Please contact support.",

  // Network
  "auth/network-request-failed":
    "Network error. Please check your internet connection.",

  // Catch-all
  "auth/internal-error": "Something went wrong. Please try again.",
  "auth/invalid-credential":
    "Invalid credentials. Please check your email and password.",
};

// Optional: map specific codes to specific field names so the error
// shows up under that input instead of the top banner.
const ERROR_CODE_TO_FIELD = {
  "auth/email-already-in-use": "email",
  "auth/invalid-email": "email",
  "auth/missing-email": "email",
  "auth/weak-password": "password",
  "auth/wrong-password": "password",
  "auth/missing-password": "password",
  "auth/user-not-found": "email",
};

export const getFriendlyFirebaseError = (error) => {
  if (!error || !error.code) {
    return error?.message || "Something went wrong. Please try again.";
  }
  return (
    FIREBASE_ERROR_MAP[error.code] ||
    error.message ||
    "Something went wrong. Please try again."
  );
};

export const getFirebaseErrorField = (error) => {
  if (!error || !error.code) return null;
  return ERROR_CODE_TO_FIELD[error.code] || null;
};
