import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/db';

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user;
}

export async function getExpertProfile(userId: string) {
  try {
    const expert = await prisma.yiraExpert.findUnique({
      where: { id: userId },
    });
    return expert;
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return { user: null, profile: null, error: 'Non authentifié' };

  const profile = await getExpertProfile(user.id);
  if (!profile) return { user, profile: null, error: 'Profil expert non trouvé' };

  return { user, profile, error: null };
}

export async function requireAdmin(req: NextRequest) {
  const { user, profile, error } = await requireAuth(req);
  if (error) return { user, profile, error };
  if (profile?.role !== 'admin') return { user, profile, error: 'Accès réservé aux administrateurs' };
  return { user, profile, error: null };
}
