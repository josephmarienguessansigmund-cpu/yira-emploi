import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'Conditions G\u00e9n\u00e9rales d\u2019Utilisation - YIRA Emploi',
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Navigation />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Conditions G&eacute;n&eacute;rales d&apos;Utilisation (CGU)</h1>
        <p className="text-sm text-slate-500 mb-6">Derni&egrave;re mise &agrave; jour : 22 mars 2026</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">Article 1 &mdash; Objet</h2>
            <p>Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales d&apos;Utilisation (ci-apr&egrave;s &laquo; CGU &raquo;) r&eacute;gissent l&apos;utilisation de la plateforme YIRA Emploi (ci-apr&egrave;s &laquo; la Plateforme &raquo;), &eacute;dit&eacute;e par <strong>Nohama Consulting</strong>, soci&eacute;t&eacute; de droit ivoirien, op&eacute;rant en C&ocirc;te d&apos;Ivoire.</p>
            <p>La Plateforme a pour vocation de faciliter l&apos;insertion professionnelle des jeunes via un parcours int&eacute;grant l&apos;&eacute;valuation psychom&eacute;trique (SigmundTest), la formation (CQP) et le matching emploi.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Article 2 &mdash; Acc&egrave;s &agrave; la Plateforme</h2>
            <p>La Plateforme est accessible via les canaux suivants :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Site Web : <strong>yira-emploi.netlify.app</strong></li>
              <li>USSD : composition du <strong>*789#</strong></li>
              <li>SMS : notifications et r&eacute;sultats via <strong>Africa&apos;s Talking</strong></li>
              <li>Application Mobile (en cours de d&eacute;ploiement)</li>
            </ul>
            <p>L&apos;inscription est gratuite. Certains services premium (Quiz Premium, Rapport Sigmund complet) sont payants.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Article 3 &mdash; Inscription et Compte Utilisateur</h2>
            <p>L&apos;inscription requiert un num&eacute;ro de t&eacute;l&eacute;phone mobile valide en C&ocirc;te d&apos;Ivoire. L&apos;utilisateur s&apos;engage &agrave; fournir des informations exactes et compl&egrave;tes.</p>
            <p>Un code unique <strong>YIRA</strong> (format : YIR-AAAA-XXXXX) est attribu&eacute; &agrave; chaque inscrit. Ce code sert d&apos;identifiant sur tous les canaux.</p>
            <p>La v&eacute;rification du num&eacute;ro de t&eacute;l&eacute;phone par code OTP est obligatoire pour l&apos;activation du compte sur l&apos;application mobile.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Article 4 &mdash; Services Propos&eacute;s</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>&Eacute;valuation psychom&eacute;trique :</strong> Tests SigmundTest (Big Five, RIASEC, Soft Skills, Motivation)</li>
              <li><strong>Matching Emploi :</strong> Mise en relation profil-offres gr&acirc;ce au code Holland</li>
              <li><strong>Coaching IA :</strong> Accompagnement par intelligence artificielle pour l&apos;analyse des profils</li>
              <li><strong>Formation CQP :</strong> Parcours de certification professionnelle qualifiante</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Article 5 &mdash; Tarification et Paiement</h2>
            <p>Les tarifs des services premium sont les suivants :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Quiz Premium :</strong> 500 FCFA</li>
              <li><strong>Rapport Sigmund complet :</strong> 1 000 FCFA</li>
              <li><strong>Pack Complet (Quiz + Rapport) :</strong> 1 200 FCFA</li>
            </ul>
            <p>Les paiements s&apos;effectuent exclusivement par <strong>Mobile Money</strong> (Orange Money, MTN Mobile Money, Moov Money). Toute transaction est d&eacute;finitive et non remboursable, sauf en cas de d&eacute;faillance technique avérée de la Plateforme.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Article 6 &mdash; Propri&eacute;t&eacute; Intellectuelle</h2>
            <p>L&apos;ensemble du contenu de la Plateforme (textes, images, logos, tests, algorithmes) est la propri&eacute;t&eacute; de Nohama Consulting et/ou de ses partenaires (SigmundTest). Toute reproduction, distribution ou modification sans autorisation &eacute;crite est interdite.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Article 7 &mdash; Responsabilit&eacute;s</h2>
            <p>Nohama Consulting met en &oelig;uvre les moyens raisonnables pour assurer le bon fonctionnement de la Plateforme mais ne garantit pas une disponibilit&eacute; continue et sans interruption.</p>
            <p>L&apos;utilisateur est seul responsable de l&apos;utilisation de ses identifiants et de la confidentialit&eacute; de son code YIRA.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Article 8 &mdash; Loi Applicable et Juridiction</h2>
            <p>Les pr&eacute;sentes CGU sont r&eacute;gies par le droit ivoirien. En cas de litige, les parties s&apos;engagent &agrave; rechercher une solution amiable avant toute action judiciaire. &Agrave; d&eacute;faut, les tribunaux d&apos;Abidjan seront seuls comp&eacute;tents.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Article 9 &mdash; Contact</h2>
            <p>Pour toute question relative aux pr&eacute;sentes CGU :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Nohama Consulting</strong></li>
              <li>Email : contact@nohama.ci</li>
              <li>T&eacute;l&eacute;phone : +225 07 XX XX XX XX</li>
              <li>Adresse : Abidjan, C&ocirc;te d&apos;Ivoire</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t text-sm text-slate-400 text-center">
          <a href="/" className="text-green-700 hover:underline">Retour &agrave; l&apos;accueil</a>
          {' '}&mdash;{' '}
          <a href="/confidentialite" className="text-green-700 hover:underline">Protection des Donn&eacute;es</a>
        </div>
      </main>
    </div>
  );
}
