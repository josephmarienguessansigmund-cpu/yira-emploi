'use client';

import { useState } from 'react';
import {
  ClipboardCheck,
  UserPlus,
  Phone,
  CreditCard,
  Search,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import Navigation from '@/components/Navigation';

type TestResult = {
  id: string;
  module: string;
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  statusCode?: number;
  response?: unknown;
  duration?: number;
  timestamp: string;
};

type ModuleConfig = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tests: TestConfig[];
};

type TestConfig = {
  id: string;
  name: string;
  description: string;
  method: string;
  endpoint: string;
  defaultBody?: Record<string, unknown>;
  fields?: FieldConfig[];
};

type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | boolean;
};

const modules: ModuleConfig[] = [
  {
    id: 'inscription',
    name: 'Module Inscription',
    description: 'Inscription des jeunes (formulaire 4 blocs)',
    icon: <UserPlus size={20} />,
    color: 'bg-blue-500',
    tests: [
      {
        id: 'inscription-complete',
        name: 'Inscription complète',
        description: 'Teste l\'inscription avec tous les champs',
        method: 'POST',
        endpoint: '/api/inscription',
        fields: [
          { name: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'Amadou', defaultValue: 'Test' },
          { name: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Koné', defaultValue: 'Utilisateur' },
          { name: 'telephone', label: 'Téléphone', type: 'text', required: true, placeholder: '0701020304', defaultValue: `07${Math.floor(10000000 + Math.random() * 90000000)}` },
          { name: 'email', label: 'Email', type: 'text', placeholder: 'amadou@test.com' },
          { name: 'dateNaissance', label: 'Date de naissance', type: 'date', required: true, defaultValue: '2000-01-15' },
          { name: 'genre', label: 'Genre', type: 'select', required: true, options: [{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }], defaultValue: 'M' },
          {
            name: 'niveau', label: 'Niveau d\'études', type: 'select', required: true,
            options: [
              { value: 'aucun', label: 'Aucun' },
              { value: 'primaire', label: 'Primaire' },
              { value: 'college', label: 'Collège' },
              { value: 'lycee', label: 'Lycée' },
              { value: 'bts_dut', label: 'BTS/DUT' },
              { value: 'licence_plus', label: 'Licence+' },
            ],
            defaultValue: 'lycee',
          },
          { name: 'specialite', label: 'Spécialité', type: 'text', placeholder: 'Informatique' },
          {
            name: 'situationActuelle', label: 'Situation actuelle', type: 'select',
            options: [
              { value: 'NEET', label: 'NEET (sans emploi/formation)' },
              { value: 'EMPLOYE', label: 'Employé' },
              { value: 'ETUDIANT', label: 'Étudiant' },
              { value: 'AUTRE', label: 'Autre' },
            ],
            defaultValue: 'NEET',
          },
          { name: 'district', label: 'District', type: 'text', required: true, placeholder: 'Abidjan', defaultValue: 'Abidjan' },
          { name: 'commune', label: 'Commune', type: 'text', placeholder: 'Cocody' },
          { name: 'quartier', label: 'Quartier', type: 'text', placeholder: 'Riviera' },
          {
            name: 'zoneGeo', label: 'Zone géographique', type: 'select',
            options: [
              { value: 'urbain', label: 'Urbain' },
              { value: 'periurbain', label: 'Péri-urbain' },
              { value: 'rural', label: 'Rural' },
            ],
            defaultValue: 'urbain',
          },
          {
            name: 'canalPrefere', label: 'Canal préféré', type: 'select',
            options: [
              { value: 'sms', label: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'appel', label: 'Appel' },
            ],
            defaultValue: 'sms',
          },
          { name: 'consentementRGPD', label: 'Consentement RGPD', type: 'checkbox', required: true, defaultValue: true },
        ],
      },
      {
        id: 'inscription-minimal',
        name: 'Inscription minimale (doit échouer)',
        description: 'Teste la validation — envoie des champs incomplets',
        method: 'POST',
        endpoint: '/api/inscription',
        defaultBody: { prenom: 'Test' },
      },
    ],
  },
  {
    id: 'candidat',
    name: 'Module Candidat',
    description: 'Recherche de profil par téléphone',
    icon: <Search size={20} />,
    color: 'bg-green-500',
    tests: [
      {
        id: 'candidat-search',
        name: 'Rechercher un candidat',
        description: 'Recherche par numéro de téléphone',
        method: 'GET',
        endpoint: '/api/candidat',
        fields: [
          { name: 'telephone', label: 'Téléphone', type: 'text', required: true, placeholder: '0701020304' },
        ],
      },
      {
        id: 'candidat-notfound',
        name: 'Candidat inexistant',
        description: 'Recherche un numéro qui n\'existe pas (doit retourner 404)',
        method: 'GET',
        endpoint: '/api/candidat',
        defaultBody: { telephone: '0799999999' },
      },
      {
        id: 'candidat-notel',
        name: 'Sans téléphone (doit échouer)',
        description: 'Recherche sans fournir de téléphone (doit retourner 400)',
        method: 'GET',
        endpoint: '/api/candidat',
        defaultBody: {},
      },
    ],
  },
  {
    id: 'sigmund',
    name: 'Module Évaluation Sigmund',
    description: 'Création de sessions et webhook',
    icon: <ClipboardCheck size={20} />,
    color: 'bg-purple-500',
    tests: [
      {
        id: 'sigmund-session',
        name: 'Créer une session Sigmund',
        description: 'Crée une session d\'évaluation psychométrique',
        method: 'POST',
        endpoint: '/api/sigmund/session',
        fields: [
          { name: 'candidatId', label: 'ID Candidat', type: 'text', required: true, placeholder: 'clx...', defaultValue: 'test-candidat-1' },
          { name: 'telephone', label: 'Téléphone', type: 'text', required: true, placeholder: '+2250701020304', defaultValue: '+2250701020304' },
          { name: 'prenom', label: 'Prénom', type: 'text', required: true, defaultValue: 'Test' },
          { name: 'nom', label: 'Nom', type: 'text', required: true, defaultValue: 'Sigmund' },
          { name: 'email', label: 'Email', type: 'text', placeholder: 'test@test.com' },
          {
            name: 'typeEvaluation', label: 'Type d\'évaluation', type: 'select', required: true,
            options: [
              { value: 'COMPLET', label: 'Complet (tous les tests)' },
              { value: 'BIG_FIVE', label: 'Big Five (personnalité)' },
              { value: 'RIASEC', label: 'RIASEC (intérêts)' },
              { value: 'SOFT_SKILLS', label: 'Soft Skills' },
              { value: 'MOTIVATION', label: 'Motivation' },
            ],
            defaultValue: 'COMPLET',
          },
        ],
      },
      {
        id: 'sigmund-webhook',
        name: 'Simuler webhook Sigmund',
        description: 'Simule la réception des résultats d\'un test',
        method: 'POST',
        endpoint: '/api/sigmund/webhook',
        fields: [
          { name: 'session_id', label: 'Session ID', type: 'text', required: true, placeholder: 'sig-xxx', defaultValue: 'test-session-1' },
          {
            name: 'status', label: 'Statut', type: 'select', required: true,
            options: [
              { value: 'completed', label: 'Complété' },
              { value: 'in_progress', label: 'En cours' },
              { value: 'expired', label: 'Expiré' },
            ],
            defaultValue: 'completed',
          },
        ],
      },
    ],
  },
  {
    id: 'ussd',
    name: 'Module USSD',
    description: 'Menu USSD *789# (Africa\'s Talking)',
    icon: <Phone size={20} />,
    color: 'bg-orange-500',
    tests: [
      {
        id: 'ussd-welcome',
        name: 'Menu d\'accueil',
        description: 'Affiche le menu principal USSD',
        method: 'POST',
        endpoint: '/api/ussd',
        defaultBody: {
          sessionId: `ussd-test-${Date.now()}`,
          phoneNumber: '+2250701020304',
          text: '',
        },
      },
      {
        id: 'ussd-inscription',
        name: 'Choix inscription',
        description: 'Teste le choix 1 (inscription)',
        method: 'POST',
        endpoint: '/api/ussd',
        fields: [
          { name: 'sessionId', label: 'Session ID', type: 'text', required: true, defaultValue: `ussd-${Date.now()}` },
          { name: 'phoneNumber', label: 'Téléphone', type: 'text', required: true, defaultValue: '+2250701020304' },
          { name: 'text', label: 'Input USSD', type: 'text', required: true, placeholder: '1*Amadou*Koné*3*3*1', defaultValue: '1' },
        ],
      },
      {
        id: 'ussd-offres',
        name: 'Voir les offres',
        description: 'Teste le choix 2 (offres d\'emploi)',
        method: 'POST',
        endpoint: '/api/ussd',
        defaultBody: {
          sessionId: `ussd-offres-${Date.now()}`,
          phoneNumber: '+2250701020304',
          text: '2',
        },
      },
      {
        id: 'ussd-resultats',
        name: 'Mes résultats',
        description: 'Teste le choix 3 (résultats Sigmund)',
        method: 'POST',
        endpoint: '/api/ussd',
        defaultBody: {
          sessionId: `ussd-results-${Date.now()}`,
          phoneNumber: '+2250701020304',
          text: '3',
        },
      },
      {
        id: 'ussd-quitter',
        name: 'Quitter',
        description: 'Teste le choix 0 (fin de session)',
        method: 'POST',
        endpoint: '/api/ussd',
        defaultBody: {
          sessionId: `ussd-quit-${Date.now()}`,
          phoneNumber: '+2250701020304',
          text: '0',
        },
      },
    ],
  },
  {
    id: 'payment',
    name: 'Module Paiement',
    description: 'Webhook Mobile Money (Africa\'s Talking)',
    icon: <CreditCard size={20} />,
    color: 'bg-yellow-500',
    tests: [
      {
        id: 'payment-webhook-success',
        name: 'Paiement réussi',
        description: 'Simule un webhook de paiement réussi',
        method: 'POST',
        endpoint: '/api/payment',
        fields: [
          { name: 'phoneNumber', label: 'Téléphone', type: 'text', required: true, defaultValue: '+2250701020304' },
          { name: 'status', label: 'Statut', type: 'select', required: true, options: [{ value: 'Success', label: 'Succès' }, { value: 'Failed', label: 'Échec' }], defaultValue: 'Success' },
          { name: 'value', label: 'Montant', type: 'text', defaultValue: 'KES 500' },
        ],
      },
    ],
  },
];

export default function TestDashboard() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>('inscription');
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, Record<string, unknown>>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  function getFormValues(testId: string, test: TestConfig): Record<string, unknown> {
    const stored = formData[testId] || {};
    if (test.fields) {
      const defaults: Record<string, unknown> = {};
      for (const field of test.fields) {
        if (field.defaultValue !== undefined && stored[field.name] === undefined) {
          defaults[field.name] = field.defaultValue;
        }
      }
      return { ...defaults, ...stored };
    }
    return test.defaultBody || {};
  }

  function updateField(testId: string, fieldName: string, value: unknown) {
    setFormData(prev => ({
      ...prev,
      [testId]: { ...(prev[testId] || {}), [fieldName]: value },
    }));
  }

  async function runTest(module: ModuleConfig, test: TestConfig) {
    const testId = test.id;
    setLoading(prev => ({ ...prev, [testId]: true }));

    const start = performance.now();
    const body = getFormValues(testId, test);

    try {
      let response: Response;
      let url = test.endpoint;

      if (test.method === 'GET') {
        const params = new URLSearchParams();
        Object.entries(body).forEach(([k, v]) => {
          if (v !== undefined && v !== '') params.set(k, String(v));
        });
        const qs = params.toString();
        if (qs) url += `?${qs}`;
        response = await fetch(url);
      } else {
        response = await fetch(url, {
          method: test.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const duration = Math.round(performance.now() - start);
      const contentType = response.headers.get('content-type') || '';
      let responseData: unknown;

      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const result: TestResult = {
        id: `${testId}-${Date.now()}`,
        module: module.name,
        endpoint: `${test.method} ${test.endpoint}`,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        response: responseData,
        duration,
        timestamp: new Date().toLocaleTimeString('fr-FR'),
      };

      setResults(prev => [result, ...prev]);
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setResults(prev => [{
        id: `${testId}-${Date.now()}`,
        module: module.name,
        endpoint: `${test.method} ${test.endpoint}`,
        status: 'error',
        response: { error: err instanceof Error ? err.message : 'Erreur réseau' },
        duration,
        timestamp: new Date().toLocaleTimeString('fr-FR'),
      }, ...prev]);
    } finally {
      setLoading(prev => ({ ...prev, [testId]: false }));
    }
  }

  async function runAllModuleTests(module: ModuleConfig) {
    for (const test of module.tests) {
      await runTest(module, test);
    }
  }

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Sub-header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                YIRA — Tableau de Bord Tests
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Testez chaque module de la plateforme interactivement
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} /> {successCount}
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle size={16} /> {errorCount}
                </span>
              </div>
              {results.length > 0 && (
                <button
                  onClick={() => setResults([])}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Trash2 size={14} /> Effacer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau gauche : Modules & Tests */}
          <div className="lg:col-span-2 space-y-4">
            {modules.map(module => (
              <div key={module.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${module.color} text-white p-2 rounded-lg`}>
                      {module.icon}
                    </div>
                    <div className="text-left">
                      <h2 className="font-semibold text-gray-900">{module.name}</h2>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); runAllModuleTests(module); }}
                      className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100"
                    >
                      Tout tester
                    </button>
                    {expandedModule === module.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </button>

                {/* Tests */}
                {expandedModule === module.id && (
                  <div className="border-t divide-y">
                    {module.tests.map(test => (
                      <div key={test.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs font-mono rounded ${test.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {test.method}
                              </span>
                              <span className="font-medium text-sm text-gray-900">{test.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{test.description}</p>
                          </div>
                          <button
                            onClick={() => runTest(module, test)}
                            disabled={loading[test.id]}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {loading[test.id] ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                            Exécuter
                          </button>
                        </div>

                        {/* Formulaire de test */}
                        {test.fields && (
                          <div className="mt-3">
                            <button
                              onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 mb-2 flex items-center gap-1"
                            >
                              {expandedTest === test.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              {expandedTest === test.id ? 'Masquer' : 'Configurer'} les paramètres
                            </button>

                            {expandedTest === test.id && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                                {test.fields.map(field => (
                                  <div key={field.name} className={field.type === 'checkbox' ? 'flex items-center gap-2' : ''}>
                                    {field.type === 'checkbox' ? (
                                      <>
                                        <input
                                          type="checkbox"
                                          id={`${test.id}-${field.name}`}
                                          checked={Boolean(getFormValues(test.id, test)[field.name])}
                                          onChange={e => updateField(test.id, field.name, e.target.checked)}
                                          className="rounded border-gray-300"
                                        />
                                        <label htmlFor={`${test.id}-${field.name}`} className="text-sm text-gray-700">
                                          {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                      </>
                                    ) : (
                                      <>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {field.type === 'select' ? (
                                          <select
                                            value={String(getFormValues(test.id, test)[field.name] || '')}
                                            onChange={e => updateField(test.id, field.name, e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border rounded-md bg-white"
                                          >
                                            <option value="">-- Choisir --</option>
                                            {field.options?.map(opt => (
                                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                          </select>
                                        ) : (
                                          <input
                                            type={field.type}
                                            value={String(getFormValues(test.id, test)[field.name] || '')}
                                            onChange={e => updateField(test.id, field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full px-2 py-1.5 text-sm border rounded-md"
                                          />
                                        )}
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Aperçu du body par défaut */}
                        {test.defaultBody && !test.fields && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600 overflow-x-auto">
                            {JSON.stringify(test.defaultBody, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Panneau droit : Résultats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-6">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">Résultats des tests</h2>
                <p className="text-xs text-gray-500 mt-0.5">{results.length} test(s) exécuté(s)</p>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto divide-y">
                {results.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <ClipboardCheck size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Aucun test exécuté</p>
                    <p className="text-xs mt-1">Cliquez sur &quot;Exécuter&quot; pour lancer un test</p>
                  </div>
                ) : (
                  results.map(result => (
                    <div key={result.id} className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {result.status === 'success' ? (
                            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-red-500 flex-shrink-0" />
                          )}
                          <span className="text-xs font-medium text-gray-900 truncate max-w-[180px]">
                            {result.module}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {result.statusCode && (
                            <span className={`font-mono ${result.statusCode < 400 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.statusCode}
                            </span>
                          )}
                          {result.duration && <span>{result.duration}ms</span>}
                        </div>
                      </div>
                      <p className="text-xs font-mono text-gray-500 mb-1">{result.endpoint}</p>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-32 text-gray-700">
                        {typeof result.response === 'string'
                          ? result.response
                          : JSON.stringify(result.response, null, 2)}
                      </pre>
                      <p className="text-[10px] text-gray-400 mt-1">{result.timestamp}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
