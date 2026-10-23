"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiChangePassword,
  apiLogin,
  apiMe,
  apiRegister,
  apiUpdateProfile,
  apiUploadAvatar,
  type AuthApiUser,
} from "@/lib/api";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
};

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  displayName: string;
  hydrated: boolean;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }) => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = "ayanfe-user";
const TOKEN_KEY = "ayanfe-token";

function toProfile(user: AuthApiUser): UserProfile {
  const parts = (user.name || "").trim().split(/\s+/);
  return {
    id: user.id,
    firstName: user.firstName || parts[0] || "",
    lastName: user.lastName || parts.slice(1).join(" ") || "",
    email: user.email,
    phone: user.phone || "",
    avatarUrl: user.avatarUrl || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        const t = localStorage.getItem(TOKEN_KEY);
        const raw = localStorage.getItem(USER_KEY);
        if (raw) setUser(JSON.parse(raw) as UserProfile);
        if (t) {
          setToken(t);
          try {
            const { user: me } = await apiMe(t);
            setUser(toProfile(me));
          } catch {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    };
    void boot();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [user, token, hydrated]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      hydrated,
      isSignedIn: Boolean(user && token),
      displayName: user ? `${user.firstName} ${user.lastName}`.trim() : "",
      login: async (email, password) => {
        const data = await apiLogin(email, password);
        setToken(data.token);
        setUser(toProfile(data.user));
      },
      register: async (input) => {
        const data = await apiRegister({
          firstName: input.firstName,
          lastName: input.lastName,
          name: `${input.firstName} ${input.lastName}`.trim(),
          email: input.email,
          password: input.password,
          phone: input.phone,
          otp: input.otp,
        });
        setToken(data.token);
        setUser(toProfile(data.user));
      },
      updateProfile: async (patch) => {
        if (!token) throw new Error("Not signed in");
        const data = await apiUpdateProfile(token, {
          firstName: patch.firstName,
          lastName: patch.lastName,
          email: patch.email,
          phone: patch.phone,
        });
        setUser(toProfile(data.user));
      },
      uploadAvatar: async (file) => {
        if (!token) throw new Error("Not signed in");
        const data = await apiUploadAvatar(token, file);
        setUser(toProfile(data.user));
      },
      changePassword: async (oldPassword, newPassword) => {
        if (!token) throw new Error("Not signed in");
        await apiChangePassword(token, oldPassword, newPassword);
      },
      refreshMe: async () => {
        if (!token) return;
        const data = await apiMe(token);
        setUser(toProfile(data.user));
      },
      logout: () => {
        setUser(null);
        setToken(null);
      },
    }),
    [user, token, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
