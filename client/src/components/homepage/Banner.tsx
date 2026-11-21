
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Clock3,
  Building2,
  FileCheck2,
  Radio,
  ArrowUpRight,
} from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    text: "Verified Citizen Reports",
  },
  {
    icon: Building2,
    text: "Municipal Accountability",
  },
  {
    icon: Radio,
    text: "Real-Time City Intelligence",
  },
];

export default function Banner() {
  return (
    <section className="relative overflow-hidden bg-[#F5F8FF] px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:pb-20 lg:pt-24">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-teal-100/40 blur-[120px]" />

      <div className="relative container mx-auto">

        {/* Hero Content */}
        <div className="mx-auto max-w-4xl text-center">

          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-teal-800 sm:text-xs">
              A New Standard in Civic Infrastructure
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Where Citizen Reports Become{" "}
            <span className="text-teal-700">
              Verified Municipal Action.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            Empowering communities and transforming urban governance through
            transparent reporting, intelligent city monitoring, and
            accountable municipal workflows.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              href="/citizen-reporting"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition-all duration-300 hover:-translate-y-1 hover:bg-teal-800 sm:w-auto"
            >
              <MapPin size={17} />
              Report a Civic Issue
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/city-workflows"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:text-teal-700 sm:w-auto"
            >
              Explore City Workflows
              <ArrowUpRight size={16} />
            </Link>

          </div>

          {/* Trust Indicators */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.text}
                  className="flex items-center gap-2 text-xs font-medium text-slate-500"
                >
                  <Icon size={15} className="text-teal-700" />
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Comparison Card */}
        <div className="mx-auto mt-14 max-w-5xl">

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.08)]">

            {/* Browser Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-600">
                  CivicPulse Verification Network
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                <Radio size={13} />
                Live Monitoring
              </div>
            </div>

            {/* Comparison Content */}
            <div className="grid grid-cols-1 items-center gap-5 p-5 md:grid-cols-[1fr_auto_1fr] md:gap-6 md:p-7">

              {/* Citizen Report */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                    New Report
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    #CP-2026-0148
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-amber-100">
                    <MapPin size={25} className="text-amber-700" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800">
                      Damaged Road Infrastructure
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Reported by a citizen
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin size={12} />
                      Central District
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock3 size={13} />
                    Awaiting review
                  </div>
                  <span className="text-[10px] font-bold text-amber-600">
                    PENDING
                  </span>
                </div>
              </div>

              {/* Verification Indicator */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-white shadow-lg shadow-teal-900/20">
                  <ShieldCheck size={25} />
                </div>

                <p className="text-center text-[11px] font-bold text-slate-700">
                  CivicPulse
                  <br />
                  Verification
                </p>

                <div className="hidden h-px w-12 bg-teal-300 md:block" />
                <ArrowRight className="hidden text-teal-600 md:block" size={19} />
              </div>

              {/* Verified Report */}
              <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-4">

                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded bg-teal-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Verified
                  </span>
                  <CheckCircle2 size={16} className="text-teal-700" />
                </div>

                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-teal-100">
                    <Building2 size={25} className="text-teal-700" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800">
                      Municipal Review Completed
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Assigned to City Department
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                      <FileCheck2 size={12} />
                      Officially acknowledged
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-teal-200 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-teal-700">
                    <CheckCircle2 size={13} />
                    Verified report
                  </div>
                  <span className="text-[10px] font-bold text-teal-700">
                    ACKNOWLEDGED
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Caption */}
          <p className="mt-4 text-center text-[11px] text-slate-400">
            A transparent journey from citizen voice to municipal accountability.
          </p>

        </div>
      </div>
    </section>
  );
}
