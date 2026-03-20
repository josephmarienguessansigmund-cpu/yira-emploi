'use client';

import { useState } from 'react';
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const NIVEAUX = [
  { value: 'Sans diplôme', label: 'Sans diplôme' },
  { value: 'BEPC/BEF', label: 'BEPC / BEF' },
  { value: 'BAC', label: 'BAC' },
  { value: 'BTS/DUT', label: 'BTS / DUT' },
  { value: 'Licence+', label: 'Licence et plus' },
];

const DISTRICTS = [
  'Abidjan', 'Bouaké', 'Daloa', 'Korhogo', 'San-Pédro',
  'Yamoussoukro', 'Man', 'Gagnoa', 'Abengourou', 'Autre',
];

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function InscriptionPage() {
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    niveau: '',
    district: '',
  });
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setState('success');
    } catch (err: unknown) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inattendue');
    }
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Inscription réussie !</h2>
          <p className="text-slate-600 mb-6">
            Votre compte YIRA Emploi a été créé. Vous pouvez maintenant passer votre test d&apos;évaluation Sigmund.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/test"
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors"
            >
              Passer le test Sigmund
            </a>
            <a href="/" className="text-slate-500 hover:text-slate-700 text-sm">
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-700">YIRA Emploi</h1>
            <p className="text-sm text-slate-500">Plateforme d&apos;insertion professionnelle</p>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} />
            Accueil
          </a>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <UserPlus className="text-green-700" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Inscription</h2>
              <p className="text-slate-500 text-sm">Créez votre profil pour accéder aux évaluations</p>
            </div>
          </div>

          {state === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-slate-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  required
                  value={form.prenom}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Ex: Awa"
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  required
                  value={form.nom}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Ex: Koné"
                />
              </div>
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-slate-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                required
                value={form.telephone}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="Ex: 0701020304"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-slate-400">(optionnel)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="Ex: awa@email.com"
              />
            </div>

            <div>
              <label htmlFor="niveau" className="block text-sm font-medium text-slate-700 mb-1">
                Niveau d&apos;étude *
              </label>
              <select
                id="niveau"
                name="niveau"
                required
                value={form.niveau}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                <option value="">Sélectionnez...</option>
                {NIVEAUX.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-slate-700 mb-1">
                District / Région *
              </label>
              <select
                id="district"
                name="district"
                required
                value={form.district}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                <option value="">Sélectionnez...</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === 'loading' ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Vous avez déjà un compte ?{' '}
            <a href="/test" className="text-green-700 hover:underline">Passer le test</a>
          </p>
        </div>
      </main>
    </div>
  );
}
