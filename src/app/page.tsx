import { Users, ClipboardCheck, Briefcase, Phone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-700">YIRA Emploi</h1>
            <p className="text-sm text-slate-500">Plateforme d&apos;insertion professionnelle</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/inscription"
              className="bg-green-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-800 transition-colors"
            >
              S&apos;inscrire
            </a>
            <a
              href="/expert"
              className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Espace Expert
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">
          Insertion professionnelle des jeunes
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          YIRA accompagne les jeunes de C&ocirc;te d&apos;Ivoire vers l&apos;emploi gr&acirc;ce &agrave;
          l&apos;&eacute;valuation psychom&eacute;trique Sigmund et un acc&egrave;s simplifi&eacute; via USSD.
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

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-green-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Acc&egrave;s USSD</h3>
            <p className="text-slate-600 text-sm">
              Inscription et &eacute;valuation accessibles depuis n&apos;importe quel t&eacute;l&eacute;phone mobile.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="text-blue-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">&Eacute;valuation Sigmund</h3>
            <p className="text-slate-600 text-sm">
              Tests psychom&eacute;triques valid&eacute;s (Big Five, RIASEC, Soft Skills).
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-orange-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Expertise humaine</h3>
            <p className="text-slate-600 text-sm">
              Chaque r&eacute;sultat est analys&eacute; et valid&eacute; par un expert qualifi&eacute;.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-purple-700" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Orientation emploi</h3>
            <p className="text-slate-600 text-sm">
              Recommandations personnalis&eacute;es pour l&apos;insertion professionnelle.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-sm text-slate-500">
        <p>&copy; 2026 YIRA Emploi &mdash; NOHAMA Consulting &mdash; C&ocirc;te d&apos;Ivoire</p>
      </footer>
    </div>
  );
}
