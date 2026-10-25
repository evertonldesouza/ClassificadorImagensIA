import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { traduzir } from '../js/i18n.ts';

// --- Mock de localStorage (não existe no ambiente Node puro) ---
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
  store['ia_trad_dog'] = 'cachorro'; // simula entrada já em cache
});

afterEach(() => {
  localStorageMock.clear();
});

describe('traduzir', () => {
  it('deve traduzir rótulos conhecidos do inglês para o português', () => {
    expect(traduzir('dog')).toBe('cachorro');
    expect(traduzir('person')).toBe('pessoa');
    expect(traduzir('cell phone')).toBe('celular');
  });

  it('deve retornar o texto original quando não há tradução', () => {
    expect(traduzir('coisa-desconhecida-xyz')).toBe('coisa-desconhecida-xyz');
    expect(traduzir('')).toBe('');
  });

  it('deve usar o cache do localStorage quando disponível', () => {
    expect(traduzir('dog')).toBe('cachorro');
    expect(localStorageMock.getItem('ia_trad_dog')).toBe('cachorro');
  });

  it('deve tratar entrada não-string sem lançar erro', () => {
    expect(() => traduzir(null as unknown as string)).not.toThrow();
    expect(() => traduzir(undefined as unknown as string)).not.toThrow();
  });
});
