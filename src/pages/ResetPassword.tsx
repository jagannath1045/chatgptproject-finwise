import { useEffect, useState } from "react";
import { CheckCircle, Lock, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/useAuthContext";

export default function ResetPassword() {
  const { updatePassword } = useAuthContext();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session))).catch(() => setReady(false));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await updatePassword(password);
      setComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not update your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-9 shadow-2xl">
        <div className="flex items-center gap-2.5 text-teal-700 mb-8"><span className="rounded-xl bg-teal-50 p-2"><Wallet className="w-6 h-6" /></span><span className="text-xl font-bold tracking-tight">FinWise AI</span></div>
        {complete ? <div className="text-center"><CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-4" /><h1 className="text-2xl font-bold text-slate-900">Password updated</h1><p className="text-sm text-slate-600 mt-3">Your new password is ready to use.</p><Link to="/login" className="btn-primary inline-block mt-7">Sign in</Link></div> : <><h1 className="text-2xl font-bold text-slate-900">Choose a new password</h1><p className="text-sm text-slate-600 mt-2 mb-7">Use at least 6 characters to protect your account.</p>{!ready && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 mb-5">Open this page using the secure link in your password-reset email.</p>}{error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 mb-5">{error}</p>}<form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-semibold text-slate-700 mb-1.5">New password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input className="input-field pl-11" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div></div><div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm new password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input className="input-field pl-11" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div></div><button className="btn-primary w-full" disabled={!ready || loading}>{loading ? "Updating password..." : "Update password"}</button></form></>}
      </section>
    </main>
  );
}
