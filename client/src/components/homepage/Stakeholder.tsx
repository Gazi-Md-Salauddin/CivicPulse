
import Link from "next/link";
import {
  Users,
  Building2,
  Landmark,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const stakeholders = [
  {
    number: "01",
    title: "For Citizens",
    subtitle: "Your Voice. Your City.",
    description:
      "Give residents a direct channel to report urban issues, track progress, and actively participate in building better communities.",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    features: [
      "Submit infrastructure reports",
      "Track report status in real time",
      "Stay informed about city updates",
    ],
    href: "/citizen-reporting",
    action: "Explore Citizen Access",
    visual: {
      label: "Citizen Report",
      status: "Submitted Successfully",
      id: "#CP-2026-0148",
    },
  },
  {
    number: "02",
    title: "For Municipal Authorities",
    subtitle: "Manage. Respond. Resolve.",
    description:
      "Streamline municipal operations with centralized report management, department assignments, and transparent resolution workflows.",
    icon: Building2,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
    features: [
      "Manage incoming citizen reports",
      "Assign tasks to departments",
      "Monitor resolution performance",
    ],
    href: "/city-workflows",
    action: "Explore City Workflows",
    visual: {
      label: "Department Workflow",
      status: "Under Review",
      id: "#TASK-2048",
    },
  },
  {
    number: "03",
    title: "For City Administrators",
    subtitle: "Monitor. Analyze. Improve.",
    description:
      "Gain meaningful insights into city operations through performance analytics, infrastructure monitoring, and centralized oversight.",
    icon: Landmark,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
    features: [
      "Access city-wide performance data",
      "Monitor infrastructure indicators",
      "Make informed operational decisions",
    ],
    href: "/live-city-telemetry",
    action: "Explore City Intelligence",
    visual: {
      label: "City Intelligence",
      status: "Monitoring Active",
      id: "#CITY-001",
    },
  },
];

export default function StakeholderSection() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:py-24">
      <div className="container mx-auto">

        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2">
            <ShieldCheck size={15} className="text-teal-700" />
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-teal-800">
              Built for Urban Collaboration
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px]">
            Engineered for Every{" "}
            <span className="text-teal-700">
              Stakeholder
            </span>{" "}
            in Public Works
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            A unified civic ecosystem connecting citizens, municipal
            authorities, and city administrators through transparent
            workflows and intelligent infrastructure management.
          </p>
        </div>

        {/* Stakeholder Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {stakeholders.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.number}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-7"
              >

                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}
                  >
                    <Icon
                      size={23}
                      className={item.iconColor}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="text-xs font-bold tracking-widest text-slate-300">
                    {item.number}
                  </span>
                </div>

                {/* Title */}
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    {item.subtitle}
                  </p>

                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-500">
                    {item.description}
                  </p>
                </div>

                {/* Preview Panel */}
                <div className="my-6 rounded-lg border border-slate-100 bg-slate-50 p-4">

                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {item.visual.label}
                    </span>

                    <span className="rounded bg-white px-2 py-1 text-[9px] font-semibold text-slate-400">
                      {item.visual.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm">
                      {item.number === "01" && <FileText size={19} />}
                      {item.number === "02" && <CheckCircle2 size={19} />}
                      {item.number === "03" && <BarChart3 size={19} />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        {item.visual.status}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        CivicPulse Management System
                      </p>
                    </div>

                    <div className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  </div>

                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-2/3 rounded-full bg-teal-600" />
                  </div>
                </div>

                {/* Features */}
                <div className="mb-7 space-y-3">
                  {item.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2.5"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-teal-700"
                      />
                      <span className="text-xs leading-5 text-slate-600">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action */}
                <div className="mt-auto border-t border-slate-100 pt-5">
                  <Link
                    href={item.href}
                    className="group/link inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition-colors hover:text-teal-900"
                  >
                    {item.action}
                    <ArrowUpRight
                      size={17}
                      className="transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
                    />
                  </Link>
                </div>

              </div>
            );
          })}

        </div>

        {/* Bottom Statement */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-teal-100 bg-teal-50/50 px-6 py-7 text-center sm:flex-row sm:text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Users size={22} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              One Platform. Three Stakeholders. A Better City.
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Bringing every part of the civic ecosystem together through
              one connected platform.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
