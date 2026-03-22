'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, AlertTriangle, RefreshCw, DollarSign, TrendingUp, CreditCard, ArrowDownToLine, Smartphone } from 'lucide-react';
import Navigation from '@/components/Navigation';

type FinanceData = {
  resume: {
    totalRecettes: number;
    totalTransactionsSucces: number;
    totalPaiements: number;
    totalEnAttente: number;
    totalEchec: number;
    totalTalents: number;
    devise: string;
    beneficiaire: string;
  };
  ventilationParType: Record<string, { count: number; total: number }>;
  ventilationParOperateur: Record<string, { count: number; total: number }>;
  ventilationParMois: Record<string, { count: number; total: number }>;
  derniersPaiements: Array<{
    id: string;
    montant: number;
    statut: string;
    operateur: string;
    typePaiement: string;
    reference: string;
    talent: string;
    telephone: string;
    date: string;
  }>;
};

export default function AdminFinancePage() {
  const { user, profile, loading, session } = useAuth();
  const [data, setData] = useState<FinanceData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchFinance = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/admin/finance', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Erreur chargement finance:', e);
    } finally {
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token && profile?.role === 'admin') {
      fetchFinance();
    } else if (!loading) {
      setDataLoading(false);
    }
  }, [session, profile, loading, fetchFinance]);

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
          <h2 className="text-xl font-bold mb-2">Acc&egrave;s r&eacute;serv&eacute; aux administrateurs</h2>
          <p className="text-slate-500 mb-6">Vous n&apos;avez pas les droits n&eacute;cessaires.</p>
          <a href="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  const formatFCFA = (montant: number) =>
    new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';

  const statutBadge = (statut: string) => {
    const classes: Record<string, string> = {
      SUCCESS: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      ECHEC: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      SUCCESS: 'Succès',
      pending: 'En attente',
      ECHEC: 'Échoué',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${classes[statut] || 'bg-gray-100 text-gray-700'}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen text-slate-900">
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={28} />
            <h1 className="text-3xl font-bold">Finance &mdash; Recettes YIRA</h1>
          </div>
          <p className="text-slate-600">
            Tableau de bord financier &mdash; B&eacute;n&eacute;ficiaire : <strong>Nohama Consulting</strong>
          </p>
          <button
            onClick={fetchFinance}
            className="mt-3 flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
          >
            <RefreshCw size={14} />
            Actualiser
          </button>
        </header>

        {dataLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="mx-auto h-8 w-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500">Chargement des donn&eacute;es financi&egrave;res...</p>
          </div>
        ) : !data ? (
          <div className="p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">Aucune donn&eacute;e disponible.</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <span className="text-sm text-slate-500">Recettes totales</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{formatFCFA(data.resume.totalRecettes)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CreditCard className="text-blue-600" size={20} />
                  </div>
                  <span className="text-sm text-slate-500">Transactions r&eacute;ussies</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{data.resume.totalTransactionsSucces}</p>
                <p className="text-xs text-slate-400 mt-1">
                  sur {data.resume.totalPaiements} total &mdash; {data.resume.totalEnAttente} en attente &mdash; {data.resume.totalEchec} &eacute;chou&eacute;s
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Smartphone className="text-orange-600" size={20} />
                  </div>
                  <span className="text-sm text-slate-500">Talents inscrits</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{data.resume.totalTalents}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <ArrowDownToLine className="text-purple-600" size={20} />
                  </div>
                  <span className="text-sm text-slate-500">Virement</span>
                </div>
                <p className="text-sm font-medium text-purple-700">Nohama Consulting</p>
                <p className="text-xs text-slate-400 mt-1">Solde disponible : {formatFCFA(data.resume.totalRecettes)}</p>
              </div>
            </div>

            {/* Ventilation par type et opérateur */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-lg mb-4">Par type de produit</h3>
                {Object.keys(data.ventilationParType).length === 0 ? (
                  <p className="text-sm text-slate-400">Aucune transaction</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(data.ventilationParType).map(([type, val]) => (
                      <div key={type} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-400">{val.count} transaction(s)</p>
                        </div>
                        <span className="font-bold text-green-700">{formatFCFA(val.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-lg mb-4">Par op&eacute;rateur Mobile Money</h3>
                {Object.keys(data.ventilationParOperateur).length === 0 ? (
                  <p className="text-sm text-slate-400">Aucune transaction</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(data.ventilationParOperateur).map(([op, val]) => {
                      const colors: Record<string, string> = {
                        Orange: 'text-orange-600',
                        MTN: 'text-yellow-600',
                        Moov: 'text-blue-600',
                      };
                      return (
                        <div key={op} className="flex justify-between items-center">
                          <div>
                            <p className={`font-medium text-sm ${colors[op] || 'text-slate-700'}`}>{op}</p>
                            <p className="text-xs text-slate-400">{val.count} transaction(s)</p>
                          </div>
                          <span className="font-bold text-green-700">{formatFCFA(val.total)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Dernières transactions */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="font-bold text-lg">Derni&egrave;res transactions</h3>
              </div>
              {data.derniersPaiements.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Aucune transaction enregistr&eacute;e.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Talent</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Op&eacute;rateur</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Montant</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Statut</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">R&eacute;f&eacute;rence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.derniersPaiements.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 text-xs text-slate-500">
                            {new Date(p.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-3 text-sm font-medium">{p.talent}</td>
                          <td className="px-6 py-3 text-xs">{(p.typePaiement || 'N/A').replace(/_/g, ' ')}</td>
                          <td className="px-6 py-3 text-sm">{p.operateur || '-'}</td>
                          <td className="px-6 py-3 text-sm font-bold">{formatFCFA(p.montant)}</td>
                          <td className="px-6 py-3">{statutBadge(p.statut)}</td>
                          <td className="px-6 py-3 text-xs text-slate-400 font-mono">{p.reference || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
