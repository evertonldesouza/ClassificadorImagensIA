/**
 * Gerenciamento do histórico de análises, persistido em localStorage.
 * Mantém as últimas 50 entradas e expõe funções para salvar, listar,
 * exportar e limpar o histórico, além de calcular estatísticas.
 */

/** Chave de armazenamento no localStorage. */
export const HIST_KEY = 'ia_classificador_historico_v1';

/** Número máximo de entradas mantidas no histórico. */
const MAX_ENTRIES = 50;

/**
 * Recupera todas as entradas do histórico.
 * @returns {Array<{nome: string, results: Array, date: string}>}
 */
export function listarHistorico() {
  try {
    const raw = localStorage.getItem(HIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Salva uma nova entrada no histórico (inserida no topo) e corta as
 * excedentes ao limite máximo.
 *
 * @param {Object} entry
 * @param {string} entry.nome - Nome da imagem / origem da análise.
 * @param {Array} entry.results - Resultados da classificação.
 * @param {string} entry.date - Data/hora em ISO 8601.
 */
export function salvarHistoricoEntry(entry) {
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
export function limparHistorico() {
  try {
    localStorage.removeItem(HIST_KEY);
  } catch {
    // localStorage indisponível
  }
}

/**
 * Exporta o histórico como um Blob JSON pronto para download.
 * @returns {Blob|null} Blob do histórico ou null se vazio.
 */
export function exportarHistoricoBlob() {
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
 * @returns {{total: number, maisFrequente: string}}
 */
export function calcularEstatisticas() {
  const arr = listarHistorico();
  const total = arr.length;

  const freq = {};
  arr.forEach((item) => {
    const results = item.results;
    const top = results && results[0]
      ? results[0].className || results[0].class || ''
      : '';
    if (!top) {return;}
    freq[top] = (freq[top] || 0) + 1;
  });

  const maisFrequente =
    Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || '-';

  return { total, maisFrequente };
}
