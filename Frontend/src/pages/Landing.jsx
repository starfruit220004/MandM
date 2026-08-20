import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CoconutMark from '../components/CoconutMark';
import { api } from '../lib/api';

export default function Landing() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/landing-page')
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <CoconutMark size={44} spin />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <CoconutMark size={32} />
          <span className="font-display text-xl font-bold">CocoTrade</span>
        </div>
        <div>
          <Link to="/mamik" className="text-sm font-medium text-slate-600 hover:text-slate-900 mr-4">Sign in</Link>
          <Link to="/dashboard" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors">Go to App</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 px-6 sm:py-32">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-slate-500/30" />
        <div className="pointer-events-none absolute -right-10 top-32 h-56 w-56 rounded-full border border-slate-500/20" />
        <div className="pointer-events-none absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full border border-blue-600/20" />
        
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            {data.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            {data.subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/dashboard" className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Features</h2>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to manage your trade
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {(data.features || []).map((feature, idx) => (
                <div key={idx} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <div className="h-5 w-5 flex-none text-blue-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center">
        <p>Contact us: <a href={`mailto:${data.contact_email}`} className="text-blue-400 hover:underline">{data.contact_email}</a></p>
        <p className="mt-4 text-sm">&copy; {new Date().getFullYear()} CocoTrade. All rights reserved.</p>
      </footer>
    </div>
  );
}
