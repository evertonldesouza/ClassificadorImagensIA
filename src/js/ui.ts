/**
 * Camada de interface do usuário: referências aos elementos DOM,
 * utilitários de toast, tema (claro/escuro) e modal de confirmação.
 * Mantida separada da lógica de negócio para facilitar manutenção.
 */

import { traduzir } from './i18n.ts';
import { listarHistorico } from './history.ts';

/** Referências aos elementos DOM usados pela aplicação. */
export const els: Record<string, HTMLElement | null> = {
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
 * @param message - Mensagem a exibir.
 * @param type - Tipo do toast.
 * @param duration - Duração em milissegundos.
 */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' | undefined = undefined,
  duration = 3500,
): void {
  const t = document.createElement('div');
  t.className = `toast ${
    type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''
  }`;
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
 * @param texto - Texto a copiar.
 * @returns true se copiado com sucesso.
 */
export async function copiarParaClipboard(texto: string): Promise<boolean> {
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
 * @returns true se o tema claro estiver ativo.
 */
export function toggleTheme(): boolean {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('ia_tema', isLight ? 'light' : 'dark');
  atualizarIconeTema(isLight);
  return isLight;
}

/**
 * Aplica o tema salvo (ou a preferência do sistema) na carga inicial.
 * @returns true se o tema claro estiver ativo.
 */
export function checkInitialTheme(): boolean {
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
 * @param isLight - true se o tema claro estiver ativo.
 */
export function atualizarIconeTema(isLight: boolean): void {
  const iconMoon = document.getElementById('theme-icon-moon');
  const iconSun = document.getElementById('theme-icon-sun');
  const btn = els.themeToggle as HTMLButtonElement;
  if (!btn) {return;}

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
 * @param estado - 'loading' | 'ready' | 'error'
 * @param texto - Texto a exibir.
 */
export function setModelStatus(estado: 'loading' | 'ready' | 'error', texto: string): void {
  const statusModelo = els.statusModelo as HTMLElement;
  const statusModeloText = els.statusModeloText as HTMLElement;
  statusModelo.className = `status-${estado}`;
  statusModeloText.textContent = texto;
}

/**
 * Mostra/esconde a barra de progresso do modelo e atualiza valores.
 *
 * @param percent - Percentual (0-100).
 * @param texto - Texto opcional.
 */
export function atualizarProgresso(percent: number, texto = ''): void {
  const bar = els.modeloProgressoBar as HTMLElement;
  const text = els.modeloProgressoText as HTMLElement;
  bar.style.width = `${percent}%`;
  text.textContent = texto || '';
}

/**
 * Cria e exibe um modal de confirmação para limpar o histórico.
 *
 * @param onConfirm - Callback executado ao confirmar.
 */
export function mostrarModalConfirmacao(onConfirm: () => void): void {
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

  const cancelar = overlay.querySelector('#modal-cancel') as HTMLButtonElement;
  const confirmar = overlay.querySelector('#modal-confirm') as HTMLButtonElement;
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
export function renderHistoricoUI(): void {
  const arr = listarHistorico();
  const historico = els.historico as HTMLElement;
  const historicoLista = els.historicoLista as HTMLElement;
  const estatisticas = els.estatisticas as HTMLElement;
  const totalAnalises = els.totalAnalises as HTMLElement;
  const maisFrequente = els.maisFrequente as HTMLElement;

  if (!arr.length) {
    historico.classList.add('hidden');
    return;
  }

  historico.classList.remove('hidden');
  historicoLista.innerHTML = '';

  arr.forEach((h) => {
    const div = document.createElement('div');
    div.className = 'historico-item';
    const topResult =
      h.results && h.results[0]
        ? traduzir(h.results[0].className)
        : '—';
    div.innerHTML = `
      <div>
        <div class="historico-item-nome">${h.nome || 'Imagem'}</div>
        <div class="historico-item-data">${new Date(h.date).toLocaleString()}</div>
      </div>
      <div class="historico-item-resultado">${topResult}</div>`;
    historicoLista.appendChild(div);
  });

  estatisticas.classList.remove('hidden');
  totalAnalises.textContent = String(arr.length);

  const freq: Record<string, number> = {};
  arr.forEach((item) => {
    const top = item.results?.[0]?.className || null;
    if (!top) {return;}
    freq[top] = (freq[top] || 0) + 1;
  });
  const mais = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || '-';
  maisFrequente.textContent = mais;
}
