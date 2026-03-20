/**
 * Tests unitaires — Génération de code YIRA
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  default: {
    talent: {
      findFirst: vi.fn(),
    },
  },
}));

import { genererCodeYira } from '@/lib/yira-code';
import prisma from '@/lib/db';

const mockFindFirst = vi.mocked(prisma.talent.findFirst);

describe('genererCodeYira', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('génère le premier code de l\'année (YIR-YYYY-00001)', async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const code = await genererCodeYira();
    const annee = new Date().getFullYear();
    expect(code).toBe(`YIR-${annee}-00001`);
  });

  it('incrémente à partir du dernier code existant', async () => {
    const annee = new Date().getFullYear();
    mockFindFirst.mockResolvedValueOnce({
      codeYira: `YIR-${annee}-00042`,
    } as any);

    const code = await genererCodeYira();
    expect(code).toBe(`YIR-${annee}-00043`);
  });

  it('gère les numéros élevés (99999)', async () => {
    const annee = new Date().getFullYear();
    mockFindFirst.mockResolvedValueOnce({
      codeYira: `YIR-${annee}-99999`,
    } as any);

    const code = await genererCodeYira();
    expect(code).toBe(`YIR-${annee}-100000`);
  });

  it('utilise l\'année courante', async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const code = await genererCodeYira();
    const annee = new Date().getFullYear();
    expect(code).toMatch(new RegExp(`^YIR-${annee}-\\d{5}$`));
  });

  it('fait la bonne requête Prisma', async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    await genererCodeYira();

    const annee = new Date().getFullYear();
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { codeYira: { startsWith: `YIR-${annee}-` } },
      orderBy: { codeYira: 'desc' },
      select: { codeYira: true },
    });
  });
});
