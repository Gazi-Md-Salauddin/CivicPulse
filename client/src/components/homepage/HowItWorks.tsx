
import Link from "next/link";
import {
  FilePlus2,
  SearchCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Report an Issue",
    description:
      "Citizens submit infrastructure issues with descriptions, photos, and location details through a simple reporting interface.",
    icon: FilePlus2,
    color: "bg-blue-50 text-blue-700",
    tag: "Citizen Action",
    details: ["Describe the issue", "Add location details", "Submit a report"],
  },
  {
    number: "02",
    title: "Review & Verify",
    description:
      "Submitted reports are reviewed and verified to ensure accurate information before being forwarded to the relevant department.",
    icon: SearchCheck,
    color: "bg-amber-50 text-amber-700",
    tag: "Verification",
    details: ["Review submissions", "Validate report details", "Verify reported issues"],
  },
  {
    number: "03",
    title: "Assign & Resolve",
    description:
      "Verified reports are assigned to responsible municipal departments for action, progress tracking, and resolution.",
    icon: Building2,
    color: "bg-violet-50 text-violet-700",
    tag: "Municipal Action",
    details: ["Assign departments", "Track task progress", "Update resolution status"],
  },
  {
    number: "04",
    title: "Track & Improve",
    description:
      "Citizens can follow report progress while administrators gain insights into municipal performance and service delivery.",
    icon: CheckCircle2,
    color: "bg-teal-50 text-teal-700",
    tag: "Transparency",
    details: ["Track report status", "Review outcomes", "Improve city services"],
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F5F8FF] px-4 py-20 sm:px-6 lg:py-24">
      <div className="container mx-auto">

        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-4 py-2">
            <ShieldCheck size={15} className="text-teal-700" />
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-teal-800">
              Simple. Transparent. Accountable.
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px]">
            How CivicPulse{" "}
            <span className="text-teal-700">Works</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            From the first citizen report to municipal resolution,
            CivicPulse creates a transparent and connected process
            for managing public infrastructure issues.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="relative">

          {/* Desktop Connecting Line */}
          <div className="absolute left-[12.5%] right-[12.5%] top-9 hidden h-px bg-teal-200 lg:block" />

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">

                  {/* Step Icon */}
                  <div className="relative z-10 mb-7 flex items-center justify-between lg:justify-center">

                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-teal-100 bg-white shadow-md shadow-slate-900/5">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}>
                        <Icon size={24} strokeWidth={1.8} />
                      </div>
                    </div>

                    <span className="text-3xl font-extrabold tracking-tight text-slate-200 lg:absolute lg:right-2">
                      {step.number}
                    </span>

                  </div>

                  {/* Step Content */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/5">

                    <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-teal-700">
                      {step.tag}
                    </span>

                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mt-3 min-h-[105px] text-xs leading-6 text-slate-500">
                      {step.description}
                    </p>

                    <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                      {step.details.map((detail) => (
                        <div key={detail} className="flex items-center gap-2">
                          <CheckCircle2
                            size={14}
                            className="shrink-0 text-teal-600"
                          />
                          <span className="text-xs text-slate-600">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Mobile/Tablet Arrow */}
                  {index !== 3 && (
                    <div className="absolute -bottom-8 left-1/2 hidden -translate-x-1/2 text-teal-400 sm:block lg:hidden">
                      <ArrowRight size={19} className="rotate-90" />
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 overflow-hidden rounded-2xl bg-[#0F766E] px-6 py-9 sm:px-10 lg:flex lg:items-center lg:justify-between">

          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-teal-100">
              <ClipboardCheck size={17} />
              <span className="text-[10px] font-bold uppercase tracking-[1.5px]">
                Be Part of the Change
              </span>
            </div>

            <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Better Cities Start With Your Voice.
            </h3>

            <p className="mt-3 text-sm leading-6 text-teal-100">
              Report an issue, follow its progress, and help build
              a more responsive and accountable city.
            </p>
          </div>

          <Link
            href="/create-issue"
            className="group mt-7 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-teal-800 transition-all hover:-translate-y-1 hover:bg-teal-50 lg:mt-0"
          >
            Start Reporting
            <ArrowUpRight
              size={17}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>

        </div>

      </div>
    </section>
  );
}
