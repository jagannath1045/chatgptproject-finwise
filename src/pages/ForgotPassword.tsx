import { useState } from "react";
import { ArrowLeft, CheckCircle, Mail, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuthContext();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-9 shadow-2xl">
        <div className="flex items-center gap-2.5 text-teal-700 mb-8">
          <span className="rounded-xl bg-teal-50 p-2"><Wallet className="w-6 h-6" /></span>
          <span className="text-xl font-bold tracking-tight">FinWise AI</span>
        </div>
        {sent ? (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">Check your inbox</h1>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">If an account exists for <strong>{email}</strong>, we sent a secure password-reset link. It may take a minute to arrive.</p>
            <Link to="/login" className="inline-flex items-center gap-2 mt-7 text-sm font-bold text-teal-700 hover:text-teal-800"><ArrowLeft className="w-4 h-4" /> Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
            <p className="text-sm text-slate-600 mt-2 mb-7">Enter your email and we’ll send you a secure reset link.</p>
            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 mb-5">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input className="input-field pl-11" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
              </div>
              <button className="btn-primary w-full" disabled={loading}>{loading ? "Sending link..." : "Send reset link"}</button>
            </form>
            <Link to="/login" className="inline-flex items-center gap-2 mt-7 text-sm font-bold text-teal-700 hover:text-teal-800"><ArrowLeft className="w-4 h-4" /> Back to sign in</Link>
          </>
        )}
      </section>
    </main>
  );
}
