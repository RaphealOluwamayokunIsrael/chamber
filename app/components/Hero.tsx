export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-28 text-center bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <h1 className="text-5xl md:text-6xl font-bold leading-tight">
        One Platform.
        <br />
        Every Organization.
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
        Chamber helps universities, churches, companies,
        NGOs and communities communicate, collaborate
        and stay organized in one secure workspace.
      </p>

      <button className="mt-10 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700">
        Get Started
      </button>
    </section>
  );
}