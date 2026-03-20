import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getExpertProfile } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const profile = await getExpertProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        nom: profile.nom,
        prenom: profile.prenom,
        pays: profile.pays,
        role: profile.role,
        tokensCount: profile.tokensCount,
      },
    });
  } catch (error) {
    console.error('[Auth/Profile] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
