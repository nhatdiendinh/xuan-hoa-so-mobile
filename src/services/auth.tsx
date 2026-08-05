import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Action, Module, User } from "../types";
import { can as canDo, scopeHoodId } from "./permissions";
import { getTable } from "./store";

const KEY = "xhs_current_user";

interface AuthValue {
  user: User | null;
  login: (username: string) => boolean;
  logout: () => void;
  can: (m: Module, a?: Action) => boolean;
  hoodScope: number | null;
}

const Ctx = createContext<AuthValue>({
  user: null, login: () => false, logout: () => {}, can: () => false, hoodScope: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const id = localStorage.getItem(KEY);
      if (id) setUser(getTable("users").find((u) => u.id === id) ?? null);
    } catch { /* bỏ qua */ }
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    login: (username: string) => {
      const found = getTable("users").find((u) => u.username === username && u.status === "active");
      if (!found) return false;
      setUser(found);
      try { localStorage.setItem(KEY, found.id); } catch { /* bỏ qua */ }
      return true;
    },
    logout: () => {
      setUser(null);
      try { localStorage.removeItem(KEY); } catch { /* bỏ qua */ }
    },
    can: (m: Module, a: Action = "view") => canDo(user, m, a),
    hoodScope: scopeHoodId(user),
  }), [user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
