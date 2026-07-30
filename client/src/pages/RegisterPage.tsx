import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      showToast("Account created successfully!", "success");
      navigate("/dashboard");
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>;
      showToast(
        error.response?.data?.error?.message || "Registration failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* decorative vault dial watermark */}
      <svg
        className="pointer-events-none absolute -left-40 -bottom-40 w-[560px] h-[560px] text-patina-500/[0.05] animate-dial-spin"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="0.6" />
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="4"
            x2="50"
            y2="10"
            stroke="currentColor"
            strokeWidth="0.6"
            transform={`rotate(${i * 15} 50 50)`}
          />
        ))}
      </svg>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <p className="ledger-label text-[10px] text-brass-500 mb-2">New Depositor</p>
          <h1 className="font-display italic text-4xl font-semibold text-ivory">
            Create Account
          </h1>
          <p className="text-vault-300 mt-2 font-mono text-sm">Join AutoVault today</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative bg-vault-850/70 backdrop-blur-sm border border-vault-600/60 rounded-2xl p-8 space-y-5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brass-500/50 to-transparent" />
          <div>
            <label htmlFor="register-name" className="ledger-label block text-[10px] text-vault-300 mb-1.5">
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 bg-vault-950/60 border border-vault-600 rounded-lg text-vault-100 placeholder-vault-400 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brass-500/60 focus:border-brass-500/60 transition-all"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="ledger-label block text-[10px] text-vault-300 mb-1.5">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-vault-950/60 border border-vault-600 rounded-lg text-vault-100 placeholder-vault-400 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brass-500/60 focus:border-brass-500/60 transition-all"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="ledger-label block text-[10px] text-vault-300 mb-1.5">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              className="w-full px-4 py-3 bg-vault-950/60 border border-vault-600 rounded-lg text-vault-100 placeholder-vault-400 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brass-500/60 focus:border-brass-500/60 transition-all"
            />
          </div>

          <div>
            <label htmlFor="register-confirm" className="ledger-label block text-[10px] text-vault-300 mb-1.5">
              Confirm Password
            </label>
            <input
              id="register-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              className="w-full px-4 py-3 bg-vault-950/60 border border-vault-600 rounded-lg text-vault-100 placeholder-vault-400 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brass-500/60 focus:border-brass-500/60 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brass-500 hover:bg-brass-400 disabled:bg-vault-700 disabled:text-vault-400 disabled:cursor-not-allowed text-vault-950 font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-brass-500/20"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-vault-300 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-brass-400 hover:text-brass-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
