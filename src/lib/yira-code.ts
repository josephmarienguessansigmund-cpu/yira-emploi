import prisma from '@/lib/db';

/**
 * Génère un code YIRA unique au format YIR-2026-XXXXX
 * où XXXXX est un nombre séquentiel à 5 chiffres.
 */
export async function genererCodeYira(): Promise<string> {
  const annee = new Date().getFullYear();
  const prefix = `YIR-${annee}-`;

  // Trouver le dernier code YIRA de l'année en cours
  const dernier = await prisma.jeune.findFirst({
    where: { codeYira: { startsWith: prefix } },
    orderBy: { codeYira: 'desc' },
    select: { codeYira: true },
  });

  let numero = 1;
  if (dernier?.codeYira) {
    const parts = dernier.codeYira.split('-');
    const dernierNumero = parseInt(parts[2], 10);
    if (!isNaN(dernierNumero)) {
      numero = dernierNumero + 1;
    }
  }

  return `${prefix}${numero.toString().padStart(5, '0')}`;
}
