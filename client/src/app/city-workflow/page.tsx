import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  SearchCheck,
  UserCheck,
  Wrench,
  CheckCircle2,
  LockKeyhole,
  Camera,
  MapPin,
  Clock3,
  ShieldCheck,
  Users,
  Building2,
  FileCheck,
  XCircle,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Issue Submitted",
    status: "Submitted",
    description:
      "Citizens report infrastructure problems by providing a title, description, photographs and accurate GPS location.",
    actor: "Citizen",
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-700",
    line: "bg-blue-500",
  },
  {
    number: "02",
    title: "Department Review",
    status: "Under Review",
    description:
      "The responsible department manager examines the submitted report, checks its validity and determines its priority.",
    actor: "Department Manager",
    icon: SearchCheck,
    color: "bg-amber-50 text-amber-700",
    line: "bg-amber-500",
  },
  {
    number: "03",
    title: "Task Assignment",
    status: "Assigned",
    description:
      "Once verified, the issue is assigned to an appropriate maintenance staff member within the department.",
    actor: "Department Manager",
    icon: UserCheck,
    color: "bg-purple-50 text-purple-700",
    line: "bg-purple-500",
  },
  {
    number: "04",
    title: "Work In Progress",
    status: "In Progress",
    description:
      "Maintenance staff visit the reported location, perform the required repair work and submit progress notes.",
    actor: "Maintenance Staff",
    icon: Wrench,
    color: "bg-indigo-50 text-indigo-700",
    line: "bg-indigo-500",
  },
  {
    number: "05",
    title: "Issue Resolved",
    status: "Resolved",
    description:
      "After completing the work, staff upload completion photographs and mark the assigned task as resolved.",
    actor: "Maintenance Staff",
    icon: CheckCircle2,
    color: "bg-green-50 text-green-700",
    line: "bg-green-500",
  },
  {
    number: "06",
    title: "Final Closure",
    status: "Closed",
    description:
      "The department manager reviews the completed work and officially closes the reported issue.",
    actor: "Department Manager",
    icon: LockKeyhole,
    color: "bg-slate-100 text-slate-700",
    line: "bg-slate-500",
  },
];

const responsibilities = [
  {
    title: "Citizens",
    description:
      "Report problems, provide accurate locations and photographs, and track issue progress.",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Department Managers",
    description:
      "Verify reports, assign priorities, manage staff and review completed work.",
    icon: Building2,
    color: "bg-purple-50 text-purple-700",
  },
  {
    title: "Maintenance Staff",
    description:
      "Handle assigned tasks, update progress, add notes and upload completion evidence.",
    icon: Wrench,
    color: "bg-amber-50 text-amber-700",
  },
  {
    title: "Administrators",
    description:
      "Monitor all departments, manage users and oversee the overall city infrastructure system.",
    icon: ShieldCheck,
    color: "bg-green-50 text-green-700",
  },
];

const features = [
  {
    title: "Location Tracking",
    description:
      "Every reported issue can include GPS coordinates and an address for accurate maintenance visits.",
    icon: MapPin,
  },
  {
    title: "Transparent Updates",
    description:
      "Citizens can follow available issue status updates throughout the resolution process.",
    icon: Clock3,
  },
  {
    title: "Photo Evidence",
    description:
      "Issue photographs and completion photographs help document the problem and repair work.",
    icon: Camera,
  },
  {
    title: "Accountability",
    description:
      "Status history records the responsible user and timestamp for workflow transitions.",
    icon: FileCheck,
  },
];

export default function CityWorkflowPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#082F3A]">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-teal-600/10 blur-3xl" />

        <div className="relative mx-auto container px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-xs font-semibold text-teal-300">
              <ShieldCheck size={15} />
              CIVICPULSE TRANSPARENT GOVERNANCE
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              How Our City
              <span className="block text-teal-400">
                Workflow Works
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              From reporting a broken streetlight to completing a road
              repair, CivicPulse connects citizens, government
              departments and maintenance teams through one transparent
              infrastructure management system.
            </p>

          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-3 gap-3 border-t border-white/10 pt-8 sm:gap-8">
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">06</p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Workflow Stages
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">04</p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                User Roles
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">24/7</p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Report Submission
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto container px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-teal-700">
            The Process
          </span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            From Report to Resolution
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            Every infrastructure issue follows a structured process
            to ensure accountability and effective problem resolution.
          </p>
        </div>

        <div className="mx-auto mt-14 container">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative flex gap-4 sm:gap-7">
                {index !== steps.length - 1 && (
                  <div className="absolute left-5.75 top-14 h-[calc(100%-35px)] w-0.5 bg-slate-200 sm:left-[29px]" />
                )}

                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-14 sm:w-14">
                  <Icon className="text-teal-700" size={24} />
                </div>

                <div className="mb-7 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold tracking-widest text-slate-400">
                      STEP {step.number}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${step.color}`}>
                      {step.status}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-slate-900 sm:text-xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {step.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <Users size={15} className="text-teal-700" />
                    <span className="text-xs font-semibold text-slate-600">
                      Responsible: {step.actor}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rejection notice */}
        <div className="mx-auto mt-4 flex container gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
          <XCircle className="mt-1 shrink-0 text-red-600" size={23} />
          <div>
            <h3 className="font-bold text-red-800">
              What happens if a report is rejected?
            </h3>
            <p className="mt-2 text-sm leading-7 text-red-700">
              If a submitted report is invalid, outside the department&apos;s
              responsibility or cannot be verified, the department manager
              may reject it with a reason. The rejection is recorded in the
              issue history.
            </p>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="bg-white py-20">
        <div className="mx-auto container px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-700">
              Who Does What?
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Everyone Has a Role
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              CivicPulse brings all stakeholders together to improve
              public infrastructure management.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {responsibilities.map((role) => {
              const Icon = role.icon;

              return (
                <div
                  key={role.title}
                  className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${role.color}`}>
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-900">
                    {role.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto container px-5 py-20 sm:px-8">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-teal-700">
            Built for Transparency
          </span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            What Makes CivicPulse Effective?
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <Icon size={25} className="text-teal-700" />
                <h3 className="mt-5 font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto container overflow-hidden rounded-3xl bg-[#082F3A] px-6 py-14 text-center sm:px-12 sm:py-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Together, Let&apos;s Build a Better City
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            See an infrastructure problem in your neighborhood?
            Report it today and help make your community better.
          </p>

          <Link
            href="/create-issue"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-teal-600"
          >
            Report an Issue
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
