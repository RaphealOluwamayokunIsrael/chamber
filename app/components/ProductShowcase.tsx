"use client";

import {
  MessageSquare,
  Megaphone,
  Users,
  FolderOpen,
  CalendarDays,
  BarChart3,
  Sparkles,
} from "lucide-react";

import Reveal from "./Reveal";

const showcases = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Communication without the noise",
    description:
      "Keep your organization's conversations focused. Chamber gives members a dedicated space to communicate without getting lost in unrelated messages.",
    label: "Focused communication",
  },
  {
    icon: Megaphone,
    number: "02",
    title: "Keep everyone informed",
    description:
      "Important information deserves more than a message buried in a chat. Share announcements where everyone can easily find them.",
    label: "Organized announcements",
  },
  {
    icon: Users,
    number: "03",
    title: "Know your organization",
    description:
      "See the people who make up your organization and keep membership structured in one central workspace.",
    label: "Connected members",
  },
  {
    icon: FolderOpen,
    number: "04",
    title: "Keep resources together",
    description:
      "Important documents should not disappear inside conversations. Keep your organization's files accessible in one place.",
    label: "Centralized resources",
  },
  {
    icon: CalendarDays,
    number: "05",
    title: "Stay ahead of activities",
    description:
      "Keep organizational events visible so members know what is happening and what is coming next.",
    label: "Organized events",
  },
  {
    icon: BarChart3,
    number: "06",
    title: "Give everyone a voice",
    description:
      "Create polls and gather opinions from your members without creating another disconnected conversation.",
    label: "Simple participation",
  },
  {
    icon: Sparkles,
    number: "07",
    title: "Meet Chamber AI",
    description:
      "Get intelligent assistance for questions, writing, summaries, brainstorming and more — with Chamber AI growing alongside your organization.",
    label: "Intelligent assistance",
  },
];

export default function ProductShowcase() {
  return (
    <section className="bg-white px-6 py-24 transition-colors duration-300 dark:bg-gray-950 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Introduction */}
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Chamber in action
            </p>

            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-6xl">
              Everything your organization needs.
              <br />
              <span className="text-blue-600 dark:text-blue-400">
                In one place.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Chamber brings communication, people, resources and activities
              together into one focused organizational workspace.
            </p>
          </div>
        </Reveal>

        {/* Unfolding product sections */}
        <div className="mt-20 space-y-10 md:mt-28 md:space-y-16">
          {showcases.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.number} delay={index * 80}>
                <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 md:p-10">
                  {/* Decorative background */}
                  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl transition-transform duration-700 group-hover:scale-150 dark:bg-blue-900/20" />

                  <div className="relative grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr]">
                    {/* Visual side */}
                    <div className="flex min-h-[240px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:min-h-[300px]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold tracking-widest text-gray-400 dark:text-gray-600">
                          {item.number}
                        </span>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 h-1 w-12 rounded-full bg-blue-600" />

                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>

                        <div className="mt-4 space-y-3">
                          <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
                          <div className="h-3 w-4/5 rounded-full bg-gray-100 dark:bg-gray-800" />
                          <div className="h-3 w-3/5 rounded-full bg-gray-100 dark:bg-gray-800" />
                        </div>
                      </div>
                    </div>

                    {/* Text side */}
                    <div>
                      <div className="mb-5 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                        {item.label}
                      </div>

                      <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                        {item.title}
                      </h3>

                      <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
