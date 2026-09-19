import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import ProductShowcase from "./components/ProductShowcase";
import BuiltFor from "./components/BuiltFor";
import Footer from "./components/Footer";
import MyChambers from "./my-chambers/MyChambers";

export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <main>
        <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
          <MyChambers />
        </section>

        <Features />

        <ProductShowcase />

        <BuiltFor />
      </main>

      <Footer />
    </>
  );
}