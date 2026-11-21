"use client"
import Link from "next/link";
import {
  Landmark,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ArrowUp,
} from "lucide-react";
import {LogoFacebook, LogoGithub, LogoLinkedin} from '@gravity-ui/icons';

import { useEffect, useState } from "react";

const footerLinks = {
  platform: [
    { name: "Platform Overview", href: "/" },
    { name: "Citizen Reporting", href: "/citizen-reporting" },
    { name: "City Workflows", href: "/city-workflows" },
    { name: "Live City Telemetry", href: "/live-city-telemetry" },
    { name: "Live Incident Map", href: "/incident-map" },
  ],
  resources: [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Frequently Asked Questions", href: "/faq" },
    { name: "Citizen Access", href: "/citizen-access" },
    { name: "Report an Issue", href: "/citizen-reporting" },
    { name: "Help & Support", href: "/support" },
  ],
  organization: [
    { name: "About CivicPulse", href: "/about" },
    { name: "Security & Trust", href: "/security-trust" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact Us", href: "/contact" },
  ],
};


const socialLinks = [
  { icon: LogoFacebook, href: "#", label: "Facebook" },
  { icon: LogoLinkedin, href: "#", label: "LinkedIn" },
  { icon: LogoGithub, href: "#", label: "GitHub" },
];


export default function Footer() {

    const [year, setYear] = useState(2026);

useEffect(() => {
  setYear(new Date().getFullYear());
}, []);

  return (
    <footer className="border-t border-slate-200 bg-white">

      {/* Main Footer */}
      <div className="container mx-auto px-4 pb-10 pt-14 sm:px-6 lg:pt-16">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">

          {/* Brand Section */}
          <div className="max-w-sm">

            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Landmark size={24} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                  CivicPulse
                </h2>
                <p className="text-[9px] font-bold uppercase tracking-[2px] text-slate-500">
                  Municipal Core
                </p>
              </div>
            </Link>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              Empowering smarter cities through transparent civic reporting,
              intelligent infrastructure monitoring, and accountable
              municipal operations.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-200 hover:border-teal-600 hover:bg-teal-700 hover:text-white"
                  >
                    <Icon width={16} height={16} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-slate-900">
              Platform
            </h3>

            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition-colors hover:text-teal-700"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Citizen Resources */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-slate-900">
              Citizen Resources
            </h3>

            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition-colors hover:text-teal-700"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-slate-900">
              Organization
            </h3>

            <ul className="space-y-3">
              {footerLinks.organization.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition-colors hover:text-teal-700"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Contact & Security */}
        <div className="mt-12 grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <MapPin size={17} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Municipal Services
              </h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Connecting citizens with local authorities.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Mail size={17} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Email Support
              </h4>
              <Link
                href="/contact"
                className="mt-1 inline-block text-xs text-slate-500 hover:text-teal-700"
              >
                Contact our support team
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <ShieldCheck size={17} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Security & Trust
              </h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Designed with privacy and accountability in mind.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="mt-9 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">

          <p className="text-center text-xs text-slate-500 sm:text-left">
            © {year} CivicPulse. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-slate-500 hover:text-teal-700"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-slate-500 hover:text-teal-700"
            >
              Terms
            </Link>

            <Link
              href="/security-trust"
              className="text-xs text-slate-500 hover:text-teal-700"
            >
              Security
            </Link>

            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              aria-label="Back to top"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700 text-white transition hover:bg-teal-800"
            >
              <ArrowUp size={17} />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
