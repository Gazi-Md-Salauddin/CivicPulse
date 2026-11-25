
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  MessageCircle,
  ShieldCheck,
  MapPin,
  FileText,
  Users,
  Camera,
  Clock,
  HelpCircle,
  ArrowRight,
  Mail,
  X,
} from "lucide-react";

type FAQ = {
  question: string;
  answer: string;
  category: string;
};

const categories = [
  { name: "All Questions", icon: HelpCircle },
  { name: "General", icon: FileText },
  { name: "Reporting Issues", icon: MapPin },
  { name: "Account & Security", icon: ShieldCheck },
  { name: "Issue Tracking", icon: Clock },
  { name: "Departments", icon: Users },
];

const faqs: FAQ[] = [
  {
    category: "General",
    question: "What is CivicPulse?",
    answer:
      "CivicPulse is a smart city infrastructure management platform that connects citizens with government departments. Citizens can report infrastructure problems and track their resolution.",
  },
  {
    category: "General",
    question: "Who can use CivicPulse?",
    answer:
      "CivicPulse supports four user roles: Citizens, Department Managers, Maintenance Staff, and Administrators. Each role has different permissions and dashboard features.",
  },
  {
    category: "General",
    question: "Is CivicPulse free to use?",
    answer:
      "Citizens can register and report public infrastructure problems through CivicPulse without paying a reporting fee.",
  },
  {
    category: "Reporting Issues",
    question: "How can I report an infrastructure problem?",
    answer:
      "Log in to your citizen account, open the Create Issue page, enter the issue title and description, select a category, upload an image if available, and select the location on the map. Submit the form to create your report.",
  },
  {
    category: "Reporting Issues",
    question: "Which types of issues can I report?",
    answer:
      "You can report road damage, broken streetlights, drainage problems, damaged footpaths, waste management problems, and other public infrastructure issues.",
  },
  {
    category: "Reporting Issues",
    question: "Can I upload photographs with my report?",
    answer:
      "Yes. You can attach photographs to help government departments understand the problem. Make sure the photographs clearly show the reported infrastructure issue.",
  },
  {
    category: "Reporting Issues",
    question: "Why does CivicPulse need my location?",
    answer:
      "Location information helps the responsible department identify where maintenance is required. You can select a point on the interactive map or use your device's GPS after granting permission.",
  },
  {
    category: "Reporting Issues",
    question: "Can I edit or delete a submitted report?",
    answer:
      "Report editing and deletion depend on the permissions provided by the platform. Contact the responsible department or support team if you need assistance with an existing report.",
  },
  {
    category: "Issue Tracking",
    question: "How can I track my reported issue?",
    answer:
      "Open your Citizen Dashboard and visit My Reports. Select an issue to view its current status, location, and available resolution updates.",
  },
  {
    category: "Issue Tracking",
    question: "What do the different issue statuses mean?",
    answer:
      "Submitted means your report has been received. Under Review means a department is checking it. Assigned means a maintenance worker has been assigned. In Progress means work has started. Resolved means the reported problem has been fixed. Closed means the department has completed its review. Rejected means the report was not accepted.",
  },
  {
    category: "Issue Tracking",
    question: "How long does it take to resolve an issue?",
    answer:
      "Resolution time depends on the issue category, severity, available resources, and department workload. You can follow progress through your dashboard.",
  },
  {
    category: "Account & Security",
    question: "How do I create a CivicPulse account?",
    answer:
      "Visit the registration page, enter your name, email address, and password, and complete the registration process. Your account will be created with citizen access.",
  },
  {
    category: "Account & Security",
    question: "Is my personal information secure?",
    answer:
      "CivicPulse uses authenticated sessions and role-based access controls to protect user accounts and restrict access to authorized resources.",
  },
  {
    category: "Account & Security",
    question: "Can I change my account information?",
    answer:
      "You can access your profile settings to review and update the profile information supported by the platform.",
  },
  {
    category: "Departments",
    question: "Who handles my reported issue?",
    answer:
      "Your report is handled by the relevant government department based on its category and departmental responsibilities.",
  },
  {
    category: "Departments",
    question: "Can I see which department is handling my issue?",
    answer:
      "Department information is available where it has been assigned and exposed in your issue details.",
  },
  {
    category: "Departments",
    question: "What do Department Managers do?",
    answer:
      "Department Managers review submitted reports, verify issues, assign priorities, allocate maintenance tasks, and monitor work progress within their department.",
  },
  {
    category: "Departments",
    question: "What do Maintenance Staff do?",
    answer:
      "Maintenance Staff handle assigned tasks, update work progress, add maintenance notes, and submit completion photographs when work is finished.",
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState("All Questions");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All Questions" ||
        faq.category === activeCategory;

      const matchesSearch =
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-900 to-teal-950 px-4 py-20 sm:py-24">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-teal-300">
            <HelpCircle size={29} />
          </div>

          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
            Help Center
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Frequently Asked
            <span className="block text-teal-400">Questions</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Everything you need to know about CivicPulse,
            reporting infrastructure issues, and tracking
            their resolution.
          </p>

          {/* Search */}
          <div className="mx-auto mt-9 flex max-w-2xl items-center rounded-xl border border-white/10 bg-white p-2 shadow-xl">
            <Search className="ml-3 shrink-0 text-slate-400" size={21} />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenIndex(0);
              }}
              placeholder="Search your questions..."
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              aria-label="Search frequently asked questions"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mr-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Find answers quickly with our searchable help center.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="mx-auto container px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* Categories */}
          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-slate-900">
                Browse by Category
              </h2>

              <div className="space-y-1.5">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const active =
                    activeCategory === category.name;

                  return (
                    <button
                      key={category.name}
                      onClick={() => {
                        setActiveCategory(category.name);
                        setOpenIndex(0);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active
                          ? "bg-teal-50 text-teal-700"
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <Icon size={18} />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  NEED HELP?
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Can't find an answer?
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Contact our support team for assistance.
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
                >
                  Contact Support
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Questions */}
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {activeCategory}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Find answers to common questions.
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                {filteredFAQs.length} Questions
              </span>
            </div>

            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => {
                const isOpen = openIndex === index;
                const answerId = `faq-answer-${index}`;

                return (
                  <article
                    key={`${faq.category}-${faq.question}`}
                    className={`overflow-hidden rounded-xl border bg-white transition ${isOpen
                        ? "border-teal-200 shadow-sm"
                        : "border-slate-200"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
                      }
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                          <HelpCircle size={16} />
                        </span>
                        <span className="text-sm font-semibold leading-6 text-slate-800 sm:text-base">
                          {faq.question}
                        </span>
                      </div>

                      <ChevronDown
                        size={19}
                        className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-teal-700" : ""
                          }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={answerId}
                        className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6"
                      >
                        <p className="pl-10 text-sm leading-7 text-slate-600">
                          {faq.answer}
                        </p>
                        <div className="ml-10 mt-3">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                            {faq.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {filteredFAQs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                  <Search
                    size={32}
                    className="mx-auto text-slate-300"
                  />
                  <h3 className="mt-4 font-bold text-slate-800">
                    No questions found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try another keyword or select a different category.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All Questions");
                      setOpenIndex(0);
                    }}
                    className="mt-5 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-r from-teal-800 to-slate-900 p-8 sm:p-12">
          <div className="flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-300">
                <MessageCircle size={25} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  Still have questions?
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  Our support team is here to help you with
                  reporting issues and using CivicPulse.
                </p>
              </div>
            </div>

            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
            >
              <Mail size={17} />
              Contact Us
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
