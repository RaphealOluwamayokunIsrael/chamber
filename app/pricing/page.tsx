"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Crown } from "lucide-react";

const features = [
  "Your existing Chamber workspaces",
  "A dedicated place for future premium features",
  "Clear subscription information before any payment",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#061b39] via-[#0a3163] to-[#f4f8ff] px-4 py-10 text-white sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/welcome" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 hover:text-white">
          <ArrowLeft size={17} /> Back to Chamber
        </Link>
        <div className="mt-12 flex items-center gap-3">
          <Crown size={32} className="text-[#f4c76a]" />
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">Chamber Pro</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Choose how you use Chamber.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-blue-100">Your current Chamber experience remains available. Premium subscriptions will be offered here when payment and entitlement management are configured.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <section className="rounded-3xl border border-[#d7e2f1] bg-white p-7 text-[#071426] shadow-xl">
            <h2 className="text-2xl font-bold">Free</h2>
            <p className="mt-2 text-sm text-slate-600">Continue with your current workspace access.</p>
            <p className="mt-6 text-3xl font-bold">₦0</p>
            <Link href="/welcome" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#082653] px-5 py-3 font-semibold text-white hover:bg-[#164f96]">Continue to Chamber <ArrowRight size={17} /></Link>
          </section>
          <section className="rounded-3xl border border-[#6aa8f6] bg-white p-7 text-[#071426] shadow-xl">
            <div className="flex items-center gap-2"><Crown size={22} className="text-[#a57917]" /><h2 className="text-2xl font-bold">Pro</h2></div>
            <p className="mt-2 text-sm text-slate-600">Premium plan details and pricing will be published before checkout is enabled.</p>
            <p className="mt-6 text-lg font-bold text-[#164f96]">Not available for purchase yet</p>
            <p className="mt-8 rounded-xl bg-[#eaf2ff] p-3 text-sm leading-6 text-[#142B4A]">Payments are not enabled. No charge will be made on this page.</p>
          </section>
        </div>
        <section className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-6">
          <h2 className="text-lg font-bold">What to expect</h2>
          <ul className="mt-4 space-y-3">{features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm text-blue-50"><Check size={18} className="mt-0.5 shrink-0" />{feature}</li>)}</ul>
        </section>
      </div>
    </main>
  );
}
