"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

const AuthContext = createContext(null);

// Creates the user's Firestore profile on first sign-in, and bumps lastLogin after.
// Merging keeps a role the user may already have saved.
async function saveUserProfile(user, name) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await setDoc(ref, { lastLogin: serverTimestamp() }, { merge: true });
  } else {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      name: name || user.displayName || "",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    }, { merge: true });
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await saveUserProfile(user);
  };

  const register = async (name, email, password) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await saveUserProfile(user, name);
  };

  const loginWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    await saveUserProfile(user);
  };

  const loginAnonymously = async () => {
    const { user } = await signInAnonymously(auth);
    await saveUserProfile(user, "Guest");
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, loginAnonymously, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Turns Firebase error codes into readable messages
export function authErrorMessage(err) {
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/admin-restricted-operation":
      return "Guest sign-in is not enabled for this app.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed.";
    default:
      return err?.message || "Something went wrong.";
  }
}
