
import {
  FileCheck2,
  Users,
  Clock3,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const statistics = [
  {
    title: "Verified Reports",
    value: "14,820",
    change: "+12.8%",
    description: "Citizen issues successfully verified",
    icon: FileCheck2,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
  },
  {
    title: "Active Citizens",
    value: "18.4K",
    change: "+8.4%",
    description: "Citizens engaging with their city",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
  },
  {
    title: "Resolution Rate",
    value: "92.4%",
    change: "+5.2%",
    description: "Reported issues successfully resolved",
    icon: Clock3,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  {
    title: "Transparency Score",
    value: "100%",
    change: "+2.1%",
    description: "Municipal operations transparency",
    icon: ShieldCheck,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
  },
];

export default function StatSection() {
  return (
    <section className="bg-[#F5F8FF] px-4 pb-16 sm:px-6">
      <div className="container mx-auto">

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {statistics.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.iconBg}`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={1.8}
                      className={stat.iconColor}
                    />
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                    <TrendingUp size={12} />
                    {stat.change}
                  </div>
                </div>

                {/* Statistics */}
                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {stat.description}
                  </p>
                </div>

                {/* Bottom Indicator */}
                <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-2/3 rounded-full bg-teal-600 transition-all duration-500 group-hover:w-full" />
                </div>

              </div>
            );
          })}

        </div>

        {/* Footer Caption */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          City performance indicators
          <span className="hidden sm:inline">•</span>
          Powered by CivicPulse Intelligence
        </div>

      </div>
    </section>
  );
}
