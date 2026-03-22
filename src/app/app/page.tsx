'use client';

import { useEffect, useState } from 'react';
import { Smartphone, Download, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function AppRedirectPage() {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'unknown'>('unknown');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      setPlatform('android');
    } else if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    }

    // Extract phone number from URL params for deep linking
    const params = new URLSearchParams(window.location.search);
    const tel = params.get('tel');
    const ref = params.get('ref');

    // Try to open the app via deep link scheme
    if (tel) {
      // Attempt deep link: yira://profile?tel=XXX
      const deepLink = `yira://profile?tel=${encodeURIComponent(tel)}&ref=${ref || 'web'}`;
      const timeout = setTimeout(() => {
        // If the app didn't open, the user stays on this page
      }, 2000);

      // Try to open the deep link
      window.location.href = deepLink;

      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <Navigation />

      <main className="max-w-lg mx-auto px-6 py-12 text-center">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Smartphone className="text-green-700" size={36} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application YIRA Emploi</h2>
          <p className="text-slate-600 mb-8">
            Acc&eacute;dez &agrave; votre profil, r&eacute;clamez vos lots et consultez votre analyse Sigmund compl&egrave;te depuis l&apos;application mobile.
          </p>

          <div className="space-y-4">
            {/* Android APK download */}
            <a
              href="https://yira-emploi.netlify.app/downloads/yira-emploi.apk"
              className="flex items-center justify-center gap-3 w-full bg-green-700 text-white px-6 py-4 rounded-xl font-medium hover:bg-green-800 transition-colors"
            >
              <Download size={20} />
              <div className="text-left">
                <p className="font-bold">T&eacute;l&eacute;charger pour Android</p>
                <p className="text-xs text-green-200">APK &mdash; Compatible Android 6.0+</p>
              </div>
            </a>

            {/* iOS / App Store */}
            <div
              className="flex items-center justify-center gap-3 w-full bg-slate-100 text-slate-500 px-6 py-4 rounded-xl font-medium cursor-not-allowed"
            >
              <Download size={20} />
              <div className="text-left">
                <p className="font-bold">App Store (iOS)</p>
                <p className="text-xs">Bient&ocirc;t disponible</p>
              </div>
            </div>
          </div>

          {/* Web alternative */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-slate-500 mb-3">Vous pouvez aussi utiliser la version Web</p>
            <a
              href="/test"
              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium text-sm"
            >
              Passer le test en ligne
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Deep linking info */}
        <div className="mt-6 bg-white rounded-xl border p-4 text-left">
          <h3 className="font-bold text-sm text-slate-700 mb-2">Comment &ccedil;a marche ?</h3>
          <ol className="text-xs text-slate-500 space-y-1 list-decimal pl-4">
            <li>T&eacute;l&eacute;chargez et installez l&apos;App YIRA</li>
            <li>Ouvrez le lien re&ccedil;u par SMS &mdash; il ouvrira directement votre profil dans l&apos;App</li>
            <li>R&eacute;clamez vos points et acc&eacute;dez &agrave; votre rapport Sigmund complet</li>
          </ol>
          {platform !== 'unknown' && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              Appareil d&eacute;tect&eacute; : {platform === 'android' ? 'Android' : 'iOS'}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
