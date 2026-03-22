'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Clock, User, Send, Bot, Coins, AlertTriangle, RefreshCw } from 'lucide-react';
import Navigation from '@/components/Navigation';

type Beneficiaire = {
  id: string;
  prenom: string;
  nom: string;
  codeYira: string | null;
  niveau: string | null;
  district: string | null;
  statutParcours: string;
  testsSigmund: Array<{
    id: string;
    completedAt: string | null;
    estValideParExpert: boolean;
    rapport: string | null;
  }>;
};

type TestEnAttente = {
  id: string;
  completedAt: string | null;
  talent: {
    prenom: string;
    nom: string;
    codeYira: string | null;
    niveau: string | null;
    district: string | null;
  };
};

export default function ExpertDashboard() {
  const { user, profile, loading, session } = useAuth();
  const [tests, setTests] = useState<TestEnAttente[]>([]);
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tests' | 'beneficiaires' | 'coaching' | 'videos'>('tests');
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [tokensLeft, setTokensLeft] = useState<number | null>(null);

  useEffect(() => {
    if (profile) {
      setTokensLeft(profile.tokensCount);
    }
  }, [profile]);

  useEffect(() => {
    if (!session?.access_token) return;

    async function fetchData() {
      try {
        const res = await fetch('/api/expert/beneficiaires', {
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTests(data.tests || []);
          setBeneficiaires(data.beneficiaires || []);
        }
      } catch (e) {
        console.error('Erreur chargement données:', e);
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, [session]);

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

  if (!user || !profile) {
    return (
      <div className="bg-gray-50 min-h-screen text-slate-900">
        <Navigation />
        <div className="max-w-md mx-auto p-8 mt-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Accès restreint</h2>
          <p className="text-slate-500 mb-6">Connectez-vous pour accéder à l&apos;espace expert.</p>
          <a href="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  async function sendChatMessage() {
    if (!chatMessage.trim() || chatLoading) return;
    if (tokensLeft !== null && tokensLeft <= 0) return;

    const userMsg = chatMessage.trim();
    setChatHistory((prev) => [...prev, { role: 'user', content: userMsg }]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({
          message: userMsg,
          beneficiaireId: selectedBeneficiaire,
        }),
      });

      const data = await res.json();

      if (res.status === 402) {
        setTokensLeft(0);
        setChatHistory((prev) => [
          ...prev,
          { role: 'system', content: 'Vos crédits YIRA sont épuisés. Veuillez recharger pour continuer.' },
        ]);
      } else if (res.ok) {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        if (typeof data.tokensRemaining === 'number') {
          setTokensLeft(data.tokensRemaining);
        }
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: 'system', content: data.error || 'Erreur lors de la communication avec l\'IA.' },
        ]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: 'system', content: 'Erreur réseau. Veuillez réessayer.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen text-slate-900">
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Console d&apos;Expertise YIRA</h1>
            <p className="text-slate-600">
              Bienvenue, <span className="font-semibold">{profile.prenom || ''} {profile.nom}</span>
              {profile.role === 'admin' && (
                <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">Admin</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
              <Coins size={18} className="text-amber-600" />
              <span className="font-bold text-amber-700">{tokensLeft ?? '...'}</span>
              <span className="text-amber-600 text-sm">crédits</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border w-fit">
          {[
            { key: 'tests' as const, label: 'Tests en attente' },
            { key: 'beneficiaires' as const, label: 'Bénéficiaires' },
            { key: 'coaching' as const, label: 'Coaching IA' },
            { key: 'videos' as const, label: 'Vidéos Coaching' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="grid gap-4">
            {dataLoading ? (
              <div className="bg-white p-12 text-center rounded-xl shadow-sm border">
                <RefreshCw className="mx-auto h-8 w-8 text-slate-400 animate-spin mb-4" />
                <p className="text-slate-500">Chargement...</p>
              </div>
            ) : tests.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl shadow-sm border">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p>Aucun test en attente de validation.</p>
              </div>
            ) : (
              tests.map((test) => (
                <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{test.talent.prenom} {test.talent.nom}</h3>
                      <div className="flex gap-4 text-sm text-slate-500">
                        {test.talent.codeYira && (
                          <span className="font-mono text-green-600">{test.talent.codeYira}</span>
                        )}
                        <span>{test.talent.niveau || ''}</span>
                        <span>{test.talent.district || ''}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`/expert/validation/${test.id}`}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                  >
                    Expertiser
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {/* Beneficiaires Tab */}
        {activeTab === 'beneficiaires' && (
          <div className="grid gap-4">
            {dataLoading ? (
              <div className="bg-white p-12 text-center rounded-xl shadow-sm border">
                <RefreshCw className="mx-auto h-8 w-8 text-slate-400 animate-spin mb-4" />
                <p className="text-slate-500">Chargement...</p>
              </div>
            ) : beneficiaires.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl shadow-sm border">
                <p className="text-slate-500">Aucun bénéficiaire assigné.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Nom</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Code YIRA</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Niveau</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">District</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Statut</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Tests</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {beneficiaires.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">{b.prenom} {b.nom}</td>
                        <td className="px-6 py-4 font-mono text-green-600 text-sm">{b.codeYira || '-'}</td>
                        <td className="px-6 py-4 text-sm">{b.niveau || '-'}</td>
                        <td className="px-6 py-4 text-sm">{b.district || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                            {b.statutParcours}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{b.testsSigmund.length}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedBeneficiaire(b.id);
                              setActiveTab('coaching');
                              setChatHistory([]);
                            }}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            Coaching IA
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Coaching IA Tab */}
        {activeTab === 'coaching' && (
          <div className="bg-white rounded-xl shadow-sm border flex flex-col" style={{ height: '70vh' }}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="text-green-600" size={24} />
                <div>
                  <h3 className="font-bold">YIRA Coach IA</h3>
                  <p className="text-xs text-slate-500">
                    {selectedBeneficiaire
                      ? `Analyse du bénéficiaire: ${beneficiaires.find((b) => b.id === selectedBeneficiaire)?.prenom || ''} ${beneficiaires.find((b) => b.id === selectedBeneficiaire)?.nom || ''}`
                      : 'Sélectionnez un bénéficiaire ou posez une question générale'}
                  </p>
                </div>
              </div>
              {selectedBeneficiaire && (
                <button
                  onClick={() => setSelectedBeneficiaire(null)}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Désélectionner
                </button>
              )}
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-slate-400 mt-16">
                  <Bot size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Posez une question sur un bénéficiaire pour commencer le coaching IA.</p>
                  <p className="text-sm mt-2">L&apos;IA analysera les résultats Sigmund et proposera des recommandations.</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white'
                        : msg.role === 'system'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              {tokensLeft !== null && tokensLeft <= 0 ? (
                <div className="text-center">
                  <p className="text-amber-700 font-medium mb-3">Vos crédits YIRA sont épuisés</p>
                  <button className="bg-amber-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors">
                    Recharger vos crédits YIRA
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                    placeholder="Posez votre question au coach IA..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatMessage.trim()}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Videos Coaching Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold mb-4">Vid&eacute;os de coaching &amp; formation</h2>
              <p className="text-slate-500 text-sm mb-6">Capsules vid&eacute;o pour accompagner les b&eacute;n&eacute;ficiaires dans leur parcours d&apos;insertion.</p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Video 1 */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 flex flex-col items-center justify-center">
                    <div className="bg-green-700 text-white w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <p className="text-green-700 text-xs font-medium">Emplacement vid&eacute;o</p>
                    {/* Remplacer par: <video controls className="w-full h-full" src="/videos/reussir-test.mp4" /> */}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1">R&eacute;ussir son test psychom&eacute;trique</h3>
                    <p className="text-xs text-slate-500">Comment se pr&eacute;parer aux tests Big Five, RIASEC, Soft Skills et Motivation.</p>
                  </div>
                </div>

                {/* Video 2 */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 flex flex-col items-center justify-center">
                    <div className="bg-orange-600 text-white w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <p className="text-orange-700 text-xs font-medium">Emplacement vid&eacute;o</p>
                    {/* Remplacer par: <video controls className="w-full h-full" src="/videos/tuto-ussd.mp4" /> */}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1">Tuto USSD *789#</h3>
                    <p className="text-xs text-slate-500">Guide complet pour s&apos;inscrire et acc&eacute;der aux r&eacute;sultats via USSD.</p>
                  </div>
                </div>

                {/* Video 3 */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center">
                    <div className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <p className="text-blue-700 text-xs font-medium">Emplacement vid&eacute;o</p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1">Comprendre son profil Holland (RIASEC)</h3>
                    <p className="text-xs text-slate-500">D&eacute;crypter le code Holland pour orienter les b&eacute;n&eacute;ficiaires.</p>
                  </div>
                </div>

                {/* Video 4 */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center">
                    <div className="bg-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <p className="text-purple-700 text-xs font-medium">Emplacement vid&eacute;o</p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1">Coaching : entretien d&apos;embauche</h3>
                    <p className="text-xs text-slate-500">Pr&eacute;parer les jeunes aux entretiens d&apos;embauche dans le contexte ivoirien.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
