import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Authentification 100% locale (sans base de données).
// 3 comptes fictifs (mot de passe commun : 12345678) :
//   - 0759566087  → Admin ANZRBO       → /admin
//   - admin       → Admin DigitOrg     → /digitorg
//   - nsia        → Partenaire NSIA    → /nsia

export type Role = "admin_anzrbo" | "digitorg" | "nsia";

export type LocalUser = {
  id: string;
  identifier: string;
  nom: string;
  prenoms: string;
  role: Role;
  home: "/admin" | "/digitorg" | "/nsia";
};

type Account = LocalUser & { password: string };

const STORAGE_KEY = "anzrbo_local_session_v2";

const ACCOUNTS: Account[] = [
  {
    id: "anzrbo-admin", identifier: "0759566087", password: "12345678",
    nom: "ADMIN", prenoms: "ANZRBO", role: "admin_anzrbo", home: "/admin",
  },
  {
    id: "digitorg-admin", identifier: "admin", password: "12345678",
    nom: "DIGITORG", prenoms: "Maître d'œuvre", role: "digitorg", home: "/digitorg",
  },
  {
    id: "nsia-partner", identifier: "nsia", password: "12345678",
    nom: "NSIA", prenoms: "Partenaire Assurance", role: "nsia", home: "/nsia",
  },
];

function norm(v: string) {
  return v.trim().toLowerCase();
}

export function tryLogin(identifier: string, password: string): LocalUser | null {
  const id = norm(identifier).replace(/\s+/g, "");
  for (const a of ACCOUNTS) {
    const candidate = norm(a.identifier);
    const phoneEq = /^\d+$/.test(candidate) && id.replace(/\D/g, "") === candidate;
    if ((id === candidate || phoneEq) && password === a.password) {
      const { password: _p, ...user } = a;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }
      return user;
    }
  }
  return null;
}

function readStoredUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch { return null; }
}

type Ctx = {
  user: LocalUser | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => LocalUser | null;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null, loading: false, signIn: () => null, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setUser(readStoredUser()); setLoading(false); }, []);
  return (
    <AuthCtx.Provider
      value={{
        user, loading,
        signIn: (id, pwd) => { const u = tryLogin(id, pwd); if (u) setUser(u); return u; },
        signOut: async () => {
          try { if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY); } catch {}
          setUser(null);
          if (typeof window !== "undefined") window.location.assign("/login");
        },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
