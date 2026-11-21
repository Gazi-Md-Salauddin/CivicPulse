
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Landmark,
  Menu,
  X,
  MapPinned,
  Megaphone,
  UserRound,
  ChevronDown,
} from "lucide-react";

const navLinks = [
  { name: "Platform Overview", href: "/", short: "Platform Overview" },
  { name: "Citizen Reporting", href: "/citizen-reporting" },
  { name: "City Workflows", href: "/city-workflows" },
  { name: "Live City Telemetry", href: "/live-city-telemetry" },
  { name: "Security & Trust", href: "/security-trust" },
  { name: "FAQ", href: "/faq" },
];

export default function Navbar() {
  const [activeLink, setActiveLink] = useState("/");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (href: string) => {
    setActiveLink(href);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <nav className="container mx-auto flex min-h-18 items-center justify-between gap-4 px-4 lg:px-6">

        {/* Logo and Brand */}
        <Link
          href="/"
          onClick={() => handleNavigation("/")}
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Landmark size={23} strokeWidth={2.2} />
          </div>

          <div className="leading-tight">
            <h1 className="text-[17px] font-extrabold tracking-tight text-slate-800">
              CivicPulse
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-slate-500">
              Municipal Core
            </p>
          </div>
        </Link>

        {/* Platform Badge */}
        <div className="hidden shrink-0 rounded-sm bg-slate-100 px-2 py-1.5 text-center md:block">
          <p className="text-[9px] font-bold uppercase leading-3 tracking-wider text-slate-600">
            GovTech
            <br />
            Platform
          </p>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {navLinks.map((link) => {
            const isActive = activeLink === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavigation(link.href)}
                className={`rounded-md px-3 py-2 text-center text-[13px] font-medium leading-5 transition-all duration-200 ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-teal-700"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <Link
            href="/incident-map"
            onClick={() => handleNavigation("/incident-map")}
            className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-3 text-[13px] font-semibold text-slate-800 transition hover:bg-blue-100"
          >
            <MapPinned size={15} className="text-teal-700" />
            <span>
              Live Incident
              <br />
              Map
            </span>
          </Link>

          <Link
            href="/sign-in"
            className="px-3 py-3 text-[13px] font-medium text-slate-700 transition hover:text-teal-700"
          >
            Sign In
          </Link>

          <Link
            href="/citizen-access"
            className="flex items-center gap-2 rounded-md bg-teal-700 px-4 py-3 text-[12px] font-bold text-white transition hover:bg-teal-800"
          >
            <Megaphone size={16} />
            <span>
              Report an Issue /
              <br />
              Citizen Access
            </span>
          </Link>

          <Link
            href="/profile"
            aria-label="User profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-800 text-white transition hover:bg-teal-900"
          >
            <UserRound size={18} />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 xl:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 ease-in-out xl:hidden ${
          mobileMenuOpen
            ? "max-h-[650px] opacity-100"
            : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <div className="space-y-2 px-4 py-4">
          {/* Mobile Branding */}
          <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <div>
              <p className="text-sm font-bold text-slate-800">
                CivicPulse
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                GovTech Platform
              </p>
            </div>
            <Landmark size={24} className="text-teal-700" />
          </div>

          {/* Navigation Links */}
          {navLinks.map((link) => {
            const isActive = activeLink === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavigation(link.href)}
                className={`flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-700 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.name}
                {isActive && <ChevronDown size={16} />}
              </Link>
            );
          })}

          {/* Additional Mobile Links */}
          <Link
            href="/incident-map"
            onClick={() => handleNavigation("/incident-map")}
            className="flex items-center gap-3 rounded-md bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-800"
          >
            <MapPinned size={18} className="text-teal-700" />
            Live Incident Map
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/sign-in"
              className="flex items-center justify-center rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Link>

            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <UserRound size={16} />
              Profile
            </Link>
          </div>

          <Link
            href="/citizen-access"
            className="flex items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            <Megaphone size={17} />
            Report an Issue / Citizen Access
          </Link>
        </div>
      </div>
    </header>
  );
}
