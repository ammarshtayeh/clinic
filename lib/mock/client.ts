import { MOCK_SESSION_COOKIE } from "./config";
import { MOCK_CREDENTIALS, loadDb, saveDb } from "./seed";
import { mockFrom, mockRpc } from "./query";

type AuthListener = (event: string, session: unknown) => void;
const authListeners: AuthListener[] = [];

function setSessionCookie(userId: string | null) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (userId) {
    document.cookie = `${MOCK_SESSION_COOKIE}=${userId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
  } else {
    document.cookie = `${MOCK_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
  }
}

function getSessionUserId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${MOCK_SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? loadDb().sessionUserId;
}

function mockUser(userId: string) {
  const db = loadDb();
  const profile = db.profiles.find((p) => p.id === userId);
  return {
    id: userId,
    email: MOCK_CREDENTIALS.find((c) => c.userId === userId)?.email ?? "demo@asnany.ps",
    user_metadata: { full_name: profile?.full_name ?? "مستخدم" },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };
}

export function createMockClient() {
  return {
    from: mockFrom,
    rpc: mockRpc,
    auth: {
      async getUser() {
        const userId = getSessionUserId();
        if (!userId) return { data: { user: null }, error: null };
        return { data: { user: mockUser(userId) as any }, error: null };
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const cred = MOCK_CREDENTIALS.find((c) => c.email === email && c.password === password);
        if (!cred) return { data: { user: null, session: null }, error: { message: "Invalid credentials" } };

        try {
          const res = await fetch("/api/auth/mock-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) return { data: { user: null, session: null }, error: { message: "Invalid credentials" } };
        } catch {
          setSessionCookie(cred.userId);
        }

        const db = loadDb();
        db.sessionUserId = cred.userId;
        saveDb(db);
        setSessionCookie(cred.userId);
        authListeners.forEach((l) => l("SIGNED_IN", { user: mockUser(cred.userId) }));
        return { data: { user: mockUser(cred.userId), session: {} }, error: null };
      },
      async signOut() {
        try {
          await fetch("/api/auth/mock-session", { method: "DELETE" });
        } catch {
          /* ignore */
        }
        const db = loadDb();
        db.sessionUserId = null;
        saveDb(db);
        setSessionCookie(null);
        authListeners.forEach((l) => l("SIGNED_OUT", null));
        return { error: null };
      },
      async signUp() {
        return { data: { user: null }, error: { message: "التسجيل مغلق في الوضع التجريبي" } };
      },
      async updateUser() {
        return { data: { user: mockUser(getSessionUserId()!) }, error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
      onAuthStateChange(cb: AuthListener) {
        authListeners.push(cb);
        return { data: { subscription: { unsubscribe: () => {
          const idx = authListeners.indexOf(cb);
          if (idx >= 0) authListeners.splice(idx, 1);
        } } } };
      },
    },
    storage: {
      from: (_bucket: string) => ({
        async upload(_path: string, _file: File) {
          return { error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: `https://via.placeholder.com/150?text=Logo` } };
        },
      }),
    },
  };
}

export type MockClient = ReturnType<typeof createMockClient>;
