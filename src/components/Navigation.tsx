'use client';

import { useState } from 'react';
import { Menu, X, Home, UserPlus, ClipboardCheck, Users, FlaskConical, LogIn, Shield, LogOut, DollarSign, Smartphone, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/inscription', label: 'Inscription', icon: UserPlus },
  { href: '/test', label: 'Évaluation', icon: ClipboardCheck },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const navItems = [
    ...PUBLIC_NAV_ITEMS,
    ...(user ? [{ href: '/expert', label: 'Espace Expert', icon: Users }] : []),
    ...(profile?.role === 'admin' ? [
      { href: '/admin', label: 'Administration', icon: Shield },
      { href: '/admin/finance', label: 'Finance', icon: DollarSign },
      { href: '/communication', label: 'Communication', icon: MessageCircle },
    ] : []),
    { href: '/talent', label: 'Modules', icon: Smartphone },
    { href: '/test-dashboard', label: 'Tests API', icon: FlaskConical },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-green-700">YIRA Emploi</h1>
          <p className="text-sm text-slate-500">Programme d&apos;insertion professionnelle</p>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
          {user ? (
            <button
              onClick={() => { signOut(); window.location.href = '/'; }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors ml-2"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors ml-2"
            >
              <LogIn size={16} />
              Connexion
            </a>
          )}
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
          {navItems.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              <Icon size={18} />
              {label}
            </a>
          ))}
          {user ? (
            <button
              onClick={() => { signOut(); window.location.href = '/'; }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <LogIn size={18} />
              Connexion
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
