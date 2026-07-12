import React, { useState } from "react";
import { ShieldAlert, Lock, User, Eye, EyeOff, Fingerprint, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLoginSuccess: (user: { name: string; email: string; avatar: string; role: string }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("admin@service-now.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: password === "••••••••" ? "admin" : password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Add a realistic delays for corporate feel
      setTimeout(() => {
        onLoginSuccess(data.user);
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Invalid credentials");
    }
  };

  const handleSSOLogin = () => {
    setIsLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      onLoginSuccess({
        name: "David L. (SSO)",
        email: "admin@service-now.com",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYhmP4_3uTRkp9hTIQh88KaApx_8Gv3QQ0KRemDOB2TZQIFUyvT_UWw5gSSDhDyfQhm-iPn1R51gWtbmU5pw8IG5VYF3lSEZ6f6MafbTqeRSlvG_zZyPcno4b25sQT3IMuTy7mUvblps_IEDsJ7gdwGofHHQ-bCrQMy0n7L0pZVJU579b-iPEak8I-XoJL8qGv5wMERF12BoUzhwtX460TkesFH0w5RIh3bpZsFQtwA47sIl7rCbBzuQ",
        role: "Global Admin",
      });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-on-surface">
      {/* Top Branding Section */}
      <header className="w-full max-w-sm mb-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-md">
            <ShieldAlert className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">ServiceNow Admin</h1>
          <p className="text-sm text-secondary font-medium mt-1">Role-Based Access Management</p>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="w-full max-w-sm login-card p-8 rounded-xl shadow-sm bg-surface-container-lowest border border-outline-variant transition-all duration-300">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-on-surface">Welcome back</h2>
          <p className="text-xs text-on-surface-variant mt-1">Please sign in to manage your instance</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-xs font-semibold flex items-center gap-2">
            <span>⚠</span> {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username/Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant" htmlFor="username">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <User className="w-5 h-5" />
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@service-now.com"
                type="text"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <a className="text-xs font-semibold text-primary hover:underline transition-all" href="#forgot">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <Lock className="w-5 h-5" />
              </span>
              <input
                className="w-full pl-10 pr-12 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold text-sm hover:opacity-90 hover:shadow-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-4 text-outline text-xs font-semibold">OR</span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            <button
              className="w-full bg-white border border-secondary text-secondary py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-50"
              type="button"
              onClick={handleSSOLogin}
              disabled={isLoading}
            >
              <Fingerprint className="w-5 h-5" />
              Sign in with SSO / 2FA
            </button>
          </div>
        </form>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-60">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Enterprise Security Level Enforced</span>
        </div>
      </main>

      {/* Visual Element (Hidden on small mobile, visible on larger screens) */}
      <div className="mt-8 w-full max-w-sm hidden sm:block">
        <div className="rounded-xl overflow-hidden h-24 relative shadow-sm border border-outline-variant">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-_QeOVk4IHV3hmUxeNJU_EPEvbT7BTTZGxtx5eCsZCHaeA20qLX-bRTXMq6F-li3o27-5oRpVO4L3TW4L3jqacufZR2gSpcO5Lqqk4ypHJjI9crA6XrfeDcBWVfgqzKmmPpntRWkIheoCBqfqL6rSCanV84wbR4PSx0YER3MpZjYP-kv7c9fSZDWsqCObxwoDldn6jzQSMvfX9xFf1gKrqUVLMvsti-l-PyZjAMiV_FIxEMSTSonaGw')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 w-full max-w-sm">
        <nav className="flex justify-center gap-6 mb-3">
          <a className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#privacy">
            Privacy Policy
          </a>
          <a className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#support">
            Contact Support
          </a>
          <a className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#security">
            Security
          </a>
        </nav>
        <p className="text-center text-[10px] text-outline">
          © 2026 ServiceNow Instance Admin. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
