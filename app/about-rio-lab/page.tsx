import Link from "next/link";

export default function AboutRioLab() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-gray-950">

      <div className="mx-auto max-w-6xl px-8 py-20">

        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white">
          RIO LAB
        </h1>

        <p className="mt-4 text-2xl text-blue-600 font-semibold">
          Building Purposeful Software.
        </p>

        <p className="mt-8 max-w-3xl text-lg text-gray-600 dark:text-gray-300 leading-8">
          RIO LAB creates secure, reliable and modern software that helps
          organizations communicate, collaborate and become more productive.
        </p>

        <section className="mt-20">

          <h2 className="text-4xl font-bold">
            Our Mission
          </h2>

          <p className="mt-5 text-lg text-gray-600 dark:text-gray-300">
            To build secure, simple and reliable software that empowers
            organizations to work together efficiently.
          </p>

        </section>

        <section className="mt-16">

          <h2 className="text-4xl font-bold">
            Our Vision
          </h2>

          <p className="mt-5 text-lg text-gray-600 dark:text-gray-300">
            To become one of Africa's leading software companies,
            creating technology that transforms how organizations
            communicate and collaborate.
          </p>

        </section>

        <section className="mt-16">

          <h2 className="text-4xl font-bold">
            Our Values
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              💡
              <h3 className="mt-4 text-2xl font-bold">Innovation</h3>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              🔒
              <h3 className="mt-4 text-2xl font-bold">Security</h3>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              ⚖️
              <h3 className="mt-4 text-2xl font-bold">Integrity</h3>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              🤝
              <h3 className="mt-4 text-2xl font-bold">Reliability</h3>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              🚀
              <h3 className="mt-4 text-2xl font-bold">Productivity</h3>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              ⭐
              <h3 className="mt-4 text-2xl font-bold">Excellence</h3>
            </div>

          </div>

        </section>

        <section className="mt-20">

          <h2 className="text-4xl font-bold">
            Our Products
          </h2>

          <div className="mt-8 rounded-3xl bg-white p-10 shadow-xl">

            <h3 className="text-2xl font-bold">
              Chamber
            </h3>

            <p className="mt-4 text-gray-600">
              A secure collaboration platform built for universities,
              churches, companies, NGOs and communities.
            </p>

            <p className="mt-6 text-blue-600 font-semibold">
              More products coming soon...
            </p>

          </div>

        </section>

        <div className="mt-20">

          <Link
            href="/welcome"
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700"
          >
            ← Back to Chamber
          </Link>

        </div>

      </div>

    </main>
  );
}