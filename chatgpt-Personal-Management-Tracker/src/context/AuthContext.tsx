import { createContext, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export type AuthContextValue = ReturnType<typeof useAuth>;

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
