'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { CheckCircle, XCircle, ArrowLeft, User, FileText, AlertTriangle } from 'lucide-react';

type TestDetail = {
  id: string;
  completedAt: string | null;
  estValideParExpert: boolean;
  rapport: string | null;
  scoreAdequation: number | null;
  scoreLongevite: number | null;
  scoreTransformation: number | null;
  scoreEmployabilite: number | null;
  niveauRisque: string | null;
  syntheseIA: string | null;
  posteVise: string | null;
  talent: {
    id: string;
    prenom: string;
    nom: string;
    codeYira: string | null;
    niveau: string | null;
    district: string | null;
    telephone: string;
    specialite: string | null;
    statutParcours: string;
  };
};

export default function ValidationPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.access_token || !testId) return;

    async function fetchTest() {
      try {
        const res = await fetch(`/api/expert/test/${testId}/valider`, {
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTest(data.test);
        } else {
          setError('Test non trouvé ou accès refusé.');
        }
      } catch {
        setError('Erreur de chargement.');
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [session, testId]);

  async function handleValidation(valide: boolean) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/expert/test/${testId}/valider`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ valide, commentaire }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la validation.');
      }
    } catch {
      setError('Erreur réseau.');
    } finally {
      setSubmitting(false);
    }
  }

  function parseRapport(rapport: string | null): Record<string, unknown> | null {
    if (!rapport) return null;
    try { return JSON.parse(rapport); } catch { return null; }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen text-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-gray-50 min-h-screen text-slate-900">
        <Navigation />
        <div className="max-w-lg mx-auto p-8 mt-16 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Validation enregistrée</h2>
          <p className="text-slate-500 mb-6">Le bénéficiaire sera notifié par SMS.</p>
          <button
            onClick={() => router.push('/expert')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="bg-gray-50 min-h-screen text-slate-900">
        <Navigation />
        <div className="max-w-lg mx-auto p-8 mt-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
          <p className="text-slate-600 mb-4">{error || 'Test introuvable.'}</p>
          <button onClick={() => router.push('/expert')} className="text-green-600 underline font-medium">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const rapport = parseRapport(test.rapport);
  const codeHolland = rapport ? ((rapport as Record<string, Record<string, string>>).riasec?.holland_code || (rapport as Record<string, string>).code_holland || null) : null;

  return (
    <div className="bg-gray-50 min-h-screen text-slate-900">
      <Navigation />
      <div className="max-w-4xl mx-auto p-8">
        <button onClick={() => router.push('/expert')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={18} /> Retour au tableau de bord
        </button>

        <h1 className="text-2xl font-bold mb-6">Validation du test SIGMUND</h1>

        {/* Talent info */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full"><User className="text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold">{test.talent.prenom} {test.talent.nom}</h2>
              <div className="flex gap-4 text-sm text-slate-500 flex-wrap">
                {test.talent.codeYira && <span className="font-mono text-green-600">{test.talent.codeYira}</span>}
                <span>{test.talent.niveau || '-'}</span>
                <span>{test.talent.district || '-'}</span>
                <span>{test.talent.specialite || '-'}</span>
                <span>{test.talent.statutParcours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={20} /> Résultats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Employabilité', value: test.scoreEmployabilite },
              { label: 'Adéquation', value: test.scoreAdequation },
              { label: 'Longévité', value: test.scoreLongevite },
              { label: 'Transformation', value: test.scoreTransformation },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{s.value ?? '-'}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
          {codeHolland && (
            <p className="text-sm text-slate-600">Code Holland : <span className="font-bold">{codeHolland}</span></p>
          )}
          {test.niveauRisque && (
            <p className="text-sm text-slate-600">Niveau de risque : <span className="font-bold">{test.niveauRisque}</span></p>
          )}
          {test.posteVise && (
            <p className="text-sm text-slate-600">Poste visé : <span className="font-bold">{test.posteVise}</span></p>
          )}
          {test.syntheseIA && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">{test.syntheseIA}</div>
          )}
        </div>

        {/* Validation form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold text-lg mb-4">Décision de l&apos;expert</h3>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Commentaire ou observations (optionnel)..."
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <div className="flex gap-4">
            <button
              onClick={() => handleValidation(true)}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} /> Valider le test
            </button>
            <button
              onClick={() => handleValidation(false)}
              disabled={submitting}
              className="flex-1 bg-red-50 text-red-700 border border-red-200 py-3 rounded-lg font-medium hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle size={20} /> À revoir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
