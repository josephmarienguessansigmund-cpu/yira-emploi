import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { messages, beneficiaireId } = await req.json();

    // 1. Récupération des données du Talent (anciennement Talent)
    let contextData = '';
    if (beneficiaireId) {
      const beneficiaire = await prisma.talent.findUnique({
        where: { id: beneficiaireId },
        include: { testsSigmund: true },
      });

      if (beneficiaire) {
        contextData = `L'utilisateur s'appelle ${beneficiaire.prenom} ${beneficiaire.nom}. `;
        if (beneficiaire.testsSigmund && beneficiaire.testsSigmund.length > 0) {
          contextData += `Ses résultats de tests psychométriques sont : ${JSON.stringify(beneficiaire.testsSigmund)}. `;
        }
      }
    }

    // 2. Préparation de la réponse (Exemple simplifié pour le chat)
    // Ici, vous pouvez ajouter votre logique d'appel à l'IA (OpenAI, Anthropic, etc.)
    
    return NextResponse.json({ 
      message: "Analyse du profil Talent effectuée avec succès.",
      context: contextData 
    });

  } catch (error) {
    console.error('Erreur dans l\'API Chat:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération de la réponse' }, { status: 500 });
  }
}