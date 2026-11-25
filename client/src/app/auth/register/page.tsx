"use client"
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  LockKeyhole,
  MapPin,
  Building2,
  Users,
  Landmark,
  CheckCircle2,
  Activity,
  Globe2,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { userAc } from "better-auth/plugins/admin/access";

const inputClass =
  "h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-50";

export default function RegisterPage() {

  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "citizen",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        role: formData.role,
      });

      if (error) {
        setError(error.message ?? "Registration failed.");
        return;
      }
      
      router.refresh()
      router.push("/")

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    return (
      <main className="min-h-screen bg-[#F3F6FC] p-4 sm:p-6 lg:p-10">

        <div className="mx-auto grid min-h-[calc(100vh-80px)] container overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/4 lg:grid-cols-[1.3fr_0.7fr]">

          {/* LEFT: Registration Form */}
          <section className="px-5 py-8 sm:px-4 lg:px-6 xl:px-8">

            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] text-white">
                <Landmark size={21} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900">
                  CivicPulse
                </h1>
                <p className="text-[9px] font-semibold uppercase tracking-[2px] text-slate-500">
                  Smart City Platform
                </p>
              </div>
            </Link>

            {/* Heading */}
            <div className="mt-9">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0F766E]">
                <ShieldCheck size={15} />
                Citizen Enrollment
              </div>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                Create Your Account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Join CivicPulse and become part of a smarter community.
              </p>
            </div>

            {/* Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

              {/* Account Type */}
              <div>
                <label className="mb-3 block text-xs font-bold text-slate-700">
                  Select Account Type
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  {/* Citizen */}
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${formData.role === "citizen"
                      ? "border-[#0F766E] bg-teal-50/60"
                      : "border-slate-200 bg-white hover:border-teal-500"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="citizen"
                      checked={formData.role === "citizen"}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="accent-[#0F766E]"
                    />

                    <Users size={20} className="text-[#0F766E]" />

                    <div>
                      <p className="text-md font-bold text-slate-800">
                        Citizen
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Resident access
                      </p>
                    </div>
                  </label>

                  {/* Department Manager */}
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${formData.role === "department_manager"
                      ? "border-[#0F766E] bg-teal-50/60"
                      : "border-slate-200 bg-white hover:border-teal-500"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="department_manager"
                      checked={formData.role === "department_manager"}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="accent-[#0F766E]"
                    />

                    <Landmark size={20} className="text-[#0F766E]" />

                    <div>
                      <p className="text-md font-bold text-slate-800">
                        Department Manager
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Department access
                      </p>
                    </div>
                  </label>

                  {/* Maintenance Staff */}
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${formData.role === "maintenance_staff"
                      ? "border-[#0F766E] bg-teal-50/60"
                      : "border-slate-200 bg-white hover:border-teal-500"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="maintenance_staff"
                      checked={formData.role === "maintenance_staff"}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="accent-[#0F766E]"
                    />

                    <Building2 size={20} className="text-[#0F766E]" />

                    <div>
                      <p className="text-md font-bold text-slate-800">
                        Maintenance Staff
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Staff access
                      </p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Personal Details */}
              <div>
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User size={16} className="text-[#0F766E]" />
                  <h3 className="text-md font-bold text-slate-800">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-md font-semibold text-slate-600">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-md font-semibold text-slate-600">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* <div>
                  <label className="mb-2 block text-[11px] font-semibold text-slate-600">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+1 000 000 0000"
                      autoComplete="tel"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div> */}
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin size={16} className="text-[#0F766E]" />
                  <h3 className="text-md font-bold text-slate-800">
                    Location Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-md font-semibold text-slate-600">
                      Address
                    </label>
                    <input
                      name="city"
                      type="text"
                      placeholder="Enter Your Address"
                      autoComplete="address-level2"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <LockKeyhole size={16} className="text-[#0F766E]" />
                  <h3 className="text-md font-bold text-slate-800">
                    Account Security
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-md font-semibold text-slate-600">
                      Password *
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Create password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-4">
                <input
                  type="checkbox"
                  name="terms"
                  required
                  className="mt-1 accent-[#0F766E]"
                />
                <span className="text-sm leading-5 text-slate-600">
                  I agree to the{" "}
                  <Link href="/terms" className="font-bold text-[#0F766E]">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-bold text-[#0F766E]">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] text-sm font-bold text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create New Account"}
                {!loading && <ArrowRight size={17} />}
              </button>

              <p className="text-center text-xs text-slate-500">
                Already registered?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-[#0F766E] hover:underline"
                >
                  Sign in instead
                </Link>
              </p>
            </form>
          </section>

          {/* RIGHT: Branding Panel */}
          <section className="relative hidden overflow-hidden bg-[#0F766E] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">

            <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute -right-12 -top-8 h-56 w-56 rounded-full border border-white/10" />
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/4" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-wider">
                <Activity size={13} />
                Connected City Ecosystem
              </div>

              <h2 className="mt-10 text-4xl font-extrabold leading-tight">
                Your City.
                <br />
                Your Voice.
                <br />
                Your Impact.
              </h2>

              <p className="mt-5 text-sm leading-7 text-teal-50">
                Connect with your municipality, report infrastructure
                issues, and help shape a better urban future.
              </p>

              {/* Benefits */}
              <div className="mt-12 space-y-6">
                {[
                  "Report and track civic issues",
                  "Stay updated on public works",
                  "Connect with municipal services",
                  "Access real-time city information",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <CheckCircle2 size={15} />
                    </div>
                    <span className="text-xs font-medium text-teal-50">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="relative z-10 mt-16 rounded-xl border border-white/15 bg-white/8 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0F766E]">
                  <Globe2 size={21} />
                </div>
                <div>
                  <p className="text-xs font-bold">
                    One Platform. Connected Cities.
                  </p>
                  <p className="mt-1 text-[10px] text-teal-100">
                    Building stronger communities together.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 flex items-center justify-between text-[10px] text-teal-100">
              <span>© 2026 CivicPulse</span>
              <span>Secure Civic Access</span>
            </div>
          </section>
        </div>
      </main>
    );
  }
