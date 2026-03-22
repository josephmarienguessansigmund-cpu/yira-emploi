import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'Protection des Donn\u00e9es Personnelles - YIRA Emploi',
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Navigation />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Protection des Donn&eacute;es Personnelles</h1>
        <p className="text-lg text-slate-600 mb-8">Conformit&eacute; ARTCI &mdash; Loi n&deg;2013-450 du 19 juin 2013</p>
        <p className="text-sm text-slate-500 mb-6">Derni&egrave;re mise &agrave; jour : 22 mars 2026</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Responsable du Traitement</h2>
            <p><strong>Nohama Consulting</strong>, soci&eacute;t&eacute; de droit ivoirien, est responsable du traitement des donn&eacute;es personnelles collect&eacute;es via la plateforme YIRA Emploi.</p>
            <p>Contact DPO (D&eacute;l&eacute;gu&eacute; &agrave; la Protection des Donn&eacute;es) : <strong>dpo@nohama.ci</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Base L&eacute;gale</h2>
            <p>Le traitement des donn&eacute;es est fond&eacute; sur :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Loi n&deg;2013-450</strong> du 19 juin 2013 relative &agrave; la protection des donn&eacute;es &agrave; caract&egrave;re personnel en C&ocirc;te d&apos;Ivoire</li>
              <li><strong>R&egrave;glement de l&apos;ARTCI</strong> (Autorit&eacute; de R&eacute;gulation des T&eacute;l&eacute;communications/TIC de C&ocirc;te d&apos;Ivoire)</li>
              <li>Le <strong>consentement explicite</strong> de l&apos;utilisateur lors de l&apos;inscription</li>
              <li>L&apos;<strong>int&eacute;r&ecirc;t l&eacute;gitime</strong> de l&apos;insertion professionnelle des jeunes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Donn&eacute;es Collect&eacute;es</h2>
            <p>La Plateforme collecte les cat&eacute;gories de donn&eacute;es suivantes :</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border px-4 py-2 text-left">Cat&eacute;gorie</th>
                    <th className="border px-4 py-2 text-left">Donn&eacute;es</th>
                    <th className="border px-4 py-2 text-left">Finalit&eacute;</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 font-medium">Identit&eacute;</td>
                    <td className="border px-4 py-2">Nom, pr&eacute;nom, date de naissance, genre</td>
                    <td className="border px-4 py-2">Cr&eacute;ation du profil YIRA</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-medium">Contact</td>
                    <td className="border px-4 py-2">T&eacute;l&eacute;phone, email</td>
                    <td className="border px-4 py-2">Communication, v&eacute;rification OTP</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-medium">Localisation</td>
                    <td className="border px-4 py-2">District, commune, quartier, zone g&eacute;o</td>
                    <td className="border px-4 py-2">Matching emploi g&eacute;ographique</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-medium">&Eacute;ducation</td>
                    <td className="border px-4 py-2">Niveau, sp&eacute;cialit&eacute;, situation actuelle</td>
                    <td className="border px-4 py-2">Orientation professionnelle</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-medium">Psychom&eacute;trique</td>
                    <td className="border px-4 py-2">R&eacute;sultats SigmundTest (Big Five, RIASEC, etc.)</td>
                    <td className="border px-4 py-2">&Eacute;valuation et recommandations</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-medium">Paiement</td>
                    <td className="border px-4 py-2">Montant, op&eacute;rateur, r&eacute;f&eacute;rence transaction</td>
                    <td className="border px-4 py-2">Facturation des services premium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Dur&eacute;e de Conservation</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Donn&eacute;es d&apos;identit&eacute; et de profil :</strong> 5 ans apr&egrave;s la derni&egrave;re activit&eacute; du compte</li>
              <li><strong>R&eacute;sultats d&apos;&eacute;valuation :</strong> 3 ans apr&egrave;s la date du test</li>
              <li><strong>Donn&eacute;es de paiement :</strong> 10 ans (obligation comptable)</li>
              <li><strong>Logs techniques :</strong> 12 mois glissants</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Droits des Utilisateurs</h2>
            <p>Conform&eacute;ment &agrave; la loi ivoirienne, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Droit d&apos;acc&egrave;s :</strong> obtenir une copie de vos donn&eacute;es personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger des informations inexactes</li>
              <li><strong>Droit de suppression :</strong> demander l&apos;effacement de vos donn&eacute;es</li>
              <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos donn&eacute;es</li>
              <li><strong>Droit &agrave; la portabilit&eacute; :</strong> r&eacute;cup&eacute;rer vos donn&eacute;es dans un format structur&eacute;</li>
            </ul>
            <p>Pour exercer ces droits, contactez : <strong>dpo@nohama.ci</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. S&eacute;curit&eacute; des Donn&eacute;es</h2>
            <p>Nohama Consulting met en &oelig;uvre les mesures techniques et organisationnelles suivantes :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Chiffrement des communications (HTTPS/TLS)</li>
              <li>Authentification s&eacute;curis&eacute;e (Supabase Auth)</li>
              <li>V&eacute;rification OTP par SMS pour l&apos;application mobile</li>
              <li>Contr&ocirc;le d&apos;acc&egrave;s bas&eacute; sur les r&ocirc;les (admin, expert, talent)</li>
              <li>Journalisation des acc&egrave;s et des actions sensibles</li>
              <li>H&eacute;bergement s&eacute;curis&eacute; (Netlify, Supabase)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Transfert de Donn&eacute;es</h2>
            <p>Les donn&eacute;es peuvent &ecirc;tre transf&eacute;r&eacute;es aux sous-traitants suivants, dans le cadre de la fourniture du service :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>SigmundTest (Suisse) :</strong> &eacute;valuations psychom&eacute;triques</li>
              <li><strong>Africa&apos;s Talking (Kenya) :</strong> envoi de SMS et USSD</li>
              <li><strong>Supabase (UE) :</strong> authentification et base de donn&eacute;es</li>
              <li><strong>Netlify (USA) :</strong> h&eacute;bergement de l&apos;application</li>
            </ul>
            <p>Ces transferts sont encadr&eacute;s par des clauses contractuelles garantissant un niveau de protection ad&eacute;quat.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Cookies et Trackers</h2>
            <p>La Plateforme utilise uniquement des cookies techniques n&eacute;cessaires au fonctionnement du service (authentification, session). Aucun cookie publicitaire ou de profilage n&apos;est utilis&eacute;.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. R&eacute;clamation aupr&egrave;s de l&apos;ARTCI</h2>
            <p>Si vous estimez que le traitement de vos donn&eacute;es ne respecte pas la r&eacute;glementation, vous pouvez introduire une r&eacute;clamation aupr&egrave;s de :</p>
            <div className="bg-slate-50 border rounded-lg p-4">
              <p className="font-bold">Autorit&eacute; de R&eacute;gulation des T&eacute;l&eacute;communications/TIC de C&ocirc;te d&apos;Ivoire (ARTCI)</p>
              <p>18, BP 2203 Abidjan 18</p>
              <p>T&eacute;l&eacute;phone : (+225) 20 34 43 73</p>
              <p>Site web : www.artci.ci</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Contact</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Nohama Consulting</strong> &mdash; D&eacute;l&eacute;gu&eacute; &agrave; la Protection des Donn&eacute;es</li>
              <li>Email : dpo@nohama.ci</li>
              <li>T&eacute;l&eacute;phone : +225 07 XX XX XX XX</li>
              <li>Adresse : Abidjan, C&ocirc;te d&apos;Ivoire</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t text-sm text-slate-400 text-center">
          <a href="/" className="text-green-700 hover:underline">Retour &agrave; l&apos;accueil</a>
          {' '}&mdash;{' '}
          <a href="/cgu" className="text-green-700 hover:underline">Conditions G&eacute;n&eacute;rales d&apos;Utilisation</a>
        </div>
      </main>
    </div>
  );
}
