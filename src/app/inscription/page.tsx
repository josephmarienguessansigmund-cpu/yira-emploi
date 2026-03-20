'use client';

import { useState } from 'react';
import { UserPlus, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import Navigation from '@/components/Navigation';

// --- Constantes ---

const NIVEAUX = [
  { value: 'Aucun', label: 'Aucun diplôme' },
  { value: 'Primaire', label: 'Primaire (CEPE)' },
  { value: 'BEPC/BEF', label: 'Collège (BEPC / BEF)' },
  { value: 'BAC', label: 'Lycée (BAC)' },
  { value: 'BTS/DUT', label: 'BTS / DUT' },
  { value: 'Licence+', label: 'Licence et plus' },
];

const DISTRICTS = [
  'Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'Korhogo',
  'San-Pédro', 'Man', 'Gagnoa', 'Abengourou', 'Divo',
  'Séguéla', 'Odienné', 'Bondoukou', 'Autre',
];

const COMMUNES_ABIDJAN = [
  'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi',
  'Marcory', 'Plateau', 'Port-Bouët', 'Treichville', 'Yopougon',
  'Anyama', 'Bingerville', 'Songon',
];

const ZONES_GEO = [
  { value: 'urbain', label: 'Urbain' },
  { value: 'periurbain', label: 'Péri-urbain' },
  { value: 'rural', label: 'Rural' },
];

const SITUATIONS = [
  { value: 'NEET', label: 'Sans emploi, ni en formation' },
  { value: 'EMPLOYE', label: 'Employé(e)' },
  { value: 'ETUDIANT', label: 'Étudiant(e) / En formation' },
  { value: 'AUTRE', label: 'Autre' },
];

const CANAUX = [
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'appel', label: 'Appel téléphonique' },
];

const BLOCS = ['Identité', 'Localisation', 'Profil éducatif', 'Souscription'];

type FormState = 'idle' | 'loading' | 'success' | 'error';

// --- Styles communs ---
const inputClass = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none";
const selectClass = inputClass + " bg-white";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function InscriptionPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    dateNaissance: '',
    genre: '',
    district: '',
    commune: '',
    quartier: '',
    zoneGeo: '',
    niveau: '',
    specialite: '',
    situationActuelle: '',
    canalPrefere: 'sms',
    consentementRGPD: false,
  });
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [codeYira, setCodeYira] = useState('');
  const [copied, setCopied] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: // Identité
        return !!(form.prenom && form.nom && form.telephone && form.dateNaissance && form.genre);
      case 1: // Localisation
        return !!(form.district && form.zoneGeo);
      case 2: // Profil éducatif
        return !!(form.niveau && form.situationActuelle);
      case 3: // Souscription
        return form.consentementRGPD;
      default:
        return false;
    }
  }

  function nextStep() {
    if (canAdvance() && step < 3) setStep(step + 1);
  }

  function prevStep() {
    if (step > 0) setStep(step - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdvance()) return;
    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setCodeYira(data.data.codeYira || '');
      setState('success');
    } catch (err: unknown) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inattendue');
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(codeYira);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // --- Écran de succès ---
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Inscription réussie !</h2>
          <p className="text-slate-600 mb-4">
            Bienvenue dans le programme YIRA. Voici votre code unique :
          </p>
          {codeYira && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 mb-1">Votre Code YIRA</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-bold text-green-800">{codeYira}</span>
                <button onClick={copyCode} className="text-green-600 hover:text-green-800 p-1" title="Copier">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Conservez ce code, il sera votre identifiant sur tous les canaux (SMS, USSD, Web).
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <a
              href="/test"
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors"
            >
              Passer le test d&apos;évaluation
            </a>
            <a href="/" className="text-slate-500 hover:text-slate-700 text-sm">
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- Formulaire multi-étapes ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <Navigation />

      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {/* Titre */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <UserPlus className="text-green-700" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Inscription</h2>
              <p className="text-slate-500 text-sm">Étape {step + 1} sur 4 — {BLOCS[step]}</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex gap-1 mb-2">
              {BLOCS.map((bloc, i) => (
                <div key={bloc} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      i < step ? 'bg-green-500' : i === step ? 'bg-green-400' : 'bg-slate-200'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              {BLOCS.map((bloc, i) => (
                <span key={bloc} className={i <= step ? 'text-green-600 font-medium' : ''}>
                  {bloc}
                </span>
              ))}
            </div>
          </div>

          {/* Erreur */}
          {state === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* BLOC 1 — Identité */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prenom" className={labelClass}>Prénom *</label>
                    <input type="text" id="prenom" name="prenom" required value={form.prenom} onChange={handleChange} className={inputClass} placeholder="Ex: Awa" />
                  </div>
                  <div>
                    <label htmlFor="nom" className={labelClass}>Nom *</label>
                    <input type="text" id="nom" name="nom" required value={form.nom} onChange={handleChange} className={inputClass} placeholder="Ex: Koné" />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateNaissance" className={labelClass}>Date de naissance *</label>
                  <input type="date" id="dateNaissance" name="dateNaissance" required value={form.dateNaissance} onChange={handleChange} className={inputClass} max="2010-12-31" min="1970-01-01" />
                </div>

                <div>
                  <label className={labelClass}>Genre *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="genre" value="M" checked={form.genre === 'M'} onChange={handleChange} className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">Masculin</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="genre" value="F" checked={form.genre === 'F'} onChange={handleChange} className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">Féminin</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="telephone" className={labelClass}>Téléphone *</label>
                  <input type="tel" id="telephone" name="telephone" required value={form.telephone} onChange={handleChange} className={inputClass} placeholder="Ex: 0701020304" />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>Email <span className="text-slate-400">(optionnel)</span></label>
                  <input type="email" id="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="Ex: awa@email.com" />
                </div>
              </div>
            )}

            {/* BLOC 2 — Localisation */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="district" className={labelClass}>District / Région *</label>
                  <select id="district" name="district" required value={form.district} onChange={handleChange} className={selectClass}>
                    <option value="">Sélectionnez...</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {form.district === 'Abidjan' && (
                  <div>
                    <label htmlFor="commune" className={labelClass}>Commune</label>
                    <select id="commune" name="commune" value={form.commune} onChange={handleChange} className={selectClass}>
                      <option value="">Sélectionnez...</option>
                      {COMMUNES_ABIDJAN.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="quartier" className={labelClass}>Quartier <span className="text-slate-400">(optionnel)</span></label>
                  <input type="text" id="quartier" name="quartier" value={form.quartier} onChange={handleChange} className={inputClass} placeholder="Ex: Riviera 2" />
                </div>

                <div>
                  <label htmlFor="zoneGeo" className={labelClass}>Zone géographique *</label>
                  <select id="zoneGeo" name="zoneGeo" required value={form.zoneGeo} onChange={handleChange} className={selectClass}>
                    <option value="">Sélectionnez...</option>
                    {ZONES_GEO.map((z) => (
                      <option key={z.value} value={z.value}>{z.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* BLOC 3 — Profil éducatif */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="niveau" className={labelClass}>Niveau d&apos;études *</label>
                  <select id="niveau" name="niveau" required value={form.niveau} onChange={handleChange} className={selectClass}>
                    <option value="">Sélectionnez...</option>
                    {NIVEAUX.map((n) => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="specialite" className={labelClass}>Spécialité / Domaine <span className="text-slate-400">(optionnel)</span></label>
                  <input type="text" id="specialite" name="specialite" value={form.specialite} onChange={handleChange} className={inputClass} placeholder="Ex: Commerce, Informatique, Agriculture..." />
                </div>

                <div>
                  <label htmlFor="situationActuelle" className={labelClass}>Situation actuelle *</label>
                  <select id="situationActuelle" name="situationActuelle" required value={form.situationActuelle} onChange={handleChange} className={selectClass}>
                    <option value="">Sélectionnez...</option>
                    {SITUATIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* BLOC 4 — Souscription */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="canalPrefere" className={labelClass}>Canal de contact préféré</label>
                  <select id="canalPrefere" name="canalPrefere" value={form.canalPrefere} onChange={handleChange} className={selectClass}>
                    {CANAUX.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Récapitulatif */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3 text-sm">Récapitulatif</h3>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Nom complet</dt>
                      <dd className="text-slate-800 font-medium">{form.prenom} {form.nom}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Téléphone</dt>
                      <dd className="text-slate-800">{form.telephone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Date de naissance</dt>
                      <dd className="text-slate-800">{form.dateNaissance}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Genre</dt>
                      <dd className="text-slate-800">{form.genre === 'M' ? 'Masculin' : 'Féminin'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Localisation</dt>
                      <dd className="text-slate-800">{form.commune ? `${form.commune}, ` : ''}{form.district}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Niveau</dt>
                      <dd className="text-slate-800">{form.niveau}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Situation</dt>
                      <dd className="text-slate-800">{SITUATIONS.find(s => s.value === form.situationActuelle)?.label}</dd>
                    </div>
                  </dl>
                </div>

                {/* Consentement RGPD */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentementRGPD"
                      checked={form.consentementRGPD}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 text-green-600 rounded"
                    />
                    <span className="text-sm text-slate-700">
                      J&apos;accepte que mes données personnelles soient traitées par le programme YIRA dans le cadre de mon accompagnement vers l&apos;insertion professionnelle, conformément à la réglementation en vigueur sur la protection des données personnelles. *
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Précédent
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canAdvance()}
                  className="flex items-center gap-2 bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={state === 'loading' || !canAdvance()}
                  className="flex items-center gap-2 bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state === 'loading' ? "Inscription en cours..." : "Valider l'inscription"}
                  {state !== 'loading' && <CheckCircle size={16} />}
                </button>
              )}
            </div>
          </form>

          <p className="text-xs text-slate-400 mt-6 text-center">
            Vous avez déjà un compte ?{' '}
            <a href="/test" className="text-green-700 hover:underline">Passer le test</a>
          </p>
        </div>
      </main>
    </div>
  );
}
