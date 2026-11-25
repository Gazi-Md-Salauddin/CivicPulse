
"use client";

import { useState, type FormEvent } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Headphones,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Connect your contact API here.
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: "Contact our support team",
      detail: "For general questions and support",
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "Government Support",
      detail: "For urgent infrastructure concerns",
    },
    {
      icon: MapPin,
      title: "Our Location",
      value: "Bangladesh",
      detail: "Serving communities across the country",
    },
    {
      icon: Clock,
      title: "Working Hours",
      value: "Sunday – Thursday",
      detail: "9:00 AM – 5:00 PM",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#071F3D] px-4 py-20 text-white sm:py-24">
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-medium text-teal-300">
            <MessageSquare size={16} />
            We're Here to Help
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Get in <span className="text-teal-400">Touch</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Have questions, suggestions, or need assistance? Our team is
            ready to help you build a better and smarter community.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="relative mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm font-semibold text-teal-700">
                  {item.value}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Content */}
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-teal-700">
              Contact Support
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Let's make our cities
              <span className="text-teal-700"> better together.</span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
              Whether you need technical support, want to share feedback,
              or have questions about CivicPulse, send us a message.
              We're happy to hear from you.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Headphones size={21} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Dedicated Support
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Get assistance with reporting issues and tracking
                    infrastructure requests.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Your Privacy Matters
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your contact information is handled responsibly
                    and used only to respond to your request.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <h3 className="text-xl font-bold text-slate-900">
              Send Us a Message
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Fill out the form below and we'll get back to you.
            </p>

            {submitted ? (
              <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
                <CheckCircle2
                  size={42}
                  className="mx-auto text-green-600"
                />
                <h4 className="mt-4 font-bold text-green-800">
                  Form UI is ready!
                </h4>
                <p className="mt-2 text-sm text-green-700">
                  Connect your backend API to enable actual message delivery.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-sm font-semibold text-teal-700 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="report">Issue Reporting</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    minLength={10}
                    maxLength={2000}
                    placeholder="How can we help you?"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  Send Message
                  <Send size={17} />
                </button>

                <p className="text-center text-xs text-slate-400">
                  * Required fields
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#071F3D] px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Have an infrastructure issue?
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Don't just talk about the problem. Report it and help
            create a better city for everyone.
          </p>

          <a
            href="/create-issue"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-400"
          >
            Report an Issue
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}
