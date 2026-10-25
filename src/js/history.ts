/**
 * Gerenciamento do histórico de análises, persistido em localStorage.
 * Mantém as últimas 50 entradas e expõe funções para salvar, listar,
 * exportar e limpar o histórico, além de calcular estatísticas.
 */

/** Chave de armazenamento no localStorage. */
export const HIST_KEY = 'ia_classificador_historico_v1';

/** Número máximo de entradas mantidas no histórico. */
const MAX_ENTRIES = 50;

/** Tipo de uma entrada de classificação. */
export interface Classificacao {
  className: string;
  probability: number;
  bbox?: number[];
}

/** Tipo de uma entrada do histórico. */
export interface HistoricoEntry {
  nome: string;
  results: Classificacao[];
  date: string;
}

/**
 * Recupera todas as entradas do histórico.
 */
export function listarHistorico(): HistoricoEntry[] {
  try {
    const raw = localStorage.getItem(HIST_KEY);
    return raw ? (JSON.parse(raw) as HistoricoEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Salva uma nova entrada no histórico (inserida no topo) e corta as
 * excedentes ao limite máximo.
 *
 * @param entry - Entrada a salvar.
 * @returns O histórico atualizado.
 */
export function salvarHistoricoEntry(entry: HistoricoEntry): HistoricoEntry[] {
  const arr = listarHistorico();
  arr.unshift(entry);
  if (arr.length > MAX_ENTRIES) {
    arr.splice(MAX_ENTRIES);
  }
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(arr));
  } catch {
    // localStorage indisponível
  }
  return arr;
}

/**
 * Remove todas as entradas do histórico.
 */
export function limparHistorico(): void {
  try {
    localStorage.removeItem(HIST_KEY);
  } catch {
    // localStorage indisponível
  }
}

/**
 * Exporta o histórico como um Blob JSON pronto para download.
 * @returns Blob do histórico ou null se vazio.
 */
export function exportarHistoricoBlob(): Blob | null {
  const arr = listarHistorico();
  if (!arr.length) {
    return null;
  }
  return new Blob([JSON.stringify(arr, null, 2)], {
    type: 'application/json',
  });
}

/**
 * Calcula estatísticas resumidas do histórico.
 */
export interface Estatisticas {
  total: number;
  maisFrequente: string;
}

/**
 * Calcula estatísticas resumidas do histórico.
 */
export function calcularEstatisticas(): Estatisticas {
  const arr = listarHistorico();
  const total = arr.length;

  const freq: Record<string, number> = {};
  arr.forEach((item) => {
    const top = item.results?.[0]?.className || '';
    if (!top) {return;}
    freq[top] = (freq[top] || 0) + 1;
  });

  const maisFrequente =
    Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || '-';

  return { total, maisFrequente };
}
