export default function BuiltFor() {
  const groups = [
    "🏛 Universities",
    "⛪ Churches",
    "🏢 Companies",
    "🌍 NGOs",
    "🤝 Communities",
  ];

  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-bold">
          Built For
        </h2>

        <p className="mt-4 text-gray-600">
          Chamber adapts to every kind of organization.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {groups.map((group) => (
            <div
              key={group}
              className="rounded-full border px-6 py-3 text-lg"
            >
              {group}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}