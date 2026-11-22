"use client"
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Mail,
  Building2,
  Users,
  Activity,
  MapPin,
  Landmark,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import { useState } from "react";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login successful:", data);

      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <main className="min-h-screen bg-[#F3F6FC] p-4 sm:p-6 lg:p-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/4 lg:grid-cols-2">

          {/* Left Branding Panel */}
          <section className="relative hidden overflow-hidden bg-[#0F766E] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-white/4" />

            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0F766E]">
                  <Landmark size={23} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">
                    CivicPulse
                  </h1>
                  <p className="text-[9px] font-medium uppercase tracking-[2px] text-teal-100">
                    Smart City Platform
                  </p>
                </div>
              </Link>

              <div className="mt-20 max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-teal-50">
                  <Activity size={13} />
                  CONNECTED CITY ECOSYSTEM
                </span>

                <h2 className="mt-7 text-4xl font-extrabold leading-[1.2] tracking-tight xl:text-5xl">
                  Building Better Cities, Together.
                </h2>

                <p className="mt-5 text-sm leading-7 text-teal-50/90">
                  One connected platform for citizens, municipal teams,
                  and smarter infrastructure management.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="mt-12 space-y-3">
                {[
                  {
                    icon: MapPin,
                    title: "Real-Time City Intelligence",
                    description: "Monitor incidents and infrastructure updates.",
                  },
                  {
                    icon: Users,
                    title: "Connected Communities",
                    description: "Bring citizens and city authorities together.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Trusted & Secure Access",
                    description: "Protect civic information and operations.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.07] p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <Icon size={19} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold">{item.title}</h3>
                        <p className="mt-1 text-[10px] text-teal-100">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 mt-12 flex items-center justify-center border-t border-white/15 pt-5 text-sm text-teal-100">
              <span>Smart Infrastructure. Better Communities.</span>
            </div>
          </section>

          {/* Right Login Form */}
          <section className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">

            {/* Mobile Logo */}
            <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F766E] text-white">
                <Landmark size={21} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900">
                  CivicPulse
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-slate-500">
                  Smart City Platform
                </p>
              </div>
            </Link>

            <div className="mx-auto w-full max-w-md">

              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
                  <LockKeyhole size={23} />
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#0F766E]">
                  Welcome Back
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  Registration to CivicPulse
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Access your account to manage reports, track city
                  services, and stay connected.
                </p>
              </div>

              {/* Account Type */}
              <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-lg bg-white px-2 py-3 text-xs font-bold text-[#0F766E] shadow-sm"
                  >
                    <Users size={15} />
                    Citizen
                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-xs font-semibold text-slate-500 transition hover:bg-white"
                  >
                    <Building2 size={15} />
                    Municipal Staff
                  </button>
                </div>
              </div>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-teal-50">
                    <Mail size={17} className="text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-semibold text-[#0F766E] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-teal-50">
                    <LockKeyhole size={17} className="text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#0F766E]"
                    />
                    Remember me
                  </label>

                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <ShieldCheck size={14} />
                    Secure Login
                  </span>
                </div>

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-[#115E59] active:scale-[0.99]"
                >
                  Sign In
                  <ArrowRight size={17} />
                </button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-sm font-medium text-slate-400">
                  SECURE MUNICIPAL ACCESS
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-600">
                <Globe2 size={16} className="text-[#0F766E]" />
                Government Identity & SSO
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-bold text-[#0F766E] hover:underline"
                >
                  Create an account
                </Link>
              </p>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={13} />
                Your information is protected with secure access controls.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
