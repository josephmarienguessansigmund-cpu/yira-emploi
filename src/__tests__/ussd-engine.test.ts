/**
 * Tests unitaires — USSD Engine
 * Teste la machine à états du menu USSD sans accès DB
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockFindUnique = vi.fn();
const mockUpsert = vi.fn();

vi.mock('@/lib/db', () => ({
  default: {
    jeune: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}));

import { handleUSSD } from '@/lib/ussd-engine';
import type { USSDSession } from '@/types';

function makeSession(overrides: Partial<USSDSession> = {}): USSDSession {
  return {
    sessionId: 'test-session-1',
    serviceCode: '*789#',
    phoneNumber: '+2250701020304',
    text: '',
    ...overrides,
  };
}

describe('USSD Engine — handleUSSD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Menu Bienvenue (niveau 0)', () => {
    it('affiche le menu principal quand text est vide', async () => {
      const result = await handleUSSD(makeSession({ text: '' }));
      expect(result.continueSession).toBe(true);
      expect(result.response).toContain('Bienvenue sur YIRA Emploi');
      expect(result.response).toContain("1. M'inscrire");
      expect(result.response).toContain('2. Voir les offres');
      expect(result.response).toContain('3. Mes résultats SIGMUND');
      expect(result.response).toContain('0. Quitter');
    });
  });

  describe('Navigation niveau 1', () => {
    it('choix 1 → menu inscription (demande prénom)', async () => {
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '1' }));
      expect(result.continueSession).toBe(true);
      expect(result.response).toContain('INSCRIPTION YIRA Emploi');
      expect(result.response).toContain('prénom');
    });

    it('choix 2 → offres d\'emploi (aucune offre)', async () => {
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '2' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('Aucune offre');
    });

    it('choix 3 → résultats SIGMUND (pas de profil)', async () => {
      mockFindUnique.mockResolvedValueOnce(null);
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '3' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('Aucun profil trouvé');
    });

    it('choix 3 → résultats SIGMUND (test complété)', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'jeune-1',
        telephone: '+2250701020304',
        testsSigmund: [{
          completedAt: new Date(),
          rapport: JSON.stringify({
            profile_summary: 'Profil Entrepreneur',
            riasec: { holland_code: 'ESA' },
          }),
        }],
      });
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '3' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('VOS RÉSULTATS SIGMUND');
      expect(result.response).toContain('Profil Entrepreneur');
      expect(result.response).toContain('ESA');
    });

    it('choix 3 → résultats SIGMUND (test en cours)', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'jeune-1',
        telephone: '+2250701020304',
        testsSigmund: [{
          completedAt: null,
          rapport: null,
        }],
      });
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '3' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('en cours');
    });

    it('choix 0 → quitter', async () => {
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '0' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('Au revoir');
    });

    it('choix invalide → erreur + menu', async () => {
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '9' }));
      expect(result.continueSession).toBe(true);
      expect(result.response).toContain('Choix invalide');
    });
  });

  describe('Flux inscription multi-étapes', () => {
    const sessionId = 'inscription-test';

    it('inscription complète : prénom → nom → niveau → secteur → région', async () => {
      await handleUSSD(makeSession({ sessionId, text: '' }));
      await handleUSSD(makeSession({ sessionId, text: '1' }));

      const step2 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou' }));
      expect(step2.continueSession).toBe(true);
      expect(step2.response).toContain('nom de famille');

      const step3 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou*Koné' }));
      expect(step3.continueSession).toBe(true);
      expect(step3.response).toContain("Niveau d'étude");

      const step4 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou*Koné*3' }));
      expect(step4.continueSession).toBe(true);
      expect(step4.response).toContain("Secteur d'intérêt");

      const step5 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou*Koné*3*3' }));
      expect(step5.continueSession).toBe(true);
      expect(step5.response).toContain('région');

      // Mock prisma.jeune.upsert for saving
      mockUpsert.mockResolvedValueOnce({ id: 'new-jeune' });
      const step6 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou*Koné*3*3*1' }));
      expect(step6.continueSession).toBe(false);
      expect(step6.response).toContain('Inscription réussie');
      expect(step6.response).toContain('Amadou');

      // Verify prisma.jeune.upsert was called
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { telephone: '+2250701020304' },
          create: expect.objectContaining({
            telephone: '+2250701020304',
            prenom: 'Amadou',
            nom: 'Koné',
            niveau: 'BAC',
            specialite: 'Tech/Numérique',
            district: 'Abidjan',
          }),
        })
      );
    });

    it('erreur niveau invalide', async () => {
      const sid = 'test-niveau-invalide';
      await handleUSSD(makeSession({ sessionId: sid, text: '' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont' }));

      const result = await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont*9' }));
      expect(result.continueSession).toBe(true);
      expect(result.response).toContain('Choix invalide');
    });

    it('erreur secteur invalide', async () => {
      const sid = 'test-secteur-invalide';
      await handleUSSD(makeSession({ sessionId: sid, text: '' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont*1' }));

      const result = await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont*1*9' }));
      expect(result.continueSession).toBe(true);
      expect(result.response).toContain('Choix invalide');
    });

    it('erreur région invalide', async () => {
      const sid = 'test-region-invalide';
      await handleUSSD(makeSession({ sessionId: sid, text: '' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont*2' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont*2*1' }));

      const result = await handleUSSD(makeSession({ sessionId: sid, text: '1*Jean*Dupont*2*1*9' }));
      expect(result.continueSession).toBe(true);
      expect(result.response).toContain('Choix invalide');
    });

    it('erreur de sauvegarde → message d\'erreur', async () => {
      const sid = 'test-erreur-db';
      await handleUSSD(makeSession({ sessionId: sid, text: '' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Fatou' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Fatou*Diallo' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Fatou*Diallo*1' }));
      await handleUSSD(makeSession({ sessionId: sid, text: '1*Fatou*Diallo*1*2' }));

      mockUpsert.mockRejectedValueOnce(new Error('DB connection failed'));
      const result = await handleUSSD(makeSession({ sessionId: sid, text: '1*Fatou*Diallo*1*2*3' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('Erreur');
    });
  });
});
