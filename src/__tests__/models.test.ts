import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { carregarModelo, getModelo, getModeloName, habilitarControles } from '../js/models.ts';

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
});

afterEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.restoreAllMocks();
});

describe('getModeloName', () => {
  it('deve retornar mobilenet como padrão', () => {
    expect(getModeloName()).toBe('mobilenet');
  });
});

describe('getModelo', () => {
  it('deve retornar null antes de qualquer modelo ser carregado', () => {
    expect(getModelo()).toBeNull();
  });
});

describe('habilitarControles', () => {
  it('deve não lançar erro quando elementos não existem', () => {
    // habilitarControles acessa elementos DOM que podem não existir em jsdom
    expect(() => habilitarControles(true)).not.toThrow();
    expect(() => habilitarControles(false)).not.toThrow();
  });
});

describe('carregarModelo', () => {
  it('deve falhar com erro claro se o módulo mobilenet não estiver disponível', async () => {
    // Testa que a função existe e é assíncrona
    const promise = carregarModelo('mobilenet');
    await expect(promise).rejects.toThrow();
  });
});

describe('seleção de modelo', () => {
  it('getModeloName deve retornar mobilenet inicialmente', () => {
    expect(getModeloName()).toBe('mobilenet');
  });
});

describe('integração models com localStorage', () => {
  it('não deve depender de localStorage para funcionamento básico', () => {
    expect(getModeloName()).toBe('mobilenet');
    expect(getModelo()).toBeNull();
  });
});
