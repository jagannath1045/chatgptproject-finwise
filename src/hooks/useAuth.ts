import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

const demoUser: User = {
  id: "demo-jaggan-2026",
  app_metadata: {},
  user_metadata: { full_name: "Jaggan" },
  aud: "authenticated",
  created_at: "2026-09-01T00:00:00Z",
  email: "jaggan@finwise.ai",
  phone: "",
  role: "authenticated",
  updated_at: "2026-09-25T00:00:00Z",
};

const demoProfile: Profile = {
  id: "demo-jaggan-2026",
  full_name: "Jaggan",
  currency: "INR",
  created_at: "2026-09-01T00:00:00Z",
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch {
      // Fallback to demo profile
      setProfile(demoProfile);
    }
  }, []);

  useEffect(() => {
    // Keep the login screen available in a fresh Vercel deployment. A user can
    // still enter demo mode by submitting the sign-in form when Supabase is not configured.
    if (!hasSupabaseConfig) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        setUser(data.session.user);
        fetchProfile(data.session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!hasSupabaseConfig) {
      throw new Error("Account creation is unavailable until Supabase is connected.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;

    // The DB trigger (handle_new_user, SECURITY DEFINER) already inserts a profile
    // row during auth.users INSERT. Only attempt a client-side profile upsert if we
    // have an active session (email confirmation disabled). If email confirmation is
    // enabled, data.session is null and the trigger handles profile creation.
    if (data.user && data.session) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        currency: "INR",
      });
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    if (!hasSupabaseConfig) {
      setUser({ ...demoUser, email: email || demoUser.email });
      setProfile({ ...demoProfile, full_name: email.split("@")[0] || demoProfile.full_name });
      return { user: demoUser, session: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!hasSupabaseConfig) {
      setUser(null);
      setProfile(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const requestPasswordReset = async (email: string) => {
    if (!hasSupabaseConfig) {
      throw new Error("Password recovery is unavailable until Supabase is connected.");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    if (!hasSupabaseConfig) {
      throw new Error("Password recovery is unavailable until Supabase is connected.");
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const updateProfile = async (updates: { full_name?: string; currency?: string }) => {
    if (!user) throw new Error("Not authenticated");
    if (!hasSupabaseConfig) {
      const updated = { ...demoProfile, ...updates };
      setProfile(updated);
      return updated;
    }
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data as Profile);
    return data as Profile;
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    updatePassword,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}
