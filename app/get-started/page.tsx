import Link from "next/link";

export default function GetStartedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 dark:bg-gray-950">

      <div className="w-full max-w-2xl text-center">

        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
          Welcome to Chamber
        </h1>

        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
          Where organizations communicate,
          collaborate and stay organized.
        </p>

        <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-10 shadow-xl dark:border-gray-800 dark:bg-gray-900">

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            How would you like to begin?
          </h2>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Create a new account or sign in to continue.
          </p>

          <div className="mt-10 space-y-5">
                      <Link
              href="/signup"
              className="block w-full rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              Create Account
            </Link>

            <Link
              href="/login"
              className="block w-full rounded-2xl border border-gray-300 py-4 text-lg font-semibold text-gray-900 transition hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
            >
              Sign In
            </Link>

          </div>

        </div>

        <div className="mt-10">

          <p className="text-sm text-gray-500">
            Powered by
          </p>

          <h3 className="mt-1 text-2xl font-bold tracking-widest text-gray-900 dark:text-white">
            RIO LAB
          </h3>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Building purposeful software for organizations.
          </p>

        </div>

      </div>

    </main>
  );
}