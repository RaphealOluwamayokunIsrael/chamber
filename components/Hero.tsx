export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-28 text-center">
      <h1 className="text-6xl font-bold leading-tight">
        One Platform.
        <br />
        Every Organization.
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-600">
        Chamber helps universities, churches, companies,
        NGOs and communities communicate, collaborate
        and stay organized in one secure workspace.
      </p>

      <button className="mt-10 rounded-xl bg-black px-8 py-4 text-lg text-white hover:bg-gray-800">
        Get Started
      </button>
    </section>
  );
}