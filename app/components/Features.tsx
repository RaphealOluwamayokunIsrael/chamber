"use client";

import {
  MessageSquare,
  Megaphone,
  Users,
  FolderOpen,
  CalendarDays,
  BarChart3,
} from "lucide-react";

import Reveal from "./Reveal";

const features = [
  {
    icon: MessageSquare,
    title: "Communication",
    description:
      "Keep conversations focused and organized without the noise of ordinary messaging apps.",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    description:
      "Share important information with the right people and keep your organization informed.",
  },
  {
    icon: Users,
    title: "Members",
    description:
      "Know who belongs to your organization and keep your community structured.",
  },
  {
    icon: FolderOpen,
    title: "Files",
    description:
      "Keep important documents and resources together in one accessible workspace.",
  },
  {
    icon: CalendarDays,
    title: "Events",
    description:
      "Keep organizational activities and important events visible and organized.",
  },
  {
    icon: BarChart3,
    title: "Polls",
    description:
      "Gather opinions and make participation easier with simple organizational polls.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-gray-50 px-6 py-24 transition-colors duration-300 dark:bg-gray-900 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section introduction */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Everything in one place
            </p>

            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl">
              Your organization,
              <br />
              <span className="text-blue-600 dark:text-blue-400">
                organized.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Chamber brings the everyday tools your organization needs into
              one focused workspace.
            </p>
          </div>
        </Reveal>

        {/* Feature cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.title} delay={index * 100}>
                <div className="group h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Closing statement */}
        <Reveal delay={200}>
          <div className="mx-auto mt-20 max-w-2xl text-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Less distraction. More organization. One Chamber.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
