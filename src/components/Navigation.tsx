'use client';

import { useState } from 'react';
import { Menu, X, Home, UserPlus, ClipboardCheck, Users, FlaskConical } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/inscription', label: 'Inscription', icon: UserPlus },
  { href: '/test', label: 'Évaluation', icon: ClipboardCheck },
  { href: '/expert', label: 'Espace Expert', icon: Users },
  { href: '/test-dashboard', label: 'Tests API', icon: FlaskConical },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-green-700">YIRA Emploi</h1>
          <p className="text-sm text-slate-500">Programme d&apos;insertion professionnelle</p>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t bg-white px-6 py-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              <Icon size={18} />
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
