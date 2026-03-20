'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, UserPlus, Coins, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import Navigation from '@/components/Navigation';

type Expert = {
  id: string;
  email: string;
  nom: string;
  prenom: string | null;
  pays: string | null;
  role: string;
  tokensCount: number;
  createdAt: string;
  _count: { beneficiaires: number };
};

export default function AdminPage() {
  const { user, profile, loading, session } = useAuth();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experts' | 'create' | 'tokens'>('experts');

  // Create expert form
  const [newExpert, setNewExpert] = useState({ email: '', nom: '', prenom: '', pays: '', role: 'expert', tokensCount: 10 });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Token form
  const [tokenForm, setTokenForm] = useState({ expertId: '', tokens: 10 });
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenMessage, setTokenMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchExperts = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/admin/experts', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExperts(data.experts || []);
      }
    } catch (e) {
      console.error('Erreur chargement experts:', e);
    } finally {
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token && profile?.role === 'admin') {
      fetchExperts();
    } else if (!loading) {
      setDataLoading(false);
    }
  }, [session, profile, loading, fetchExperts]);

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

  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="bg-gray-50 min-h-screen text-slate-900">
        <Navigation />
        <div className="max-w-md mx-auto p-8 mt-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Accès réservé aux administrateurs</h2>
          <p className="text-slate-500 mb-6">Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.</p>
          <a href="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  async function handleCreateExpert(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMessage(null);

    try {
      const res = await fetch('/api/admin/experts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify(newExpert),
      });

      const data = await res.json();
      if (res.ok) {
        setCreateMessage({ type: 'success', text: `Expert "${data.expert.nom}" créé avec succès.` });
        setNewExpert({ email: '', nom: '', prenom: '', pays: '', role: 'expert', tokensCount: 10 });
        fetchExperts();
      } else {
        setCreateMessage({ type: 'error', text: data.error || 'Erreur lors de la création.' });
      }
    } catch {
      setCreateMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleAssignTokens(e: React.FormEvent) {
    e.preventDefault();
    setTokenLoading(true);
    setTokenMessage(null);

    try {
      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify(tokenForm),
      });

      const data = await res.json();
      if (res.ok) {
        setTokenMessage({ type: 'success', text: `${tokenForm.tokens} crédits ajoutés à "${data.expert.nom}". Nouveau solde: ${data.expert.tokensCount}` });
        setTokenForm({ expertId: '', tokens: 10 });
        fetchExperts();
      } else {
        setTokenMessage({ type: 'error', text: data.error || 'Erreur.' });
      }
    } catch {
      setTokenMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setTokenLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen text-slate-900">
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-purple-600" size={28} />
            <h1 className="text-3xl font-bold">Administration YIRA</h1>
          </div>
          <p className="text-slate-600">Gérez les experts et les crédits IA de la plateforme.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border w-fit">
          {[
            { key: 'experts' as const, label: 'Liste des Experts', icon: Users },
            { key: 'create' as const, label: 'Créer un Expert', icon: UserPlus },
            { key: 'tokens' as const, label: 'Attribuer des Crédits', icon: Coins },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Experts List */}
        {activeTab === 'experts' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {dataLoading ? (
              <div className="p-12 text-center">
                <RefreshCw className="mx-auto h-8 w-8 text-slate-400 animate-spin mb-4" />
                <p className="text-slate-500">Chargement...</p>
              </div>
            ) : experts.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-500">Aucun expert enregistré.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Nom</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Pays</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Rôle</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Crédits</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Bénéficiaires</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {experts.map((expert) => (
                    <tr key={expert.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{expert.prenom || ''} {expert.nom}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{expert.email}</td>
                      <td className="px-6 py-4 text-sm">{expert.pays || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          expert.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {expert.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${expert.tokensCount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {expert.tokensCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{expert._count.beneficiaires}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Create Expert */}
        {activeTab === 'create' && (
          <div className="max-w-lg">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold mb-4">Créer un nouveau compte Expert</h2>

              {createMessage && (
                <div className={`rounded-lg p-4 mb-4 text-sm ${
                  createMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {createMessage.text}
                </div>
              )}

              <form onSubmit={handleCreateExpert} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newExpert.email}
                    onChange={(e) => setNewExpert({ ...newExpert, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="expert@yira-emploi.ci"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={newExpert.nom}
                      onChange={(e) => setNewExpert({ ...newExpert, nom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={newExpert.prenom}
                      onChange={(e) => setNewExpert({ ...newExpert, prenom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pays</label>
                  <select
                    value={newExpert.pays}
                    onChange={(e) => setNewExpert({ ...newExpert, pays: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Mali">Mali</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Guinée">Guinée</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="Niger">Niger</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                    <select
                      value={newExpert.role}
                      onChange={(e) => setNewExpert({ ...newExpert, role: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    >
                      <option value="expert">Expert</option>
                      <option value="candidate">Candidat</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Crédits initiaux</label>
                    <input
                      type="number"
                      min="0"
                      value={newExpert.tokensCount}
                      onChange={(e) => setNewExpert({ ...newExpert, tokensCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Créer le compte Expert
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Assign Tokens */}
        {activeTab === 'tokens' && (
          <div className="max-w-lg">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold mb-4">Attribuer des crédits IA</h2>

              {tokenMessage && (
                <div className={`rounded-lg p-4 mb-4 text-sm ${
                  tokenMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {tokenMessage.text}
                </div>
              )}

              <form onSubmit={handleAssignTokens} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expert *</label>
                  <select
                    required
                    value={tokenForm.expertId}
                    onChange={(e) => setTokenForm({ ...tokenForm, expertId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="">Sélectionner un expert...</option>
                    {experts.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.prenom || ''} {ex.nom} ({ex.email}) - {ex.tokensCount} crédits
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de crédits à ajouter *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tokenForm.tokens}
                    onChange={(e) => setTokenForm({ ...tokenForm, tokens: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={tokenLoading}
                  className="w-full bg-amber-500 text-white py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {tokenLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Coins size={18} />
                      Attribuer les crédits
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
