import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { api, type Target } from "../lib/api";

type Ctx = {
  ready: boolean;
  signedIn: boolean;
  name: string;
  target: Target | null;
  sessionError: string;
  setTarget: (t: Target) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState<Target | null>(null);
  const [sessionError, setSessionError] = useState("");

  useEffect(
    () =>
      onAuthStateChanged(auth, async (fbUser) => {
        setSessionError("");
        if (!fbUser) {
          setSignedIn(false);
          setTarget(null);
          setReady(true);
          return;
        }
        try {
          // POST /auth/session creates the account on first sign-in, returns user + target
          const s = await api.session();
          setName(s.user.name || s.user.email);
          setTarget(s.target);
          setSignedIn(true);
        } catch (err: any) {
          // Backend unreachable or returned an error.
          // Sign out of Firebase so the user isn't stuck in a half-authenticated state,
          // and surface the error so Login.tsx can display it.
          const msg =
            err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")
              ? "Couldn't reach the server. Make sure the backend is running at localhost:8000 and try again."
              : err?.message ?? "Sign-in failed. Please try again.";
          setSessionError(msg);
          await fbSignOut(auth);
        }
        setReady(true);
      }),
    []
  );

  const value: Ctx = {
    ready,
    signedIn,
    name,
    target,
    sessionError,
    setTarget,
    signInWithGoogle: async () => {
      await signInWithPopup(auth, googleProvider);
    },
    signOut: () => fbSignOut(auth),
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
