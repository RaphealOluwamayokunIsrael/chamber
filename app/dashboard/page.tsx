export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-5xl font-extrabold text-gray-900">
          Welcome to Chamber 👋
        </h1>

        <p className="mt-3 text-lg font-semibold text-gray-700">
          Your organization starts here.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-extrabold text-gray-900">
              Create Chamber
            </h2>

            <p className="mt-3 font-medium text-gray-700">
              Start a new organization workspace.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-extrabold text-gray-900">
              Join Chamber
            </h2>

            <p className="mt-3 font-medium text-gray-700">
              Join an existing organization.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-extrabold text-gray-900">
              Notifications
            </h2>

            <p className="mt-3 font-medium text-gray-700">
              Stay updated with announcements.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-extrabold text-gray-900">
              Profile
            </h2>

            <p className="mt-3 font-medium text-gray-700">
              Manage your account settings.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}