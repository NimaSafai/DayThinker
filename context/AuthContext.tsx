import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabase";
import { User, AuthContextType } from "../types";

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for user on mount
  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            created_at: new Date(session.user.created_at || "").toISOString(),
          });
        }
      } catch (e) {
        if (e instanceof Error && isMounted) {
          setError(e.message);
        } else if (isMounted) {
          setError("An unknown error occurred");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            created_at: new Date(session.user.created_at || "").toISOString(),
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string) => {
    console.log("AuthContext: signUp called with email:", email);
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "dayThink://login",
        },
      });

      if (signUpError) {
        console.error("Supabase signUp error:", signUpError);
        throw signUpError;
      }

      console.log("SignUp response:", {
        user: data?.user ? "User exists" : "No user",
        session: data?.session ? "Session exists" : "No session",
      });

      // If successful but no session, it means email confirmation is required
      if (!data?.session) {
        setError("Please check your email to confirm your account");
      }
    } catch (e) {
      console.error("Error during sign up:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred during sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred during sign out");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
