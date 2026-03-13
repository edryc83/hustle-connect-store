import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import SplashScreen from "@/components/SplashScreen";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // 1. Set up listener FIRST so we never miss events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!initialized.current) {
          initialized.current = true;
          setLoading(false);
        }
      }
    );

    // 2. Then restore existing session (fallback if listener hasn't fired yet)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!initialized.current) {
        setSession(session);
        initialized.current = true;
        setLoading(false);
      }
    });

    // 3. On app resume / visibility change, silently refresh token
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        supabase.auth.getSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Show nothing while restoring — prevents flash to login
  if (loading) return <SplashScreen />;

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
