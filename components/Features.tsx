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
    <section className="bg-gray-50 px-8 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-bold">
          Why Choose Chamber?
        </h2>

        <p className="mt-4 text-center text-gray-600">
          Everything your organization needs in one place.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl bg-white p-8 shadow-md"
            >
              <h3 className="text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="mt-4 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}