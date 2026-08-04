export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur transition-colors dark:border-gray-800 dark:bg-gray-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <h1 className="text-2xl font-extrabold tracking-wide text-gray-900 dark:text-white">
          CHAMBER
        </h1>

        <div className="hidden gap-8 md:flex">
          <a
            href="#features"
            className="text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Features
          </a>

          <a
            href="#builtfor"
            className="text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Built For
          </a>

          <a
            href="#"
            className="text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Contact
          </a>
        </div>

        <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </nav>
  );
}