import { Users, ClipboardCheck, Briefcase, Phone, Shield, Award } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <Navigation />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">
          Insertion professionnelle des jeunes
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          YIRA accompagne les jeunes de C&ocirc;te d&apos;Ivoire vers l&apos;emploi gr&acirc;ce &agrave;
          l&apos;&eacute;valuation psychom&eacute;trique SigmundTest et un parcours personnalis&eacute; de formation et d&apos;insertion.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/inscription"
            className="bg-green-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors text-lg"
          >
            S&apos;inscrire maintenant
          </a>
          <a
            href="/test"
            className="bg-white text-green-700 border-2 border-green-700 px-8 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors text-lg"
          >
            Passer le test
          </a>
        </div>
      </section>

      {/* Parcours en 4 étapes */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">Votre parcours YIRA</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { num: '1', title: 'Inscription', desc: 'Créez votre profil en ligne ou via USSD et recevez votre code YIRA unique.' },
            { num: '2', title: 'Évaluation', desc: 'Passez les tests psychométriques SigmundTest adaptés à votre niveau.' },
            { num: '3', title: 'Formation', desc: 'Suivez un parcours CQP personnalisé avec nos formateurs certifiés.' },
            { num: '4', title: 'Emploi', desc: 'Accédez aux offres correspondant à votre profil grâce au matching intelligent.' },
          ].map((etape) => (
            <div key={etape.num} className="bg-white p-5 rounded-xl shadow-sm border text-center">
              <div className="bg-green-700 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                {etape.num}
              </div>
              <h4 className="font-bold text-lg mb-1">{etape.title}</h4>
              <p className="text-slate-600 text-sm">{etape.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-green-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Acc&egrave;s Multi-Canal</h3>
            <p className="text-slate-600 text-sm">
              Inscription et suivi via Web, USSD (*789#) et SMS depuis n&apos;importe quel t&eacute;l&eacute;phone.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="text-blue-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">&Eacute;valuation Sigmund</h3>
            <p className="text-slate-600 text-sm">
              Tests psychom&eacute;triques valid&eacute;s (Big Five, RIASEC, Soft Skills, Motivation).
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-orange-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Conseillers d&eacute;di&eacute;s</h3>
            <p className="text-slate-600 text-sm">
              Chaque b&eacute;n&eacute;ficiaire est accompagn&eacute; par un conseiller YIRA qualifi&eacute;.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-purple-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Matching Emploi</h3>
            <p className="text-slate-600 text-sm">
              Algorithme de matching profil-emploi avec 500+ entreprises partenaires.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-yellow-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Certification CQP</h3>
            <p className="text-slate-600 text-sm">
              Obtenez un Certificat de Qualification Professionnelle reconnu avec QR code v&eacute;rifiable.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-red-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Donn&eacute;es prot&eacute;g&eacute;es</h3>
            <p className="text-slate-600 text-sm">
              Vos donn&eacute;es personnelles sont prot&eacute;g&eacute;es conform&eacute;ment &agrave; la r&eacute;glementation RGPD.
            </p>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="bg-green-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-center mb-8">Objectifs du Programme YIRA</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold">25 000</p>
              <p className="text-green-200 text-sm mt-1">Talents par an</p>
            </div>
            <div>
              <p className="text-4xl font-bold">14</p>
              <p className="text-green-200 text-sm mt-1">Districts couverts</p>
            </div>
            <div>
              <p className="text-4xl font-bold">500+</p>
              <p className="text-green-200 text-sm mt-1">Entreprises partenaires</p>
            </div>
            <div>
              <p className="text-4xl font-bold">4</p>
              <p className="text-green-200 text-sm mt-1">Canaux d&apos;acc&egrave;s</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            &copy; 2026 YIRA Emploi &mdash; NOHAMA Consulting / SigmundTest CI &mdash; C&ocirc;te d&apos;Ivoire
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Programme d&apos;insertion professionnelle des jeunes &mdash; Financ&eacute; avec le soutien de la BAD, GIZ et AFD
          </p>
        </div>
      </footer>
    </div>
  );
}
