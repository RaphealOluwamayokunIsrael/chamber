
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setSuccess(true);
      setMessage(
        "Account created! Please check your email and verify your account before signing in."
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f5fa] px-4 py-6 text-[#10213e] sm:px-6 lg:py-10">
      <div className="grid w-full max-w-[1320px] overflow-hidden rounded-[28px] border border-[#e4eaf3] bg-white shadow-[0_24px_80px_rgba(12,35,73,0.10)] lg:min-h-[800px] lg:grid-cols-[0.94fr_1.06fr]">

        {/* LEFT BRAND PANEL */}
        <aside className="relative isolate hidden overflow-hidden bg-gradient-to-br from-[#071a37] via-[#0b3265] to-[#0754a5] px-10 py-11 text-white lg:flex lg:flex-col xl:px-14">
          <div className="pointer-events-none absolute -right-32 top-20 h-[430px] w-[430px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-20 top-32 h-[330px] w-[330px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-44 -left-32 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <Image
                src="/chamber-icon.svg.png"
                alt="Original Chamber icon"
                width={44}
                height={44}
                className="h-auto w-auto object-contain"
                unoptimized
                priority
              />
            </div>

            <div>
              <h2 className="font-serif text-[31px] font-semibold leading-none tracking-tight">
                Chamber
              </h2>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-blue-200">
                Your Workspace
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-16">
            <div className="mb-7 h-px w-14 bg-blue-400" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-300">
              A better way to work together
            </p>

            <h1 className="mt-7 max-w-[490px] font-serif text-[45px] font-semibold leading-[1.13] tracking-tight xl:text-[54px]">
              Great Things Begin With Connection.
            </h1>

            <p className="mt-6 max-w-[410px] text-[15px] leading-8 text-blue-100/85">
              Create your space, bring your people together, and
              turn meaningful ideas into lasting progress.
            </p>

            <div className="mt-12 space-y-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                  <UsersRound size={22} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold">
                    Build your community
                  </h3>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Create or join Chambers that matter to you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold">
                    Organize with purpose
                  </h3>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Give your ideas and collaborations a home.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold">
                    A focused workspace
                  </h3>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Work together in an organized environment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DECORATIVE WORKSPACE GRAPHIC */}
          <div className="pointer-events-none relative z-10 mt-auto flex justify-center pb-6 pt-12">
            <div className="relative flex h-36 w-64 items-center justify-center">
              <div className="absolute h-28 w-60 rotate-[-12deg] rounded-[50%] border border-blue-300/30" />
              <div className="absolute h-24 w-52 rotate-[18deg] rounded-[50%] border border-blue-300/20" />

              <div className="absolute left-7 top-5 h-24 w-20 -rotate-12 rounded-xl border border-blue-300/30 bg-white/10 backdrop-blur-md" />
              <div className="absolute right-6 top-3 h-28 w-24 rotate-12 rounded-xl border border-blue-300/30 bg-white/10 backdrop-blur-md" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-300/40 bg-gradient-to-br from-blue-400 to-blue-700 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                <UsersRound size={38} className="text-white" />
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-200">
            <span className="h-px w-9 bg-blue-400" />
            Built by RIO LAB
            <span className="h-px w-9 bg-blue-400" />
          </div>
        </aside>

        {/* RIGHT SIGNUP FORM */}
        <section className="flex flex-col bg-white px-6 py-7 sm:px-12 sm:py-10 xl:px-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 lg:hidden">
              <Image
                src="/chamber-icon.svg.png"
                alt="Chamber icon"
                width={35}
                height={35}
                unoptimized
                priority
              />
              <span className="font-serif text-xl font-bold">
                Chamber
              </span>
            </div>

            <div className="hidden lg:block" />

            <p className="text-right text-xs text-slate-500 sm:text-sm">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#075cf0] transition-colors hover:text-blue-800"
              >
                Sign in
                <ArrowRight size={14} className="ml-1 inline" />
              </Link>
            </p>
          </div>

          <div className="mx-auto flex w-full max-w-[490px] flex-1 flex-col justify-center py-10 lg:py-8">
            <div className="animate-[fadeIn_0.7s_ease-out_both]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Welcome to Chamber
              </p>

              <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#0b2145] sm:text-5xl">
                Get started.
              </h1>

              <p className="mt-4 text-[15px] leading-7 text-slate-500">
                Create your Chamber account and start building
                meaningful connections today.
              </p>
            </div>

            <form
              onSubmit={handleSignup}
              className="mt-9 space-y-5"
            >
              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-[#14294a]"
                >
                  Full name
                </label>

                <div className="group relative">
                  <UserRound
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  />

                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                    className="h-[55px] w-full rounded-xl border border-[#d9e2ee] bg-white pl-12 pr-4 text-sm text-[#14294a] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#14294a]"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="h-[55px] w-full rounded-xl border border-[#d9e2ee] bg-white pl-12 pr-4 text-sm text-[#14294a] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#14294a]"
                >
                  Password
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={6}
                    className="h-[55px] w-full rounded-xl border border-[#d9e2ee] bg-white pl-12 pr-12 text-sm text-[#14294a] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use a strong password to protect your account.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#14294a]"
                >
                  Confirm password
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={6}
                    className="h-[55px] w-full rounded-xl border border-[#d9e2ee] bg-white pl-12 pr-12 text-sm text-[#14294a] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    aria-pressed={showConfirmPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* STATUS MESSAGE */}
              {message && (
                <div
                  role={success ? "status" : "alert"}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
                    success
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {success ? (
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <XCircle
                      size={20}
                      className="mt-0.5 shrink-0"
                    />
                  )}
                  <span>{message}</span>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-[56px] w-full items-center justify-center gap-3 rounded-xl bg-[#075cf0] text-[15px] font-semibold text-white shadow-[0_10px_25px_rgba(7,92,240,0.17)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#004bd0] hover:shadow-[0_14px_30px_rgba(7,92,240,0.25)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={19}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#075cf0] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-400">
              Chamber — Where Organization Meets Focus.
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
              Built by RIO LAB
            </p>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
