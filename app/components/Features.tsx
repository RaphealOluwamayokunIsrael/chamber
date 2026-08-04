export default function Features() {
  const features = [
    {
      title: "Secure Collaboration",
      description:
        "Communicate confidently with role-based access and protected workspaces.",
    },
    {
      title: "Organized Workspaces",
      description:
        "Keep discussions, resources and teams neatly structured.",
    },
    {
      title: "Built for Organizations",
      description:
        "Designed for universities, churches, companies, NGOs and communities.",
    },
  ];

  return (
    <section
      id="features"
      className="bg-gray-50 px-8 py-20 transition-colors duration-300 dark:bg-gray-900"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-bold text-gray-900 dark:text-white">
          Why Choose Chamber?
        </h2>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Everything your organization needs in one place.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-8 shadow-md transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>

              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}