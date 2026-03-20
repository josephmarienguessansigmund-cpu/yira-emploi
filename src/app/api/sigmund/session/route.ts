import { NextRequest, NextResponse } from 'next/server';
import { creerSessionEvaluation } from '@/lib/sigmund';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { candidatId, telephone, prenom, nom, email, typeEvaluation } = body;

    if (!candidatId || !telephone || !prenom || !nom) {
      return NextResponse.json(
        { error: 'candidatId, telephone, prenom et nom sont requis' },
        { status: 400 }
      );
    }

    const result = await creerSessionEvaluation({
      candidatId,
      telephone,
      prenom,
      nom,
      email,
      typeEvaluation: typeEvaluation ?? 'COMPLET',
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Sigmund Session] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session Sigmund' },
      { status: 500 }
    );
  }
}
