"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Landmark,
  Menu,
  X,
  MapPinned,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import ProfieDropdown from "./ProfileDropdown";

const navLinks = [
  { name: "Platform Overview", href: "/", short: "Platform Overview" },
  { name: "Citizen Reporting", href: "/citizen-all-issue" },
  { name: "City Workflows", href: "/city-workflow" },
  { name: "FAQ", href: "/faq" },
];

export default function Navbar() {
  const pathname = usePathname();

  const { data: session, isPending } = useSession();


  const user = session?.user;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check whether a navigation link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Close mobile menu after navigation
  const handleNavigation = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <nav className="container mx-auto flex min-h-18 w-full min-w-0 items-center justify-between gap-4 px-4 lg:px-2">

        {/* Logo and Brand */}
        <Link
          href="/"
          onClick={handleNavigation}
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

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-center text-[13px] font-medium leading-5 transition-all duration-200 ${isActive
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
        <div className="hidden items-center gap-2 xl:flex">
          <Link
            href="/live-incident"
            className={`flex items-center gap-2 rounded-md px-3 py-3 text-[13px] font-semibold transition ${isLinkActive("/incident-map")
              ? "bg-teal-700 text-white"
              : "bg-blue-50 text-slate-800 hover:bg-blue-100"
              }`}
          >
            <MapPinned
              size={15}
              className="text-teal-700"
            />
            <span>Live Incident</span>
          </Link>

          {!isPending && (
            user ? (
              <div className="hidden xl:block">
                <ProfieDropdown />
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-md border border-teal-700 px-3 py-3 text-[13px] font-medium text-teal-700 transition hover:bg-teal-700 hover:text-white"
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/register"
                  className="flex items-center gap-2 rounded-md bg-teal-700 px-4 py-3 text-[12px] font-bold text-white transition hover:bg-teal-800"
                >
                  <span>Get started</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 xl:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="civicpulse-mobile-navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        id="civicpulse-mobile-navigation"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 ease-in-out xl:hidden ${mobileMenuOpen
          ? "max-h-[750px] opacity-100"
          : "max-h-0 border-t-0 opacity-0"
          }`}
      >
        <nav aria-label="Mobile navigation" className="space-y-2 px-4 py-4">

          {/* Mobile Navigation Links */}
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavigation}
                className={`flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium transition ${isActive
                  ? "bg-teal-700 text-white"
                  : "text-slate-700 hover:bg-slate-100"
                  }`}
              >
                {link.name}

                {isActive && <ChevronDown size={16} />}
              </Link>
            );
          })}

          <Link
            href="/live-incident"
            onClick={handleNavigation}
            className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition ${isLinkActive("/incident-map")
              ? "bg-teal-700 text-white"
              : "bg-blue-50 text-slate-800 hover:bg-blue-100"
              }`}
          >
            <MapPinned size={18} />
            Live Incident
          </Link>

          {/* Mobile Auth Actions */}
          {!isPending && (
            user ? (
              <ProfieDropdown onNavigate={handleNavigation} />
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/auth/login"
                  onClick={handleNavigation}
                  className="flex items-center justify-center rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  onClick={handleNavigation}
                  className="flex items-center justify-center rounded-md bg-teal-700 px-3 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Register
                </Link>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
