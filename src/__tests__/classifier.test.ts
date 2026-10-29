import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classificarElemento, comprimirImagem } from '../js/classifier.ts';

// --- Mock do localStorage ---
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => {
    store[k] = String(v);
  },
  removeItem: (k: string) => {
    delete store[k];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  Object.keys(store).forEach((k) => delete store[k]);

  (globalThis.URL as Record<string, unknown>).createObjectURL = vi.fn(() => 'mocked-url');
  (globalThis.URL as Record<string, unknown>).revokeObjectURL = vi.fn(() => undefined);
});

afterEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.restoreAllMocks();
});

describe('comprimirImagem', () => {
  it('deve retornar o arquivo original se for menor que 1.5 MB', async () => {
    const file = new File(['conteúdo pequeno'], 'pequena.jpg', { type: 'image/jpeg' });
    const result = await comprimirImagem(file);
    expect(result).toBe(file);
  });
});

describe('classificarElemento', () => {
  it('deve retornar vazio se o modelo não estiver carregado', async () => {
    const resultados = await classificarElemento(new Image() as HTMLImageElement);
    expect(resultados).toEqual([]);
  });
});
