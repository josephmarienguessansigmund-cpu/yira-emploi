'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Brain,
  Compass,
  Users,
  Target,
  Star,
  Loader2,
  CreditCard,
  CheckCircle,
  Zap,
} from 'lucide-react';
import Navigation from '@/components/Navigation';

type ModuleInfo = {
  id: string;
  label: string;
  description: string;
  price: number;
  currency: string;
};

const MODULE_ICONS: Record<string, React.ReactNode> = {
  FULL_EVAL: <ClipboardCheck size={24} />,
  BIG_FIVE: <Brain size={24} />,
  RIASEC: <Compass size={24} />,
  SOFT_SKILLS: <Users size={24} />,
  MOTIVATION: <Target size={24} />,
};

const MODULE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  FULL_EVAL: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  BIG_FIVE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  RIASEC: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  SOFT_SKILLS: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  MOTIVATION: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export default function TalentDashboard() {
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [telephone, setTelephone] = useState('');
  const [isAlpha, setIsAlpha] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    // Charger les prix dynamiques
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setModules(data.data.modules);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Récupérer le téléphone des params URL
    const params = new URLSearchParams(window.location.search);
    const tel = params.get('tel');
    if (tel) {
      setTelephone(tel);
      // Vérifier le statut Alpha
      fetch('/api/alpha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', telephone: tel }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.isAlpha) {
            setIsAlpha(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  async function handleSelectModule(moduleId: string) {
    setSelectedModule(moduleId);
    setPaymentStatus(null);

    if (!telephone) {
      setPaymentStatus('Veuillez entrer votre numéro de téléphone.');
      return;
    }

    setPaymentLoading(true);
    try {
      // Pour l'alpha, le paiement est bypassed automatiquement côté API
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone, typeProduit: 'QUIZ_PREMIUM' }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.data?.isAlpha) {
          setPaymentStatus(`Accès Alpha validé ! +${data.data.pointsCredites} points crédités.`);
        } else {
          setPaymentStatus(data.data?.message || 'Paiement initié.');
        }
      } else {
        setPaymentStatus(data.error || 'Erreur lors du paiement.');
      }
    } catch {
      setPaymentStatus('Erreur de connexion.');
    } finally {
      setPaymentLoading(false);
    }
  }

  function formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <Navigation />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Choisissez votre &eacute;valuation
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            S&eacute;lectionnez le module d&apos;&eacute;valuation Sigmund adapt&eacute; &agrave; vos besoins. Les prix sont affich&eacute;s en FCFA.
          </p>
        </div>

        {/* Alpha badge */}
        {isAlpha && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-center gap-2">
            <Star className="text-amber-500" size={18} />
            <span className="text-amber-700 font-medium text-sm">
              Mode Alpha Actif &mdash; Acc&egrave;s gratuit &agrave; tous les modules
            </span>
          </div>
        )}

        {/* Phone input */}
        <div className="bg-white rounded-xl border p-4 mb-6 max-w-sm mx-auto">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Votre num&eacute;ro de t&eacute;l&eacute;phone
          </label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="0707417187"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Module cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-green-700" size={32} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod) => {
              const colors = MODULE_COLORS[mod.id] || MODULE_COLORS.FULL_EVAL;
              const icon = MODULE_ICONS[mod.id] || <ClipboardCheck size={24} />;
              const isSelected = selectedModule === mod.id;

              return (
                <div
                  key={mod.id}
                  className={`bg-white rounded-xl border-2 p-5 transition-all cursor-pointer hover:shadow-md ${
                    isSelected ? `${colors.border} shadow-md` : 'border-transparent shadow-sm'
                  } ${mod.id === 'FULL_EVAL' ? 'md:col-span-2 lg:col-span-1 ring-2 ring-green-200' : ''}`}
                  onClick={() => handleSelectModule(mod.id)}
                >
                  {mod.id === 'FULL_EVAL' && (
                    <div className="flex items-center gap-1 text-green-600 text-xs font-bold mb-2">
                      <Zap size={12} />
                      RECOMMAND&Eacute;
                    </div>
                  )}

                  <div className={`${colors.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                    <span className={colors.text}>{icon}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-1">{mod.label}</h3>
                  <p className="text-sm text-slate-500 mb-4">{mod.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      {isAlpha ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm line-through text-slate-400">
                            {formatPrice(mod.price)}
                          </span>
                          <span className="font-bold text-green-600">GRATUIT</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(mod.price)}
                        </span>
                      )}
                    </div>
                    <button
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isAlpha
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-700 text-white hover:bg-green-800'
                      }`}
                    >
                      <CreditCard size={14} />
                      {isAlpha ? "Acc\u00e9der" : "Souscrire"}
                    </button>
                  </div>

                  {isSelected && paymentStatus && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-green-700">{paymentStatus}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {paymentLoading && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
              <Loader2 className="animate-spin text-green-700 mx-auto mb-4" size={36} />
              <p className="text-slate-700 font-medium">Traitement en cours...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
