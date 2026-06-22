import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Authentification locale (démonstration). Les mots de passe ne sont jamais
// stockés en clair dans le bundle : seul leur condensé SHA-256 est embarqué.
// IMPORTANT : ce schéma reste purement client-side et NE doit pas être
// considéré comme une protection de sécurité en production. Pour un usage
// réel, migrer vers Supabase Auth (ou équivalent) avec validation serveur.

export type Role = "admin_anzrbo" | "digitorg" | "nsia";

export type LocalUser = {
  id: string;
  identifier: string;
  nom: string;
  prenoms: string;
  role: Role;
  home: "/admin" | "/digitorg" | "/nsia";
};

type Account = LocalUser & { passwordHash: string };

const STORAGE_KEY = "anzrbo_local_session_v2";

// SHA-256("12345678") — mot de passe de démonstration partagé. Ce condensé
// n'est PAS un secret : il documente la valeur attendue côté client.
const DEMO_PWD_HASH =
  "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";

const ACCOUNTS: Account[] = [
  {
    id: "anzrbo-admin", identifier: "0759566087", passwordHash: DEMO_PWD_HASH,
    nom: "ADMIN", prenoms: "ANZRBO", role: "admin_anzrbo", home: "/admin",
  },
  {
    id: "digitorg-admin", identifier: "admin", passwordHash: DEMO_PWD_HASH,
    nom: "DIGITORG", prenoms: "Maître d'œuvre", role: "digitorg", home: "/digitorg",
  },
  {
    id: "nsia-partner", identifier: "nsia", passwordHash: DEMO_PWD_HASH,
    nom: "NSIA", prenoms: "Partenaire Assurance", role: "nsia", home: "/nsia",
  },
];

function norm(v: string) {
  return v.trim().toLowerCase();
}

async function sha256Hex(v: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) return "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function tryLogin(identifier: string, password: string): Promise<LocalUser | null> {
  const id = norm(identifier).replace(/\s+/g, "");
  const hash = await sha256Hex(password);
  for (const a of ACCOUNTS) {
    const candidate = norm(a.identifier);
    const phoneEq = /^\d+$/.test(candidate) && id.replace(/\D/g, "") === candidate;
    if ((id === candidate || phoneEq) && hash && hash === a.passwordHash) {
      const { passwordHash: _p, ...user } = a;
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

// Helper pour les `beforeLoad` de routes protégées (TanStack Router).
// Renvoie un objet redirect quand l'utilisateur n'a pas le rôle requis.
// NOTE: l'évaluation reste côté client — la vraie protection doit venir
// d'une authentification serveur (Supabase Auth, etc.).
export function clientRoleGuard(allowed: Role[]): { to: "/login" } | undefined {
  if (typeof window === "undefined") return undefined;
  const u = readStoredUser();
  if (!u || !allowed.includes(u.role)) return { to: "/login" };
  return undefined;
}

type Ctx = {
  user: LocalUser | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<LocalUser | null>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null, loading: false, signIn: async () => null, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setUser(readStoredUser()); setLoading(false); }, []);
  return (
    <AuthCtx.Provider
      value={{
        user, loading,
        signIn: async (id, pwd) => { const u = await tryLogin(id, pwd); if (u) setUser(u); return u; },
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
