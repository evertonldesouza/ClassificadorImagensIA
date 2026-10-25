import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  listarHistorico,
  salvarHistoricoEntry,
  limparHistorico,
  exportarHistoricoBlob,
  calcularEstatisticas,
  HistoricoEntry,
} from '../js/history.ts';

// --- Mock de localStorage ---
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
  localStorageMock.clear();
});

afterEach(() => {
  localStorageMock.clear();
});

const entry = (
  nome: string,
  classe = 'dog',
  score = 0.9,
): HistoricoEntry => ({
  nome,
  results: [{ className: classe, probability: score, bbox: [] }],
  date: '2024-01-01T00:00:00.000Z',
});

describe('histórico', () => {
  it('deve começar vazio', () => {
    expect(listarHistorico()).toEqual([]);
  });

  it('deve salvar e listar entradas (mais recente primeiro)', () => {
    salvarHistoricoEntry(entry('img-a.jpg', 'cat', 0.8));
    salvarHistoricoEntry(entry('img-b.jpg', 'dog', 0.9));
    const lista = listarHistorico();
    expect(lista.length).toBe(2);
    expect(lista[0].nome).toBe('img-b.jpg');
    expect(lista[1].nome).toBe('img-a.jpg');
  });

  it('deve cortar entradas excedentes ao limite (50)', () => {
    for (let i = 0; i < 55; i++) {
      salvarHistoricoEntry(entry(`img-${i}.jpg`));
    }
    expect(listarHistorico().length).toBe(50);
  });

  it('deve limpar todo o histórico', () => {
    salvarHistoricoEntry(entry('x.jpg'));
    expect(listarHistorico().length).toBe(1);
    limparHistorico();
    expect(listarHistorico()).toEqual([]);
  });

  it('deve exportar blob JSON quando há histórico', () => {
    salvarHistoricoEntry(entry('a.jpg'));
    const blob = exportarHistoricoBlob();
    expect(blob).not.toBeNull();
    expect(blob?.type).toBe('application/json');
  });

  it('deve retornar null ao exportar histórico vazio', () => {
    expect(exportarHistoricoBlob()).toBeNull();
  });

  it('deve calcular estatísticas (total e mais frequente)', () => {
    salvarHistoricoEntry(entry('a.jpg', 'dog', 0.9));
    salvarHistoricoEntry(entry('b.jpg', 'dog', 0.8));
    salvarHistoricoEntry(entry('c.jpg', 'cat', 0.7));
    const stats = calcularEstatisticas();
    expect(stats.total).toBe(3);
    expect(stats.maisFrequente).toBe('dog');
  });

  it('deve retornar maisFrequente "-" quando vazio', () => {
    expect(calcularEstatisticas().maisFrequente).toBe('-');
  });
});
