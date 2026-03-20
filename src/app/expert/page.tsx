export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { CheckCircle, Clock, User } from 'lucide-react';

export default async function ExpertDashboard() {
  let testsEnAttente: any[] = [];
  
  try {
    testsEnAttente = await prisma.testSigmund.findMany({
      where: { completedAt: { not: null }, estValideParExpert: false },
      include: { jeune: true },
      orderBy: { completedAt: 'desc' }
    });
  } catch (e) {
    console.error('DB non disponible:', e);
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Console d&apos;Expertise YIRA</h1>
          <p className="text-slate-600">Validez les analyses pour les candidats.</p>
        </header>
        <div className="grid gap-6">
          {testsEnAttente.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl shadow-sm border">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p>Aucun test en attente.</p>
            </div>
          ) : (
            testsEnAttente.map((test: any) => (
              <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{test.jeune.prenom} {test.jeune.nom}</h3>
                    <div className="flex gap-4 text-sm text-slate-500">
                      {test.jeune.codeYira && (
                        <span className="font-mono text-green-600">{test.jeune.codeYira}</span>
                      )}
                      <span>{test.jeune.niveau || ''}</span>
                      <span>{test.jeune.district || ''}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={14}/> {test.completedAt?.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <a href={`/expert/validation/${test.id}`} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium">
                  Expertiser
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}