export default function Footer() {
  return (
    <footer className="border-t px-8 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-xl font-bold">
            CHAMBER
          </h2>

          <p className="text-gray-500">
            Where Organizations Work Together.
          </p>
        </div>

        <p className="text-gray-500">
          © {new Date().getFullYear()} RIO LAB. All rights reserved.
        </p>
      </div>
    </footer>
  );
}