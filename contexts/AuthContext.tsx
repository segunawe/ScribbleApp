import React, { createContext, useContext, useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import appleAuth from "@invertase/react-native-apple-authentication";

// ─── Configure Google Sign-In ─────────────────────────────────────────────────
// webClientId comes from Firebase Console → Authentication → Sign-in method
// → Google → Web SDK configuration → Web client ID
GoogleSignin.configure({
  webClientId: "FILL_IN_YOUR_WEB_CLIENT_ID",
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: FirebaseAuthTypes.User | null;
  /** True while the initial auth state is being determined */
  authLoading: boolean;
  /** Book IDs this user can open. book-1 is always included. */
  unlockedBooks: string[];
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unlockedBooks, setUnlockedBooks] = useState<string[]>(["book-1"]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        await fetchEntitlements(u.uid);
      } else {
        setUnlockedBooks(["book-1"]);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const fetchEntitlements = async (uid: string) => {
    try {
      const doc = await firestore().collection("users").doc(uid).get();
      const purchased: string[] = doc.data()?.unlockedBooks ?? [];
      setUnlockedBooks(["book-1", ...purchased]);
    } catch {
      // Network error — fall back to free book only
      setUnlockedBooks(["book-1"]);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await auth().createUserWithEmailAndPassword(email, password);
  };

  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { data } = await GoogleSignin.signIn();
    if (!data?.idToken) throw new Error("Google sign-in cancelled");
    const credential = auth.GoogleAuthProvider.credential(data.idToken);
    await auth().signInWithCredential(credential);
  };

  const signInWithApple = async () => {
    const appleAuthRequest = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    if (!appleAuthRequest.identityToken) throw new Error("Apple sign-in failed");
    const { identityToken, nonce } = appleAuthRequest;
    const credential = auth.AppleAuthProvider.credential(identityToken, nonce);
    await auth().signInWithCredential(credential);
  };

  const signOut = async () => {
    await auth().signOut();
    try { await GoogleSignin.signOut(); } catch { /* not signed in via Google */ }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        unlockedBooks,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
