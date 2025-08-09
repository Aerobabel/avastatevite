// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import personalHead from '../assets/personalhead.png';
import realHead from '../assets/realhead.png';
import influencer from '../assets/influencer.png';
import support from '../assets/support.png';
import educator from '../assets/educator.png';
import streamer from '../assets/streamer.png';

export default function LandingPage() {
  const previewCards = [
    { label: 'Photoreal Head', src: realHead },
    { label: 'Stylized VTuber', src: personalHead },
    { label: 'Educator', src: educator },
    { label: 'Influencer', src: influencer },
    { label: 'Support Agent', src: support },
    { label: 'Streamer Overlay', src: streamer },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl" />

      {/* Nav */}
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-md" />
            <span className="text-xl font-semibold tracking-tight text-gray-900">Avastate</span>
          </div>

          <div className="hidden gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900">Features</a>
            <a href="#how" className="text-sm font-medium text-gray-700 hover:text-gray-900">How it works</a>
            <a href="#use-cases" className="text-sm font-medium text-gray-700 hover:text-gray-900">Use cases</a>
          </div>

          <div className="flex items-center gap-3">
            <SignedOut>
              <Link to="/SignIn" className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-800 hover:text-gray-900">
                Sign in
              </Link>
              <Link to="/SignIn" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                Get started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/app" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                Open studio
              </Link>
            </SignedIn>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-7xl px-6">
        <section className="flex flex-col items-center gap-8 py-10 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
              Create lifelike{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                AI avatars
              </span>{' '}
              in minutes.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
              Avastate builds production-ready avatars and connects them to agentic frameworks, streaming pipelines,
              education platforms, and creator tooling. Custom lip-sync, expressive animation, and multi-modal brains—
              all in one place.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <SignedOut>
                <Link
                  to="/SignIn"
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Start free
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-400"
                >
                  Explore features
                </a>
              </SignedOut>

              <SignedIn>
                <Link
                  to="/CreateAvatar"
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Create an avatar
                </Link>
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-400"
                >
                  Open studio
                </Link>
              </SignedIn>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-10 w-full">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs font-medium text-gray-500">Avastate Studio</span>
                </div>
              </div>

              {/* Preview grid with images */}
              <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {previewCards.map((card) => (
                  <div
                    key={card.label}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-100 to-fuchsia-100 p-4"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/60 ring-1 ring-white/50 backdrop-blur">
                      <img
                        src={card.src}
                        alt={card.label}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">{card.label}</p>
                      <span className="rounded-lg bg-white/70 px-2 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200">
                        Avatar
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Built for production, tuned for expression
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-gray-600">
            From capture to character to connected actions—Avastate ships the full stack.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Custom lip-sync & animation', desc: 'High-fidelity visemes + expressive facial rigs for crisp, natural delivery.' },
              { title: 'Agentic brains', desc: 'Plug avatars into tools and frameworks that plan, reason, and act.' },
              { title: 'Realtime streaming', desc: 'Low-latency voice + video for Twitch, YouTube, and virtual events.' },
              { title: 'Education ready', desc: 'Teachers, tutors, and interactive lessons with safe controls.' },
              { title: 'Creator & influencer tools', desc: 'Spawn brand-consistent personas that scale content and engagement.' },
              { title: 'SDKs & APIs', desc: 'Ship everywhere: web, mobile, game engines, and broadcast suites.' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5">
                <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600" />
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-24 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { step: '1', title: 'Upload', desc: 'Selfie or reference pack. We handle cleanup and alignment.' },
              { step: '2', title: 'Generate', desc: 'Photoreal or stylized head + voice tuned to your brand.' },
              { step: '3', title: 'Connect', desc: 'Wire to tools: RAG, actions, calendars, CRMs, LMS, OBS.' },
              { step: '4', title: 'Go live', desc: 'Stream, teach, assist, or create content—everywhere.' },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                  {s.step}
                </div>
                <h3 className="text-base font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <SignedOut>
              <Link to="/SignIn" className="rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-indigo-700">
                Get started free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/CreateAvatar" className="rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-indigo-700">
                Create your first avatar
              </Link>
              <Link to="/app" className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-sm hover:border-gray-400">
                Open studio
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* Use cases */}
        <section id="use-cases" className="mx-auto max-w-6xl scroll-mt-24 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Use cases</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: 'Education', desc: 'Personalized tutors and lecturers that adapt to each learner.' },
              { title: 'Influencing & streaming', desc: 'Always-on creators with consistent voice, look, and brand.' },
              { title: 'CX & sales', desc: 'On-brand reps that can answer, schedule, and take action.' },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} Avastate. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-700">Docs</a>
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <a href="#" className="hover:text-gray-700">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
