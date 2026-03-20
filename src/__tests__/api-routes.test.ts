/**
 * Tests unitaires — API Routes
 * Teste les endpoints sans DB réelle (mocks Prisma)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  jeune: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  testSigmund: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  paiement: {
    update: vi.fn(),
  },
};

vi.mock('@/lib/db', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
  query: vi.fn(),
}));

vi.mock('@/lib/yira-code', () => ({
  genererCodeYira: vi.fn().mockResolvedValue('YIR-2026-00001'),
}));

vi.mock('@/lib/sigmund', () => ({
  creerSessionEvaluation: vi.fn().mockResolvedValue({
    candidatId: 'cand-1',
    sessionId: 'sig-123',
    status: 'PENDING',
    lienTest: 'https://sigmund.com/test/abc',
    createdAt: '2026-01-01',
  }),
}));

// Helper pour créer des NextRequest mockés
function createJsonRequest(url: string, body: unknown, method = 'POST') {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================================
  // API /api/inscription
  // =============================================
  describe('POST /api/inscription', () => {
    it('refuse si champs obligatoires manquants', async () => {
      const { POST } = await import('@/app/api/inscription/route');
      const req = createJsonRequest('http://localhost/api/inscription', {
        prenom: 'Test',
        // manque nom, telephone, etc.
      });

      const response = await POST(req as any);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('refuse si consentement RGPD manquant', async () => {
      const { POST } = await import('@/app/api/inscription/route');
      const req = createJsonRequest('http://localhost/api/inscription', {
        prenom: 'Amadou',
        nom: 'Koné',
        telephone: '0701020304',
        dateNaissance: '2000-01-15',
        genre: 'M',
        niveau: 'BAC',
        district: 'Abidjan',
        consentementRGPD: false,
      });

      const response = await POST(req as any);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toContain('consentement');
    });

    it('refuse si téléphone déjà inscrit (409)', async () => {
      const { POST } = await import('@/app/api/inscription/route');

      mockPrisma.jeune.findUnique.mockResolvedValueOnce({ id: 'existing' });

      const req = createJsonRequest('http://localhost/api/inscription', {
        prenom: 'Amadou',
        nom: 'Koné',
        telephone: '0701020304',
        dateNaissance: '2000-01-15',
        genre: 'M',
        niveau: 'BAC',
        district: 'Abidjan',
        consentementRGPD: true,
      });

      const response = await POST(req as any);
      expect(response.status).toBe(409);
    });

    it('inscription réussie avec code YIRA', async () => {
      const { POST } = await import('@/app/api/inscription/route');

      mockPrisma.jeune.findUnique.mockResolvedValueOnce(null);
      mockPrisma.jeune.create.mockResolvedValueOnce({
        id: 'new-id',
        prenom: 'Amadou',
        nom: 'Koné',
        codeYira: 'YIR-2026-00001',
      });

      const req = createJsonRequest('http://localhost/api/inscription', {
        prenom: 'Amadou',
        nom: 'Koné',
        telephone: '0701020304',
        email: 'amadou@test.com',
        dateNaissance: '2000-01-15',
        genre: 'M',
        niveau: 'BAC',
        specialite: 'Informatique',
        situationActuelle: 'NEET',
        district: 'Abidjan',
        commune: 'Cocody',
        quartier: 'Riviera',
        zoneGeo: 'urbain',
        canalPrefere: 'sms',
        consentementRGPD: true,
      });

      const response = await POST(req as any);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.codeYira).toBe('YIR-2026-00001');
    });

    it('normalise le téléphone 0XXXXXXXXX → +225XXXXXXXXX', async () => {
      const { POST } = await import('@/app/api/inscription/route');

      mockPrisma.jeune.findUnique.mockResolvedValueOnce(null);
      mockPrisma.jeune.create.mockResolvedValueOnce({
        id: 'id',
        prenom: 'Test',
        nom: 'User',
        codeYira: 'YIR-2026-00001',
      });

      const req = createJsonRequest('http://localhost/api/inscription', {
        prenom: 'Test',
        nom: 'User',
        telephone: '0701020304',
        dateNaissance: '2000-01-15',
        genre: 'M',
        niveau: 'BAC',
        district: 'Abidjan',
        consentementRGPD: true,
      });

      await POST(req as any);

      expect(mockPrisma.jeune.findUnique).toHaveBeenCalledWith({
        where: { telephone: '+225701020304' },
      });
    });
  });

  // =============================================
  // API /api/candidat
  // =============================================
  describe('GET /api/candidat', () => {
    it('retourne 400 si téléphone manquant', async () => {
      const { GET } = await import('@/app/api/candidat/route');
      const req = new Request('http://localhost/api/candidat');
      const response = await GET(req as any);
      expect(response.status).toBe(400);
    });

    it('retourne 404 si candidat non trouvé', async () => {
      const { GET } = await import('@/app/api/candidat/route');
      mockPrisma.jeune.findUnique.mockResolvedValueOnce(null);

      const req = new Request('http://localhost/api/candidat?telephone=0701020304');
      const response = await GET(req as any);
      expect(response.status).toBe(404);
    });

    it('retourne le candidat trouvé', async () => {
      const { GET } = await import('@/app/api/candidat/route');
      mockPrisma.jeune.findUnique.mockResolvedValueOnce({
        id: 'c1',
        prenom: 'Amadou',
        nom: 'Koné',
      });

      const req = new Request('http://localhost/api/candidat?telephone=0701020304');
      const response = await GET(req as any);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.prenom).toBe('Amadou');
    });
  });

  // =============================================
  // API /api/sigmund/session
  // =============================================
  describe('POST /api/sigmund/session', () => {
    it('retourne 400 si champs requis manquants', async () => {
      const { POST } = await import('@/app/api/sigmund/session/route');
      const req = createJsonRequest('http://localhost/api/sigmund/session', {
        candidatId: 'c1',
        // manque telephone, prenom, nom
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it('crée une session Sigmund avec succès', async () => {
      const { POST } = await import('@/app/api/sigmund/session/route');
      const req = createJsonRequest('http://localhost/api/sigmund/session', {
        candidatId: 'c1',
        telephone: '+2250701020304',
        prenom: 'Amadou',
        nom: 'Koné',
        typeEvaluation: 'BIG_FIVE',
      });

      const response = await POST(req as any);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sessionId).toBe('sig-123');
      expect(data.data.lienTest).toBeDefined();
    });
  });

  // =============================================
  // API /api/sigmund/webhook
  // =============================================
  describe('POST /api/sigmund/webhook', () => {
    it('retourne 400 si session_id manquant', async () => {
      const { POST } = await import('@/app/api/sigmund/webhook/route');
      const req = createJsonRequest('http://localhost/api/sigmund/webhook', {});
      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it('gère un webhook pour session inconnue', async () => {
      const { POST } = await import('@/app/api/sigmund/webhook/route');
      mockPrisma.testSigmund.findFirst.mockResolvedValueOnce(null);

      const req = createJsonRequest('http://localhost/api/sigmund/webhook', {
        session_id: 'unknown',
        status: 'completed',
      });

      const response = await POST(req as any);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('met à jour le test quand status = completed', async () => {
      const { POST } = await import('@/app/api/sigmund/webhook/route');
      mockPrisma.testSigmund.findFirst.mockResolvedValueOnce({
        id: 'test-1',
        sigmundTestId: 'sig-123',
      });
      mockPrisma.testSigmund.update.mockResolvedValueOnce({});

      const results = { big_five: { openness: 75 } };
      const req = createJsonRequest('http://localhost/api/sigmund/webhook', {
        session_id: 'sig-123',
        status: 'completed',
        results,
      });

      const response = await POST(req as any);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockPrisma.testSigmund.update).toHaveBeenCalledWith({
        where: { id: 'test-1' },
        data: {
          completedAt: expect.any(Date),
          rapport: JSON.stringify(results),
        },
      });
    });
  });
});
