import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { authApi } from "../lib/apiClient";

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  role: string;
  token: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("spiceora_user") || sessionStorage.getItem("spiceora_user");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed.token) {
        try {
          const payload = JSON.parse(atob(parsed.token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("spiceora_user");
            sessionStorage.removeItem("spiceora_user");
            return null;
          }
        } catch {}
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync Firebase user state & backend user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const email = fbUser.email || "";
          const nameParts = (fbUser.displayName || email.split("@")[0] || "").trim().split(/\s+/);
          const firstName = nameParts[0] || "User";
          const lastName = nameParts.slice(1).join(" ") || "";

          // Use the centralized authApi.client — no direct fetch, no hardcoded URL
          const syncResult = await authApi.syncFirebase({
            email,
            firstName,
            lastName,
            avatarUrl: fbUser.photoURL || "",
            firebaseUid: fbUser.uid,
          });
          const localUser = syncResult?.user || {};
          const appToken = syncResult?.token || token;

          const userData: AuthUser = {
            id: localUser.id || fbUser.uid,
            name: fbUser.displayName || `${firstName} ${lastName}`.trim() || email,
            email,
            role: localUser.role || "customer",
            token: appToken,
            avatarUrl: fbUser.photoURL || undefined,
            isLoggedIn: true,
          };

          setUser(userData);
          localStorage.setItem("spiceora_user", JSON.stringify(userData));
        } catch (err) {
          console.warn("Failed to sync Firebase user with backend:", err);
          setUser(null);
          localStorage.removeItem("spiceora_user");
          sessionStorage.removeItem("spiceora_user");
        }
      } else {
        setUser(null);
        localStorage.removeItem("spiceora_user");
        sessionStorage.removeItem("spiceora_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function signup(name: string, email: string, password: string) {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        try {
          await sendEmailVerification(res.user);
        } catch (e) {
          console.warn("Verification email send error:", e);
        }
      }
    } catch (err: any) {
      if (err.code === "auth/configuration-not-found" || err.code === "auth/invalid-api-key" || err.code === "auth/operation-not-allowed" || err.code === "auth/api-key-not-valid" || err.message?.includes("firebase")) {
        const parts = name.trim().split(/\s+/);
        const firstName = parts.shift() || "User";
        const lastName = parts.join(" ") || "";
        const data = await authApi.register({ email, password, firstName, lastName });
        const userData: AuthUser = {
          id: data.user.id,
          name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() || email,
          email: data.user.email,
          role: data.user.role || "customer",
          token: data.token,
          isLoggedIn: true,
        };
        setUser(userData);
        localStorage.setItem("spiceora_user", JSON.stringify(userData));
        return;
      }
      throw new Error(getFriendlyErrorMessage(err.code || err.message));
    }
  }

  async function login(email: string, password: string) {
    // The creator account uses the backend's admin username credential rather
    // than an email address. Route it directly to the protected admin login
    // endpoint so Firebase's email-only validation does not block the launch.
    if (!email.includes('@')) {
      const data = await authApi.adminLogin(email, password);
      const userData: AuthUser = {
        id: data.user.id,
        name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() || email,
        email: data.user.email,
        role: data.user.role || "admin",
        token: data.token,
        isLoggedIn: true,
      };
      setUser(userData);
      localStorage.setItem("spiceora_user", JSON.stringify(userData));
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === "auth/configuration-not-found" || err.code === "auth/invalid-api-key" || err.code === "auth/operation-not-allowed" || err.code === "auth/api-key-not-valid" || err.message?.includes("firebase")) {
        const data = await authApi.login(email, password);
        const userData: AuthUser = {
          id: data.user.id,
          name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() || email,
          email: data.user.email,
          role: data.user.role || "customer",
          token: data.token,
          isLoggedIn: true,
        };
        setUser(userData);
        localStorage.setItem("spiceora_user", JSON.stringify(userData));
        return;
      }
      throw new Error(getFriendlyErrorMessage(err.code || err.message));
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      throw new Error(getFriendlyErrorMessage(err.code || err.message));
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("spiceora_user");
    sessionStorage.removeItem("spiceora_user");
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw new Error(getFriendlyErrorMessage(err.code || err.message));
    }
  }

  async function sendVerification() {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (err: any) {
        throw new Error(getFriendlyErrorMessage(err.code || err.message));
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        sendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function getFriendlyErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters long.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    default:
      return code.startsWith("auth/") ? code.replace("auth/", "").replace(/-/g, " ") : code;
  }
}
