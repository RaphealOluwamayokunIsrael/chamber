export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <h1 className="text-2xl font-extrabold tracking-wide">
          CHAMBER
        </h1>

        <div className="hidden gap-8 md:flex">
          <a href="#features" className="hover:text-blue-600 transition">
            Features
          </a>

          <a href="#builtfor" className="hover:text-blue-600 transition">
            Built For
          </a>

          <a href="#" className="hover:text-blue-600 transition">
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