/**
 * Tests unitaires — Sigmund API Client
 * Teste les fonctions helper et les appels API mockés
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Créer les mocks en dehors pour les partager
const mockPost = vi.fn();
const mockGet = vi.fn();
const mockSmsSend = vi.fn();

// Mock axios au niveau module
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
      get: mockGet,
    })),
  },
}));

// Mock sms-service
vi.mock('@/lib/sms-service', () => ({
  smsService: {
    sendTestLink: (...args: unknown[]) => mockSmsSend(...args),
  },
}));

import { creerSessionEvaluation, getResultatSession, envoyerLienTestSMS } from '@/lib/sigmund';

describe('Sigmund API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSmsSend.mockReset();
  });

  describe('creerSessionEvaluation', () => {
    it('crée une session avec les bons paramètres', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          session_id: 'sig-session-123',
          test_url: 'https://sigmund.com/test/abc',
        },
      });

      const result = await creerSessionEvaluation({
        candidatId: 'cand-1',
        telephone: '+2250701020304',
        prenom: 'Amadou',
        nom: 'Koné',
        email: 'amadou@test.com',
        typeEvaluation: 'COMPLET',
      });

      expect(result.candidatId).toBe('cand-1');
      expect(result.sessionId).toBe('sig-session-123');
      expect(result.status).toBe('PENDING');
      expect(result.lienTest).toBe('https://sigmund.com/test/abc');
      expect(result.createdAt).toBeDefined();

      expect(mockPost).toHaveBeenCalledWith('/sessions', expect.objectContaining({
        candidate: expect.objectContaining({
          external_id: 'cand-1',
          phone: '+2250701020304',
          first_name: 'Amadou',
          last_name: 'Koné',
        }),
        assessment_type: 'full_assessment',
        language: 'fr',
      }));
    });

    it('mappe correctement les types d\'évaluation', async () => {
      const types = [
        { input: 'BIG_FIVE', expected: 'big_five' },
        { input: 'RIASEC', expected: 'riasec' },
        { input: 'SOFT_SKILLS', expected: 'soft_skills' },
        { input: 'MOTIVATION', expected: 'motivation' },
        { input: 'COMPLET', expected: 'full_assessment' },
      ] as const;

      for (const { input, expected } of types) {
        mockPost.mockResolvedValueOnce({
          data: { session_id: 'test', test_url: 'https://test.com' },
        });

        await creerSessionEvaluation({
          candidatId: 'c1',
          telephone: '+225000',
          prenom: 'Test',
          nom: 'User',
          typeEvaluation: input,
        });

        expect(mockPost).toHaveBeenLastCalledWith('/sessions', expect.objectContaining({
          assessment_type: expected,
        }));
      }
    });

    it('gère les erreurs API gracieusement', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network Error'));

      await expect(creerSessionEvaluation({
        candidatId: 'c1',
        telephone: '+225000',
        prenom: 'Test',
        nom: 'User',
        typeEvaluation: 'COMPLET',
      })).rejects.toThrow('Network Error');
    });
  });

  describe('getResultatSession', () => {
    it('récupère un résultat complété avec Big Five et RIASEC', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          external_id: 'cand-1',
          session_id: 'sig-123',
          status: 'completed',
          test_url: 'https://test.com',
          created_at: '2026-01-01',
          completed_at: '2026-01-02',
          results: {
            big_five: {
              openness: 75,
              conscientiousness: 80,
              extraversion: 60,
              agreeableness: 70,
              neuroticism: 30,
            },
            riasec: {
              realistic: 40,
              investigative: 60,
              artistic: 80,
              social: 70,
              enterprising: 50,
              conventional: 30,
              holland_code: 'ASI',
            },
            profile_summary: 'Profil créatif et social',
            recommendations: ['Formation design', 'Métier social'],
          },
        },
      });

      const result = await getResultatSession('sig-123');

      expect(result.status).toBe('COMPLETED');
      expect(result.resultats).toBeDefined();
      expect(result.resultats?.bigFive?.ouverture).toBe(75);
      expect(result.resultats?.bigFive?.conscienciosite).toBe(80);
      expect(result.resultats?.riasec?.code_holland).toBe('ASI');
      expect(result.resultats?.profil_global).toBe('Profil créatif et social');
      expect(result.resultats?.recommandations).toHaveLength(2);
    });

    it('récupère un résultat en cours (sans résultats)', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          external_id: 'cand-2',
          session_id: 'sig-456',
          status: 'in_progress',
          test_url: 'https://test.com',
          created_at: '2026-01-01',
        },
      });

      const result = await getResultatSession('sig-456');
      expect(result.status).toBe('IN_PROGRESS');
      expect(result.resultats).toBeUndefined();
    });

    it('mappe les statuts correctement', async () => {
      const statuts = [
        { api: 'pending', expected: 'PENDING' },
        { api: 'in_progress', expected: 'IN_PROGRESS' },
        { api: 'completed', expected: 'COMPLETED' },
        { api: 'expired', expected: 'EXPIRED' },
        { api: 'unknown_status', expected: 'PENDING' },
      ];

      for (const { api, expected } of statuts) {
        mockGet.mockResolvedValueOnce({
          data: {
            external_id: 'c',
            session_id: 's',
            status: api,
            test_url: '',
            created_at: '',
          },
        });

        const result = await getResultatSession('s');
        expect(result.status).toBe(expected);
      }
    });
  });

  describe('envoyerLienTestSMS', () => {
    it('envoie un SMS avec le lien de test via smsService', async () => {
      mockSmsSend.mockResolvedValueOnce({ success: true });

      const result = await envoyerLienTestSMS('+2250701020304', 'https://sigmund.com/test/abc');
      expect(result).toBe(true);
      expect(mockSmsSend).toHaveBeenCalledWith('+2250701020304', 'https://sigmund.com/test/abc');
    });

    it('retourne false en cas d\'erreur', async () => {
      mockSmsSend.mockResolvedValueOnce({ success: false, error: 'SMS failed' });

      const result = await envoyerLienTestSMS('+225000', 'https://test.com');
      expect(result).toBe(false);
    });
  });
});
