export default function BuiltFor() {
  const groups = [
    "🏛 Universities",
    "⛪ Churches",
    "🏢 Companies",
    "🌍 NGOs",
    "🤝 Communities",
  ];

  return (
    <section
      id="builtfor"
      className="bg-white px-8 py-20 transition-colors duration-300 dark:bg-gray-950"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
          Built For
        </h2>

        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Chamber adapts to every kind of organization.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {groups.map((group) => (
            <div
              key={group}
              className="rounded-full border border-gray-300 bg-gray-100 px-6 py-3 text-lg font-medium text-gray-800 transition-all duration-300 hover:bg-blue-600 hover:text-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-blue-600"
            >
              {group}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}