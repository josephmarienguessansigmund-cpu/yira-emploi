'use client';

import { useState } from 'react';
import { ClipboardCheck, ArrowLeft, Search, Loader2, ExternalLink, AlertCircle } from 'lucide-react';

type Step = 'lookup' | 'choose' | 'started';
type TestType = 'BIG_FIVE' | 'RIASEC' | 'SOFT_SKILLS' | 'MOTIVATION' | 'COMPLET';

const TEST_TYPES: { value: TestType; label: string; desc: string }[] = [
  { value: 'COMPLET', label: 'Évaluation complète', desc: 'Big Five + RIASEC + Soft Skills + Motivation' },
  { value: 'BIG_FIVE', label: 'Big Five (OCEAN)', desc: 'Traits de personnalité fondamentaux' },
  { value: 'RIASEC', label: 'RIASEC / Holland', desc: 'Intérêts professionnels et orientation carrière' },
  { value: 'SOFT_SKILLS', label: 'Soft Skills', desc: 'Compétences interpersonnelles et comportementales' },
  { value: 'MOTIVATION', label: 'Motivation', desc: 'Facteurs de motivation professionnelle' },
];

export default function TestPage() {
  const [step, setStep] = useState<Step>('lookup');
  const [telephone, setTelephone] = useState('');
  const [candidat, setCandidat] = useState<{ id: string; prenom: string; nom: string } | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestType>('COMPLET');
  const [testUrl, setTestUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/candidat?telephone=${encodeURIComponent(telephone)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Candidat non trouvé');
      }
      const data = await res.json();
      setCandidat(data.data);
      setStep('choose');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTest() {
    if (!candidat) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sigmund/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatId: candidat.id,
          telephone,
          prenom: candidat.prenom,
          nom: candidat.nom,
          typeEvaluation: selectedTest,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors du lancement du test');
      }

      const data = await res.json();
      setTestUrl(data.data.lienTest || '');
      setStep('started');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
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
            <div className="bg-blue-100 p-3 rounded-full">
              <ClipboardCheck className="text-blue-700" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Test Sigmund</h2>
              <p className="text-slate-500 text-sm">Évaluation psychométrique professionnelle</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Lookup by phone number */}
          {step === 'lookup' && (
            <>
              <p className="text-slate-600 mb-6">
                Entrez votre numéro de téléphone pour retrouver votre profil et démarrer l&apos;évaluation.
              </p>
              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ex: 0701020304"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}
                  {loading ? 'Recherche...' : 'Retrouver mon profil'}
                </button>
              </form>
              <p className="text-xs text-slate-400 mt-4 text-center">
                Pas encore inscrit ?{' '}
                <a href="/inscription" className="text-green-700 hover:underline">Créer un compte</a>
              </p>
            </>
          )}

          {/* Step 2: Choose test type */}
          {step === 'choose' && candidat && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">
                  Bienvenue, {candidat.prenom} {candidat.nom} !
                </p>
                <p className="text-green-700 text-sm">Choisissez le type d&apos;évaluation à passer.</p>
              </div>

              <div className="space-y-3 mb-6">
                {TEST_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTest === t.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="testType"
                      value={t.value}
                      checked={selectedTest === t.value}
                      onChange={() => setSelectedTest(t.value)}
                      className="mt-1 accent-blue-700"
                    />
                    <div>
                      <span className="font-medium text-slate-900">{t.label}</span>
                      <p className="text-slate-500 text-sm">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={handleStartTest}
                disabled={loading}
                className="w-full bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <ClipboardCheck size={18} />
                )}
                {loading ? 'Lancement...' : 'Démarrer le test'}
              </button>
            </>
          )}

          {/* Step 3: Test started */}
          {step === 'started' && (
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="text-green-700" size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Test lancé avec succès !</h3>
              <p className="text-slate-600 mb-6">
                Votre session d&apos;évaluation Sigmund a été créée.
                {testUrl
                  ? " Cliquez sur le bouton ci-dessous pour commencer."
                  : " Vous recevrez un SMS avec le lien pour passer le test."}
              </p>
              {testUrl && (
                <a
                  href={testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  <ExternalLink size={18} />
                  Passer le test maintenant
                </a>
              )}
              <div className="mt-6">
                <a href="/" className="text-slate-500 hover:text-slate-700 text-sm">
                  Retour à l&apos;accueil
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
