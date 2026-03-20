import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import prisma from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const experts = await prisma.yiraExpert.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        pays: true,
        role: true,
        tokensCount: true,
        createdAt: true,
        _count: { select: { beneficiaires: true } },
      },
    });

    return NextResponse.json({ experts });
  } catch (error) {
    console.error('[Admin/Experts] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await req.json();
    const { email, nom, prenom, pays, role, tokensCount } = body;

    if (!email || !nom) {
      return NextResponse.json({ error: 'Email et nom sont requis' }, { status: 400 });
    }

    // Create Supabase Auth user if service key is available
    let authUserId: string | null = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (supabaseServiceKey && supabaseUrl) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-12) + 'A1!',
        email_confirm: true,
      });

      if (authError) {
        console.error('[Admin/Experts] Erreur création auth:', authError);
        return NextResponse.json({ error: `Erreur création compte: ${authError.message}` }, { status: 400 });
      }
      authUserId = authUser.user.id;
    }

    const expert = await prisma.yiraExpert.create({
      data: {
        ...(authUserId ? { id: authUserId } : {}),
        email,
        nom,
        prenom: prenom || null,
        pays: pays || null,
        role: role || 'expert',
        tokensCount: tokensCount || 10,
      },
    });

    return NextResponse.json({ expert }, { status: 201 });
  } catch (error) {
    console.error('[Admin/Experts] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
