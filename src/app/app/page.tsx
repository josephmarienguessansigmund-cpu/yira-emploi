'use client';

import { useEffect, useState } from 'react';
import { Smartphone, Download, ArrowRight, Loader2, CheckCircle, Star } from 'lucide-react';
import Navigation from '@/components/Navigation';

type TalentProfile = {
  authenticated: boolean;
  talentId: string;
  telephone: string;
  prenom?: string;
  nom?: string;
  codeYira?: string;
  soldePoints?: number;
  creditFcfa?: number;
  isAlpha?: boolean;
};

export default function AppRedirectPage() {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'unknown'>('unknown');
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      setPlatform('android');
    } else if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const tel = params.get('tel');

    // Vérifier le Magic Link token
    if (token) {
      setLoading(true);
      fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.authenticated) {
            setProfile(data.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tel) {
      // Deep link sans token — tenter d'ouvrir l'app
      const deepLink = `yira://profile?tel=${encodeURIComponent(tel)}`;
      const timeout = setTimeout(() => {}, 2000);
      window.location.href = deepLink;
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <Navigation />

      <main className="max-w-lg mx-auto px-6 py-12 text-center">
        {/* Profil authentifié via Magic Link */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
            <Loader2 className="animate-spin mx-auto text-green-700 mb-4" size={36} />
            <p className="text-slate-600">V&eacute;rification de votre lien...</p>
          </div>
        )}

        {profile && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-600" size={24} />
              <h3 className="font-bold text-lg text-slate-900">
                Bienvenue, {profile.prenom} {profile.nom}
              </h3>
            </div>
            {profile.isAlpha && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                <Star className="text-amber-500" size={16} />
                <span className="text-amber-700 text-sm font-medium">Testeur Alpha — Acc&egrave;s complet</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{profile.soldePoints ?? 0}</p>
                <p className="text-xs text-green-600">Points YIRA</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-700">{profile.creditFcfa ?? 0}</p>
                <p className="text-xs text-orange-600">Cr&eacute;dit FCFA</p>
              </div>
            </div>
            {profile.codeYira && (
              <p className="mt-3 text-sm text-slate-500">
                Code YIRA : <span className="font-mono font-bold text-slate-700">{profile.codeYira}</span>
              </p>
            )}
          </div>
        )}

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
              href="https://yira-evaluationpro.netlify.app/downloads/yira-emploi.apk"
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
