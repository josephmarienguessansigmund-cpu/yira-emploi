'use client';

import { useState } from 'react';
import { Linkedin, MessageCircle, Copy, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';

const SITE_URL = 'https://yira-evaluationpro.netlify.app';

const LINKEDIN_MESSAGE = `Chers partenaires et acteurs du d\u00e9veloppement,

Je suis Joseph-Marie N\u2019Guessan, Directeur G\u00e9n\u00e9ral de Nohama Consulting et porteur du programme YIRA \u2014 plateforme d\u2019insertion professionnelle des jeunes en C\u00f4te d\u2019Ivoire, align\u00e9e sur le Plan National de D\u00e9veloppement (PND 2021-2025).

YIRA r\u00e9pond \u00e0 un d\u00e9fi majeur : chaque ann\u00e9e, plus de 200 000 jeunes Ivoiriens arrivent sur le march\u00e9 du travail sans orientation ad\u00e9quate. Gr\u00e2ce \u00e0 la m\u00e9thodologie Sigmund (Big Five, RIASEC, Soft Skills), nous offrons une \u00e9valuation psychom\u00e9trique scientifique qui identifie les talents, les oriente vers les m\u00e9tiers porteurs et les accompagne jusqu\u2019\u00e0 l\u2019emploi.

Notre plateforme est d\u00e9j\u00e0 op\u00e9rationnelle :
\u2022 \u00c9valuation accessible via Web, App Mobile et USSD (*789#) pour toucher les zones rurales
\u2022 Analyse IA int\u00e9gr\u00e9e pour des recommandations personnalis\u00e9es
\u2022 Certification CQP avec QR code v\u00e9rifiable
\u2022 Couverture des 14 districts de C\u00f4te d\u2019Ivoire

Objectif 2026 : 25 000 jeunes \u00e9valu\u00e9s et orient\u00e9s, en partenariat avec le secteur priv\u00e9 et les institutions publiques.

D\u00e9couvrez YIRA : ${SITE_URL}

#InsertionProfessionnelle #PNDCoteDIvoire #JeunesseAfricaine #Sigmund #YIRA #NahamaConsulting #EmploiCI #OrientationProfessionnelle`;

const WHATSAPP_MESSAGE = `\ud83d\ude80 *YIRA EMPLOI \u2014 Trouve ton m\u00e9tier id\u00e9al !*

Salut ! Tu cherches un emploi ou une formation adapt\u00e9e \u00e0 ton profil ? YIRA t\u2019aide gratuitement* avec un test scientifique Sigmund.

\u2705 *Comment \u00e7a marche ?*
1\ufe0f\u20e3 Compose *789# sur ton t\u00e9l\u00e9phone (tout op\u00e9rateur)
2\ufe0f\u20e3 Inscris-toi en 30 secondes
3\ufe0f\u20e3 Passe le test et d\u00e9couvre tes forces
4\ufe0f\u20e3 Re\u00e7ois ton profil et les offres qui te correspondent

\ud83d\udcf1 *T\u00e9l\u00e9charge l\u2019App pour aller plus loin :*
${SITE_URL}/app

\ud83c\udfaf *Ce que tu obtiens :*
\u2022 Ton profil psychom\u00e9trique complet (personnalit\u00e9, int\u00e9r\u00eats, comp\u00e9tences)
\u2022 Des recommandations de m\u00e9tiers personnalis\u00e9es
\u2022 L\u2019acc\u00e8s aux offres d\u2019emploi des 500+ entreprises partenaires
\u2022 Un coaching IA pour tes entretiens

\ud83d\udcb0 *BONUS* : Gagne des points \u00e0 chaque \u00e9tape et \u00e9change-les contre des services !

*Inscris-toi maintenant :* ${SITE_URL}/inscription
*Ou compose :* \u260e\ufe0f *789#

\u2014 \ud83c\udf31 Programme YIRA / Nohama Consulting \u2014 C\u00f4te d\u2019Ivoire`;

export default function CommunicationPage() {
  const [copiedLinkedin, setCopiedLinkedin] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Kit de Communication YIRA
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Mod&egrave;les de messages pr&ecirc;ts &agrave; l&apos;emploi pour le DG Joseph-Marie N&apos;Guessan.
            Copiez et adaptez selon le canal.
          </p>
        </div>

        <div className="space-y-8">
          {/* LinkedIn */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Linkedin size={24} />
                <div>
                  <h2 className="font-bold text-lg">LinkedIn</h2>
                  <p className="text-blue-100 text-sm">Expertise Sigmund &amp; PND C&ocirc;te d&apos;Ivoire</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(LINKEDIN_MESSAGE, setCopiedLinkedin)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {copiedLinkedin ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copiedLinkedin ? 'Copi\u00e9 !' : 'Copier'}
              </button>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                {LINKEDIN_MESSAGE}
              </pre>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <MessageCircle size={24} />
                <div>
                  <h2 className="font-bold text-lg">WhatsApp</h2>
                  <p className="text-green-100 text-sm">Message viral avec code *789# et lien App</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(WHATSAPP_MESSAGE, setCopiedWhatsapp)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {copiedWhatsapp ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copiedWhatsapp ? 'Copi\u00e9 !' : 'Copier'}
              </button>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                {WHATSAPP_MESSAGE}
              </pre>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-slate-900 mb-3">Liens utiles pour vos messages</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Site Web principal</p>
                <p className="font-mono text-green-700">{SITE_URL}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Page App Mobile</p>
                <p className="font-mono text-green-700">{SITE_URL}/app</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Inscription directe</p>
                <p className="font-mono text-green-700">{SITE_URL}/inscription</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Code USSD</p>
                <p className="font-mono text-green-700 text-lg font-bold">*789#</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
