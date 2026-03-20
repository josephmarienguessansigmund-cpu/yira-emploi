/**
 * Tests unitaires — USSD Engine
 * Teste la machine à états du menu USSD sans accès DB
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de la base de données
vi.mock('@/lib/db', () => ({
  default: {},
  query: vi.fn(),
}));

import { handleUSSD } from '@/lib/ussd-engine';
import { query } from '@/lib/db';
import type { USSDSession } from '@/types';

const mockQuery = vi.mocked(query);

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
      // Premier appel pour initialiser la session
      await handleUSSD(makeSession({ text: '' }));
      // Choix 1 = inscription
      const result = await handleUSSD(makeSession({ text: '1' }));
      expect(result.continueSession).toBe(true);
      expect(result.response).toContain('INSCRIPTION YIRA Emploi');
      expect(result.response).toContain('prénom');
    });

    it('choix 2 → offres d\'emploi (aucune offre)', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '2' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('Aucune offre');
    });

    it('choix 2 → offres d\'emploi (avec résultats)', async () => {
      mockQuery.mockResolvedValueOnce([
        { titre: 'Développeur Web', secteur: 'Tech', region: 'Abidjan' },
        { titre: 'Comptable', secteur: 'Finance', region: 'Bouaké' },
      ]);
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '2' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('OFFRES DU MOMENT');
      expect(result.response).toContain('Développeur Web');
      expect(result.response).toContain('Comptable');
    });

    it('choix 3 → résultats SIGMUND (pas de profil)', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '3' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('Aucun profil trouvé');
    });

    it('choix 3 → résultats SIGMUND (test complété)', async () => {
      mockQuery.mockResolvedValueOnce([{
        status: 'COMPLETED',
        profil_global: 'Profil Entrepreneur',
        code_holland: 'ESA',
      }]);
      await handleUSSD(makeSession({ text: '' }));
      const result = await handleUSSD(makeSession({ text: '3' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('VOS RÉSULTATS SIGMUND');
      expect(result.response).toContain('Profil Entrepreneur');
      expect(result.response).toContain('ESA');
    });

    it('choix 3 → résultats SIGMUND (test en cours)', async () => {
      mockQuery.mockResolvedValueOnce([{
        status: 'IN_PROGRESS',
        profil_global: null,
        code_holland: null,
      }]);
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
      // Initialiser session
      await handleUSSD(makeSession({ sessionId, text: '' }));
      // Choix inscription
      await handleUSSD(makeSession({ sessionId, text: '1' }));

      // Étape 2 : prénom
      const step2 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou' }));
      expect(step2.continueSession).toBe(true);
      expect(step2.response).toContain('nom de famille');

      // Étape 3 : nom
      const step3 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou*Koné' }));
      expect(step3.continueSession).toBe(true);
      expect(step3.response).toContain("Niveau d'étude");

      // Étape 4 : niveau (3 = BAC)
      const step4 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou*Koné*3' }));
      expect(step4.continueSession).toBe(true);
      expect(step4.response).toContain("Secteur d'intérêt");

      // Étape 5 : secteur (3 = Tech)
      const step5 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou*Koné*3*3' }));
      expect(step5.continueSession).toBe(true);
      expect(step5.response).toContain('région');

      // Étape 6 : région (1 = Abidjan) → sauvegarde
      mockQuery.mockResolvedValueOnce([]);
      const step6 = await handleUSSD(makeSession({ sessionId, text: '1*Amadou*Koné*3*3*1' }));
      expect(step6.continueSession).toBe(false);
      expect(step6.response).toContain('Inscription réussie');
      expect(step6.response).toContain('Amadou');

      // Vérifier que query a été appelé avec les bons paramètres
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO candidats'),
        expect.arrayContaining(['+2250701020304', 'Amadou', 'Koné', 'BAC', 'Tech/Numérique', 'Abidjan', 'NEET'])
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

      // Simuler une erreur DB
      mockQuery.mockRejectedValueOnce(new Error('DB connection failed'));
      const result = await handleUSSD(makeSession({ sessionId: sid, text: '1*Fatou*Diallo*1*2*3' }));
      expect(result.continueSession).toBe(false);
      expect(result.response).toContain('Erreur');
    });
  });
});
