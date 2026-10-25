import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { traduzir } from '../js/i18n.js';

// --- Mock de localStorage (não existe no ambiente Node puro) ---
const store = {};
const localStorageMock = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => {
    store[k] = String(v);
  },
  removeItem: (k) => {
    delete store[k];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};

beforeEach(() => {
  globalThis.localStorage = localStorageMock;
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
    expect(() => traduzir(null)).not.toThrow();
    expect(() => traduzir(undefined)).not.toThrow();
  });
});
