export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-8 py-10 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            CHAMBER
          </h2>

          <p className="text-gray-600 dark:text-gray-400">
            Where Organizations Work Together.
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} RIO LAB. All rights reserved.
        </p>
      </div>
    </footer>
  );
}