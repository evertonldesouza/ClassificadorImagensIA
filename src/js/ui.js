/**
 * Camada de interface do usuário: referências aos elementos DOM,
 * utilitários de toast, tema (claro/escuro) e modal de confirmação.
 * Mantida separada da lógica de negócio para facilitar manutenção.
 */

import { traduzir } from './i18n.js';
import { listarHistorico } from './history.js';

/** Referências aos elementos DOM usados pela aplicação. */
export const els = {
  btnWebcam: document.getElementById('btn-webcam'),
  btnUpload: document.getElementById('btn-upload'),
  uploadInput: document.getElementById('upload-imagem'),
  areaUpload: document.getElementById('area-upload'),
  imagemPreview: document.getElementById('imagem-preview'),
  videoPreview: document.getElementById('video-preview'),
  bboxCanvas: document.getElementById('bbox-canvas'),
  previewWrapper: document.getElementById('preview-wrapper'),
  resultado: document.getElementById('resultado'),
  acoesResultado: document.getElementById('acoes-resultado'),
  historico: document.getElementById('historico'),
  historicoLista: document.getElementById('historico-lista'),
  estatisticas: document.getElementById('estatisticas'),
  statusModelo: document.getElementById('status-modelo'),
  statusModeloText: document.getElementById('status-modelo-text'),
  modeloSelect: document.getElementById('modelo-select'),
  modeloProgresso: document.getElementById('modelo-progresso'),
  modeloProgressoBar: document.getElementById('modelo-progresso-bar'),
  modeloProgressoText: document.getElementById('modelo-progresso-text'),
  btnCapturar: document.getElementById('btn-capturar'),
  btnTrocarCamera: document.getElementById('btn-trocar-camera'),
  btnParar: document.getElementById('btn-parar'),
  btnCompartilhar: document.getElementById('btn-compartilhar'),
  btnDownload: document.getElementById('btn-download'),
  btnLimpar: document.getElementById('btn-limpar'),
  btnLimparHistorico: document.getElementById('btn-limpar-historico'),
  btnExportHistorico: document.getElementById('btn-export-historico'),
  themeToggle: document.getElementById('theme-toggle'),
  totalAnalises: document.getElementById('total-analises'),
  maisFrequente: document.getElementById('mais-frequente'),
  confThreshold: document.getElementById('conf-threshold'),
  confThresholdValue: document.getElementById('conf-threshold-value'),
  modalContainer: document.getElementById('modal-container'),
  swBanner: document.getElementById('sw-update-banner'),
  btnSwUpdate: document.getElementById('btn-sw-update'),
  btnModeloMobileNet: document.querySelector('.modelo-card[data-model="mobilenet"]'),
  btnModeloCoco: document.querySelector('.modelo-card[data-model="coco-ssd"]'),
};

/**
 * Exibe um toast (notificação temporária) na tela.
 *
 * @param {string} message - Mensagem a exibir.
 * @param {'success'|'error'|'warning'|undefined} type - Tipo do toast.
 * @param {number} [duration=3500] - Duração em milissegundos.
 */
export function showToast(message, type, duration = 3500) {
  const t = document.createElement('div');
  t.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
  t.textContent = message;
  t.setAttribute('role', 'alert');
  document.body.appendChild(t);

  setTimeout(() => {
    t.classList.add('removing');
    setTimeout(() => t.remove(), 300);
  }, duration - 300);
}

/**
 * Copia um texto para a área de transferência (Clipboard API).
 *
 * @param {string} texto - Texto a copiar.
 * @returns {Promise<boolean>} true se copiado com sucesso.
 */
export async function copiarParaClipboard(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Fallback para navegadores antigos
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    textarea.remove();
    return ok;
  }
}

/**
 * Alterna entre tema claro e escuro, persistindo a escolha.
 */
export function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('ia_tema', isLight ? 'light' : 'dark');
  atualizarIconeTema(isLight);
  return isLight;
}

/**
 * Aplica o tema salvo (ou a preferência do sistema) na carga inicial.
 */
export function checkInitialTheme() {
  const temaSalvo = localStorage.getItem('ia_tema');
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  const isLight = temaSalvo ? temaSalvo === 'light' : prefersLight;
  if (isLight) {
    document.body.classList.add('light');
  }
  atualizarIconeTema(isLight);
  return isLight;
}

/**
 * Atualiza os ícones (lua/sol) e o título do botão de tema.
 *
 * @param {boolean} isLight - true se o tema claro estiver ativo.
 */
export function atualizarIconeTema(isLight) {
  const iconMoon = document.getElementById('theme-icon-moon');
  const iconSun = document.getElementById('theme-icon-sun');
  const btn = els.themeToggle;

  if (isLight) {
    iconMoon?.classList.add('hidden');
    iconSun?.classList.remove('hidden');
    btn.title = 'Alternar para tema escuro';
  } else {
    iconMoon?.classList.remove('hidden');
    iconSun?.classList.add('hidden');
    btn.title = 'Alternar para tema claro';
  }
}

/**
 * Renderiza o estado de carregamento/pronto/erro do modelo.
 *
 * @param {'loading'|'ready'|'error'} estado
 * @param {string} texto
 */
export function setModelStatus(estado, texto) {
  const { statusModelo, statusModeloText } = els;
  statusModelo.className = `status-${estado}`;
  statusModeloText.textContent = texto;
}

/**
 * Mostra/esconde a barra de progresso do modelo e atualiza valores.
 *
 * @param {number} percent
 * @param {string} texto
 */
export function atualizarProgresso(percent, texto = '') {
  els.modeloProgressoBar.style.width = `${percent}%`;
  els.modeloProgressoText.textContent = texto || '';
}

/**
 * Cria e exibe um modal de confirmação para limpar o histórico.
 *
 * @param {Function} onConfirm - Callback executado ao confirmar.
 */
export function mostrarModalConfirmacao(onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>Limpar histórico?</h3>
      <p>Esta ação não pode ser desfeita. Todas as análises salvas serão removidas.</p>
      <div class="modal-actions">
        <button class="btn-modal-cancel" id="modal-cancel">Cancelar</button>
        <button class="btn-modal-confirm" id="modal-confirm">Limpar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const cancelar = overlay.querySelector('#modal-cancel');
  const confirmar = overlay.querySelector('#modal-confirm');
  cancelar.focus();

  const fechar = () => overlay.remove();

  cancelar.addEventListener('click', fechar);
  confirmar.addEventListener('click', () => {
    onConfirm();
    fechar();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {fechar();}
  });
}

/**
 * Renderiza o histórico de análises e as estatísticas resumidas na UI.
 * Lê os dados do módulo de histórico e atualiza o DOM.
 */
export function renderHistoricoUI() {
  const arr = listarHistorico();

  if (!arr.length) {
    els.historico.classList.add('hidden');
    return;
  }

  els.historico.classList.remove('hidden');
  els.historicoLista.innerHTML = '';

  arr.forEach((h) => {
    const div = document.createElement('div');
    div.className = 'historico-item';
    const topResult =
      h.results && h.results[0]
        ? traduzir(h.results[0].className || h.results[0].class || '')
        : '—';
    div.innerHTML = `
      <div>
        <div class="historico-item-nome">${h.nome || 'Imagem'}</div>
        <div class="historico-item-data">${new Date(h.date).toLocaleString()}</div>
      </div>
      <div class="historico-item-resultado">${topResult}</div>`;
    els.historicoLista.appendChild(div);
  });

  els.estatisticas.classList.remove('hidden');
  els.totalAnalises.textContent = arr.length;

  const freq = {};
  arr.forEach((item) => {
    const top =
      item.results?.[0] ? item.results[0].className || item.results[0].class : null;
    if (!top) {
      return;
    }
    freq[top] = (freq[top] || 0) + 1;
  });
  const mais = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || '-';
  els.maisFrequente.textContent = mais;
}
